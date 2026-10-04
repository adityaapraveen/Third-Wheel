import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-wrap empty-state">
      <span className="eyebrow">AN UNEXPECTED PLOT TWIST</span>
      <h1>This agent left the room.</h1>
      <p>That profile or date doesn't exist.</p>
      <Link href="/demo" className="button primary">
        Back to the cast
      </Link>
    </div>
  );
}
