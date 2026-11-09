"use client";

import { browserClient } from "./supabase";

type EventType = "cv_download" | "project_click" | "contact_click" | "chat_open" | "social_click" | "document_download" | "credential_click";

export function sessionId(): string {
  try {
    let id = sessionStorage.getItem("sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sid", id);
    }
    return id;
  } catch {
    return "";
  }
}

export function trackView(path: string) {
  const device = window.matchMedia("(max-width: 640px)").matches ? "mobile" : window.matchMedia("(max-width: 1024px)").matches ? "tablette" : "ordinateur";
  let referrer = "";
  try {
    if (document.referrer) {
      const r = new URL(document.referrer);
      if (r.host !== location.host) referrer = r.host;
    }
  } catch {}
  void browserClient().from("page_views").insert({ path, referrer, device, session_id: sessionId() }).then(() => {});
}

export function track(type: EventType, label = "") {
  void browserClient().from("events").insert({ type, label: label.slice(0, 200), session_id: sessionId() }).then(() => {});
}
