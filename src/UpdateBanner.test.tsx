import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpdateBanner } from "./components/UpdateBanner.tsx";

const serveVersion = (version: string) =>
  vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ version })));

afterEach(() => vi.unstubAllGlobals());

describe("new version banner", () => {
  it("offers a reload when a newer build is live", async () => {
    serveVersion("a-newer-build");
    render(<UpdateBanner />);
    expect(await screen.findByRole("button", { name: /Ny version av Gamepick/ })).toBeInTheDocument();
  });

  it("stays hidden while the running build is the latest", async () => {
    serveVersion(__APP_VERSION__);
    render(<UpdateBanner />);
    // Let the check resolve before asserting nothing appeared.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("button", { name: /Ny version/ })).not.toBeInTheDocument();
  });
});
