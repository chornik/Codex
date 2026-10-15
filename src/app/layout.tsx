import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "partsdesk · Ersatzteile finden. Anlagen erhalten.",
    template: "%s · partsdesk",
  },
  description:
    "Rechercheassistenz für die Hoteltechnik: Ersatzteile, Quellen, Alternativen und dokumentierte Entscheidungen.",
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Suspense
          fallback={
            <div className="loading-page">Arbeitsbereich wird geladen …</div>
          }
        >
          <Shell
            demo={(process.env.SEARCH_PROVIDER || "demo") === "demo"}
            ephemeral={process.env.DEMO_EPHEMERAL === "1"}
          >
            {children}
          </Shell>
        </Suspense>
      </body>
    </html>
  );
}
