import { notFound } from "next/navigation";
import { demo, findDate, findPerson } from "@/lib/demo";
import { DateRoom } from "@/components/DateRoom";
export function generateStaticParams() {
  return demo.dates.map((d) => ({ id: d.id }));
}
export const metadata = { title: "Date Night" };
export default async function DatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const date = findDate(id);
  if (!date) notFound();
  const a = findPerson(date.participantIds[0])!,
    b = findPerson(date.participantIds[1])!,
    index = demo.dates.indexOf(date);
  return (
    <DateRoom
      a={a}
      b={b}
      record={date}
      nextHref={`/demo/date/${demo.dates[(index + 1) % demo.dates.length].id}`}
    />
  );
}
