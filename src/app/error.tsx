"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-wrap empty-state">
      <h1>A little awkward silence.</h1>
      <p>The page had trouble loading. Let's try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
