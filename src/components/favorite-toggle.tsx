"use client";

import { useState, useTransition } from "react";

interface FavoriteToggleProps {
  templateSlug: string;
  initiallySaved: boolean;
}

interface FavoriteResponse {
  saved: boolean;
  error?: string;
}

export function FavoriteToggle({
  templateSlug,
  initiallySaved
}: FavoriteToggleProps) {
  const [saved, setSaved] = useState(initiallySaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(): void {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/templates/${templateSlug}/favorite`, {
        method: saved ? "DELETE" : "POST"
      });
      const payload = (await response.json().catch(() => null)) as
        | FavoriteResponse
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not update saved templates.");
        return;
      }

      setSaved(Boolean(payload?.saved));
    });
  }

  return (
    <div className="favorite-actions">
      <button type="button" className="btn-ghost" onClick={handleToggle} disabled={isPending}>
        {saved ? "Remove from favorites" : "Save template"}
      </button>
      {error ? <p className="error-message">{error}</p> : null}
    </div>
  );
}
