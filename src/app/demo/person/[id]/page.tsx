import { notFound } from "next/navigation";
import { demo, findPerson } from "@/lib/demo";
import { ProfileRead } from "@/components/ProfileRead";
export function generateStaticParams() {
  return demo.people.map((p) => ({ id: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = findPerson((await params).id);
  return { title: p ? `${p.name} — The read` : "Person not found" };
}
export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = findPerson(id);
  if (!person) notFound();
  const date = demo.dates.find((d) => d.participantIds.includes(id));
  return (
    <ProfileRead
      person={person}
      dateHref={date ? `/demo/date/${date.id}` : undefined}
    />
  );
}
