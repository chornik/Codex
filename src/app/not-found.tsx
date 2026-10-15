import Link from "next/link";
export default function NotFound() {
  return (
    <div className="panel empty-state">
      <h1>Dieser Eintrag wurde nicht gefunden.</h1>
      <p>Öffne einen vorhandenen Suchfall oder lege einen neuen an.</p>
      <Link href="/" className="btn btn-primary">
        Zur Übersicht
      </Link>
    </div>
  );
}
