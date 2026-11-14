"use client";

// Remembers the catalog's "Hide sold items" choice on this device.
const KEY = "cas_hide_sold";

export function getHideSoldPreference(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false; // storage blocked (private mode etc.)
  }
}

export function setHideSoldPreference(hide: boolean) {
  try {
    localStorage.setItem(KEY, hide ? "1" : "0");
  } catch {
    // ignore: preference just won't persist
  }
}
