"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface SellerResponseFormProps {
  templateSlug: string;
  reviewId: string;
  initialResponse?: string;
}

export function SellerResponseForm({
  templateSlug,
  reviewId,
  initialResponse
}: SellerResponseFormProps) {
  const router = useRouter();
  const [sellerResponse, setSellerResponse] = useState(initialResponse ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasExistingResponse = useMemo(
    () => Boolean(initialResponse && initialResponse.trim().length > 0),
    [initialResponse]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const response = await fetch(
      `/api/templates/${templateSlug}/reviews/${reviewId}/response`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerResponse })
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not save seller response.");
      return;
    }

    setMessage("Seller response saved.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form className="seller-response-form" onSubmit={handleSubmit}>
      <p className="seller-response-title">
        {hasExistingResponse ? "Update seller response (mock)" : "Add seller response (mock)"}
      </p>
      <label>
        Response
        <textarea
          value={sellerResponse}
          onChange={(event) => setSellerResponse(event.currentTarget.value)}
          minLength={4}
          maxLength={600}
          required
          placeholder="Thanks for the feedback. We have shipped an update for this scenario."
        />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending
          ? "Saving..."
          : hasExistingResponse
            ? "Update seller response"
            : "Publish seller response"}
      </button>
      {error ? <p className="error-message">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
