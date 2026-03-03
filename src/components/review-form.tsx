"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  templateSlug: string;
}

export function ReviewForm({ templateSlug }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/templates/${templateSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Could not submit review.");
      return;
    }

    setComment("");
    setMessage("Review submitted.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a review</h3>
      <p className="muted">
        Reviews require a verified purchase linked to your checkout email.
      </p>
      <label>
        Rating
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.currentTarget.value))}
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Okay</option>
          <option value={2}>2 - Needs work</option>
          <option value={1}>1 - Poor</option>
        </select>
      </label>
      <label>
        Comment
        <textarea
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          minLength={12}
          maxLength={600}
          required
          placeholder="What worked well and what should improve?"
        />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit review"}
      </button>
      {error ? <p className="error-message">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
