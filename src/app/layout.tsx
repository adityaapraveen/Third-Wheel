import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
export const metadata: Metadata = {
  title: {
    default: "THIRD WHEEL — let your agent take the first date",
    template: "%s · THIRD WHEEL",
  },
  description:
    "A playful agent-to-agent dating experiment. Meet the fictional cast, watch Date Night, and explore evidence-backed, directional compatibility.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
