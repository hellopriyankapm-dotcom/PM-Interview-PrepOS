"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const PROBE_KEY = "prepos-storage-probe";

export function StorageWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROBE_KEY, "1");
      window.localStorage.removeItem(PROBE_KEY);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="storage-warning" role="alert">
      <AlertTriangle size={16} aria-hidden="true" />
      <span>
        Your browser is blocking local storage — likely private/incognito mode. Your calibration and
        rep history won&apos;t persist across sessions.
      </span>
      <button
        type="button"
        className="storage-warning-close"
        onClick={() => setShow(false)}
        aria-label="Dismiss warning"
      >
        <X size={14} />
      </button>
    </div>
  );
}
