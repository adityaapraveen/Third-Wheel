import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { demo, findPerson } from "@/lib/demo";
import { RankingList } from "@/components/RankingList";
import { Avatar } from "@/components/Avatar";
export function generateStaticParams() {
  return demo.people.map((p) => ({ id: p.id }));
}
export const metadata = { title: "Directional rankings" };
export default async function RankingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = findPerson(id);
  if (!p) notFound();
  return (
    <div className="page-wrap rankings-page">
      <Link href="/demo?tab=rankings" className="back-link">
        <ChevronLeft size={16} /> Everyone's opinions
      </Link>
      <div className="rankings-heading">
        <Avatar person={p} />
        <div>
          <span className="eyebrow">THE SPREADSHEET SAYS CHEMISTRY</span>
          <h1>
            {p.name.split(" ")[0]}'s rankings<span className="lime">.</span>
          </h1>
          <p>24 candidates. One very specific point of view.</p>
        </div>
      </div>
      <RankingList person={p} people={demo.people} rankings={demo.rankings} />
    </div>
  );
}
