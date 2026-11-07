/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script web app url for votes (apps-script/Code.gs). Unset → voting is hidden. */
  readonly VITE_VOTES_URL?: string;
}

/** Unique per build; compared against version.json to detect a newer deploy. */
declare const __APP_VERSION__: string;
