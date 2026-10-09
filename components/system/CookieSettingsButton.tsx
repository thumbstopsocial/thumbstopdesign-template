"use client";

import type { ButtonHTMLAttributes } from "react";
import { openConsentSettings } from "./consent";

/** Reopens the cookie banner. Style it per client by passing className. */
export function CookieSettingsButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} onClick={() => openConsentSettings()}>
      {props.children ?? "Cookie settings"}
    </button>
  );
}
