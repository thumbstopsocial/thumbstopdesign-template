"use client";

import { useSyncExternalStore } from "react";

/**
 * Cookie consent state and Google Consent Mode updates, unstyled.
 * components/site/ConsentBanner renders the banner from useConsent().
 * Accept and Reject must be given equal weight in the design.
 */

import { CONSENT_KEY } from "./consent-key";


export type ConsentChoice = "granted" | "denied" | null;

type Snapshot = { key: string; choice: ConsentChoice | undefined; settingsOpen: boolean };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

let settingsOpen = false;
const listeners = new Set<() => void>();
let snapshot: Snapshot | null = null;
const SERVER_SNAPSHOT: Snapshot = { key: "server", choice: undefined, settingsOpen: false };

function readChoice(): ConsentChoice {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Snapshot {
  const choice = readChoice();
  const key = `${choice}|${settingsOpen}`;
  if (!snapshot || snapshot.key !== key) snapshot = { key, choice, settingsOpen };
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function updateConsentMode(choice: "granted" | "denied") {
  const state = {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  };
  window.gtag?.("consent", "update", state);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "consent_update", consent: choice });
}

function decide(choice: "granted" | "denied") {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  updateConsentMode(choice);
  settingsOpen = false;
  emit();
}

/** Reopen the banner, e.g. from a "Cookie settings" link in the footer. */
export function openConsentSettings() {
  settingsOpen = true;
  emit();
}

export function useConsent() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    choice: snap.choice,
    /** Show the banner when no choice has been made, or settings were reopened. Never on the server. */
    visible: snap.choice === null || snap.settingsOpen,
    accept: () => decide("granted"),
    reject: () => decide("denied"),
  };
}
