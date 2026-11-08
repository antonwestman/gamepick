import { useEffect, useEffectEvent } from "react";
import { tiltOf } from "./pannlappen.ts";

/** iOS 13+ hides motion sensors behind a permission prompt; other browsers don't have the method. */
type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

/** Must be called from a tap (iOS only shows the prompt for user gestures). */
export async function requestTiltPermission(): Promise<boolean> {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  const event: OrientationEventWithPermission = DeviceOrientationEvent;
  if (!event.requestPermission) return true;
  try {
    return (await event.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

/**
 * Calls `onTilt` when the phone is tipped forward ("down") or back ("up").
 * The phone has to be upright again before the next tilt counts, and every
 * time `enabled` turns on it starts over – so one nod is one answer.
 */
export function useTilt(enabled: boolean, onTilt: (direction: "down" | "up") => void) {
  const handleTilt = useEffectEvent(onTilt);

  useEffect(() => {
    if (!enabled) return;
    let armed = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      const tilt = tiltOf(event.beta, event.gamma);
      if (tilt === "level") {
        armed = true;
      } else if (armed && (tilt === "down" || tilt === "up")) {
        armed = false;
        handleTilt(tilt);
      }
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [enabled]);
}

/** Keeps the screen on while `active` – a dimmed phone on your forehead is no fun. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let released = false;
    navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        if (released) void sentinel.release();
        else lock = sentinel;
      })
      .catch(() => {
        // Low battery mode etc. – the game still works.
      });
    return () => {
      released = true;
      void lock?.release();
    };
  }, [active]);
}
