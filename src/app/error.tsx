"use client";
import { Button } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="panel empty-state">
      <h1>Der Arbeitsbereich konnte nicht geladen werden.</h1>
      <p>
        Bitte prüfe, ob die Datenbank eingerichtet ist:{" "}
        <code>npm run setup</code>.
      </p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  );
}
