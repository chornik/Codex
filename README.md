# partsdesk

Lokal startbarer MVP für die KI-gestützte Ersatzteilrecherche einer Hotelgruppe. Haustechnik und Technical Services erfassen Bauteile, lesen Typenschilder aus, recherchieren strukturiert und dokumentieren menschliche Entscheidungen.

**Keine autonome Beschaffung:** Die Anwendung bestellt nichts, versendet keine E-Mails und kontaktiert keine Hersteller. Eine Freigabe im Tool bedeutet ausschließlich „für Kontaktaufnahme freigegeben“, niemals eine technische Freigabe oder garantierte Kompatibilität.

## Direkte interaktive HTML-Vorschau

[index.html](index.html) ist eine eigenständige Browserdemo mit derselben Oberfläche. Alle Skripte, Stile und Beispieldateien sind eingebettet; es werden keine Pakete installiert, keine externen Dienste geladen und keine Server benötigt. In einer Oberfläche mit HTML-Dateivorschau lässt sich die Datei direkt öffnen.

Die Demo unterstützt Fallverwaltung, TXT- und Textanalyse, Demo-Recherche, Vergleich, begründete Entscheidungen, Kontaktentwürfe und Nutzenrechnung. Daten bleiben im Browser; wenn die Vorschau keinen Browserspeicher erlaubt, gelten Änderungen nur für die aktuelle Sitzung. Dateien werden nach Möglichkeit in IndexedDB gespeichert. Es gibt keine Synchronisierung mit der SQLite-Datenbank. Foto-OCR, PDF-Auslesen und echte Websuche sind in dieser Vorschau ausdrücklich nicht aktiv; dafür bleibt die vollständige Serveranwendung verfügbar.

Für Entwicklung: `npm run preview:build` erzeugt die einzelne HTML-Datei neu. `npm run test:preview` prüft die eingebettete Vorschau mit Playwright einschließlich des Rechercheablaufs und ohne Netzwerkanfragen. Die Build-Quellen liegen in `preview/`; sie verwenden die bestehenden React-Komponenten und eine getrennte lokale Demo-Datenhaltung. Eine Vorschauplattform kann JavaScript oder Speicherung einschränken; ein Link zur Datei ist keine öffentliche Website-Adresse.

## Schnellstart

Voraussetzungen: **Node.js 24 LTS** (siehe `.nvmrc`; mindestens 22.13), npm, ein beschreibbares Projektverzeichnis. Kein Docker, kein Datenbankserver und keine API-Keys nötig. Unter Linux müssen die üblichen Laufzeitbibliotheken für native npm-Pakete vorhanden sein; SQLite und Bildverarbeitung werden über npm bereitgestellt.

```bash
npm ci
cp .env.example .env
npm run setup
npm run dev
```

Danach im lokalen Browser `http://127.0.0.1:3000` öffnen. Die Standardbefehle binden ausschließlich an die lokale Schnittstelle. Alle npm-Befehle aus dem Repository-Root ausführen.

`setup` erzeugt den Prisma Client, gleicht das Schema mit SQLite ab und legt 25 fiktive Hotels und drei Beispielfälle an. Es kann erneut ausgeführt werden: Bestehende Fälle, Entscheidungen und Kosten werden nicht überschrieben. Es erfolgt kein Datenbank-Reset. Bei künftigen Schemaänderungen meldet Prisma mögliche Datenverluste; niemals unbeaufsichtigt `--accept-data-loss` verwenden.

Produktionsmodus lokal:

```bash
npm run build
npm start
```

## In fünf Minuten ausprobieren

1. Den Beispielfall **„Stellantrieb für Heizkreisverteiler“** öffnen oder einen neuen Fall mit Modell **SQX32.00** anlegen.
2. Unter **Dokumente & Erkennung** ein [Demo-Typenschild als PNG](public/samples/typenschild.png), [PDF](public/samples/typenschild.pdf) oder [TXT](public/samples/typenschild.txt) herunterladen und hochladen. Diese Beispiele sind auch direkt in der Oberfläche verlinkt.
3. **Auslesen** starten. Erkannte Werte kontrollieren, bei Bedarf bearbeiten und einzeln zur Übernahme auswählen. Bereits erfasste Werte sind standardmäßig abgewählt; eine Auswahl ersetzt den bisherigen Wert.
4. Unter **Recherche & Vergleich** die Recherche starten. Bis zu drei Treffer auswählen und vergleichen. Originale und mögliche Alternativen, technische Parameter, Quellenstand und offene Fragen prüfen.
5. **Ergebnis prüfen** öffnen: Begründung eingeben, Entscheidung bestätigen und speichern. Möglich sind Ablehnung, technische Prüfung und Kontaktfreigabe.
6. Nach Kontaktfreigabe unter **Kontaktentwürfe** einen Entwurf erstellen, bearbeiten, speichern, kopieren oder als TXT herunterladen. Empfängerprüfung und Versand erfolgen manuell außerhalb der Anwendung.
7. Unter **Wirtschaftlicher Nutzen** Kosten und Vergleichsszenario dokumentieren. Ein Neuladen zeigt die lokal gespeicherten Daten erneut.

Weitere Demo-Modelle: **UPS 32-80 180** (Grundfos), **EKC 202D** (Danfoss). Unbekannte Modelle liefern im Demo-Katalog keine erfundenen Treffer.

## Umgesetzte Funktionen

- Übersicht mit Kennzahlen, Suche nach Fall/Hersteller/Modell, Hotel- und Statusfiltern sowie eigener Prüfliste.
- Neue Fälle und Bearbeitung von Hotel, Kategorie, Priorität, Baujahr, Modell, Artikel- und Seriennummer, technischen Parametern und Ausgangslage.
- Lokale Dateiablage mit maximal 20 Dateien pro Fall und 10 MB je Datei. Dateisignaturen für PNG/JPEG/WebP/PDF und UTF-8-Prüfung für TXT; keine HTML- oder SVG-Uploads. Downloads werden als Anhang und mit `nosniff` ausgeliefert.
- Lokale OCR auf Bildern mit Tesseract.js und mitgelieferten englischen Sprachdaten; Text-PDF- und TXT-Extraktion. Regelbasierte Erkennung bekannter Hersteller und beschrifteter Produktfelder, editierbare Vorschläge und explizite Übernahme.
- Vier Suchstufen: Originalteil, mögliche Nachfolger/andere Bezeichnungen, Alternativkandidaten und internationale Restbestände. Technische Begriffe werden deutsch/englisch ergänzt; Suchbegriffe bleiben sichtbar und können manuell geöffnet werden.
- Persistente Treffer mit Quelle, Erfassungsdatum, Preisindikator, Angebotsstatus und Unsicherheiten. Keine automatische Behauptung einer Austauschbarkeit. Wiederholte Suchen erhalten bestehende Treffer, Datenstände, Entscheidungen und Entwürfe; neue Quellen kommen hinzu.
- Vergleich von bis zu drei Treffern mit den Bestandsdaten; begründete Entscheidungen mit Zeitpunkt. Die letzte Entscheidung wird gespeichert.
- Kontaktentwürfe ausschließlich für ausdrücklich freigegebene Treffer, ohne Versandfunktion. Wird die Freigabe zurückgenommen, sperrt die Oberfläche die Weiterverwendung und der Server Änderungen am Entwurf.
- Wirtschaftlichkeitsrechnung mit nachvollziehbaren Annahmen, möglicher weiterer Nutzungsdauer und lokal gespeicherter Kostenschätzung.
- Responsive deutsche Oberfläche, Tastaturnavigation der Tabs, beschriftete Formulare, native modale Dialoge mit Fokusverwaltung und sichtbare Fehlerzustände.

## Was hier „KI“ bedeutet

Die Bild-OCR nutzt ein lokal ausgeführtes Erkennungsmodell. Produktfeld-Erkennung, Suchbegriffbildung, Demo-Trefferauswahl und Kontaktformulierungen sind im MVP bewusst regelbasiert. **Es gibt kein LLM, keine semantische Kompatibilitätsprüfung und keine verdeckten kostenpflichtigen KI-Aufrufe.** Hersteller, Modell und Parameter sind Vorschläge aus dem Ausgangstext, keine technisch verifizierten Fakten. Bilderkennung kann insbesondere `0/O`, `1/I` und Artikelnummern falsch lesen. Unbekannte Hersteller lassen sich manuell erfassen.

Text-PDFs werden auf bis zu 30 Seiten ausgewertet. Scans in PDFs werden nicht automatisch gerendert und OCR-erkannt: bitte die betreffende Seite als PNG/JPG hochladen. Erkannter Text ist auf 30.000 Zeichen begrenzt. Es wird jeweils ein Bild pro Serverprozess erkannt; bei belegter OCR gibt es eine verständliche Rückmeldung.

## Demo und optionale echte Websuche

Standardmäßig gilt `SEARCH_PROVIDER=demo`. Sämtliche **Angebote, Preise, Bestände und Händler sind fiktiv**. Die `.example`-URLs sind absichtlich keine echten Bezugsquellen und lassen sich nicht als Händlerseiten aufrufen. Hersteller- und Modellbezeichnungen dienen nur als realistische Suchbeispiele; technische Demoangaben sind keine Produktspezifikation. Das Banner und jeder Treffer kennzeichnen diese Einschränkungen.

Optional kann die [Brave Search API](https://api-dashboard.search.brave.com/) aktiviert werden. Deren Tarif, Kontingent und Bedingungen müssen eigenständig geprüft werden; im Standardbetrieb entstehen keine API-Kosten. Schlüssel ausschließlich lokal in der ignorierten `.env` oder über sichere Umgebungsvariablen bereitstellen:

```dotenv
SEARCH_PROVIDER="brave"
BRAVE_SEARCH_API_KEY="lokal-eintragen"
```

Server nach einer Konfigurationsänderung neu starten. `BRAVE_SEARCH_API_KEY` ist ausschließlich serverseitig; niemals mit `NEXT_PUBLIC_` versehen oder committen. Benötigter Netzwerkhost: `api.search.brave.com` über HTTPS. Pro aktiv gestarteter Recherche werden vier Anfragen mit je maximal fünf Treffern gestellt, URLs dedupliziert und je Anfrage ein Timeout von zwölf Sekunden angewendet. Bei einem Anbieterfehler wird der Lauf nicht als erfolgreich gespeichert; es gibt keinen stillen Demo-Fallback.

Es werden nur die angezeigten Suchbegriffe übertragen: Hersteller, Modell/Artikelnummer, Kategorie und gegebenenfalls ein begrenzter Ausschnitt der technischen Parameter. Fotos, Dokumente, Seriennummern, Hotelname und Fallbeschreibung werden nicht automatisch übermittelt. Technische Freitexte daher vor Websuche auf Vertraulichkeit prüfen. Manuelle Suchlinks senden ihre Suchbegriffe erst beim aktiven Öffnen an Google.

Echte Treffer sind **ungeprüfte Webhinweise**. Die Anwendung besucht Händlerseiten nicht selbst, übernimmt keine ungeprüften Preise oder technischen Daten aus Suchsnippets und behauptet keine Kompatibilität. Ein echter API-Aufruf ist ohne eigenen Schlüssel nicht Teil der Standardtests; die Integration wird mit simulierten API-Antworten getestet.

## Stack und Struktur

- Next.js 16 mit App Router und React 19; TypeScript im strikten Modus.
- Tailwind CSS und eigene wiederverwendbare UI-Komponenten, Lucide-Icons; keine extern geladenen Schriftarten oder Bildressourcen.
- Prisma 6.19.3 mit JavaScript Query Compiler und lokalem libSQL/SQLite-Adapter. **Kein Cloud-libSQL und kein Turso-Konto.** Prisma-CLI verwendet den WASM-Schema-Engine-Weg; dadurch werden keine separaten Rust-Engine-Binaries benötigt. Die in dieser Version experimentelle CLI-Adapterkonfiguration ist bewusst auf den lokalen MVP begrenzt.
- `deepmerge-ts` ist für die transitive Prisma-Konfiguration per npm-Override auf 8.0.2 angehoben; die lokale Adapterkonfiguration und der Build werden damit geprüft.
- Zod auf dem Server und React Hook Form für die Fallerfassung.
- Tesseract.js und installierte Sprachdaten, Sharp für Bildvorbereitung, PDF-Parse für Text-PDFs.
- Vitest und Playwright.

```text
prisma/schema.prisma         Hotels, Fälle, Dateien, Treffer, Suchläufe, Entwürfe, Nutzen
prisma/seed.ts               Wiederholbar ausführbare Beispieldaten
prisma.config.ts            Lokaler CLI-/WASM-Adapter
src/app/                    Seiten und validierte API-Routen
src/components/             Dashboard, Formulare und Suchfall-Arbeitsbereich
src/lib/                    Datenbank, Suche, OCR, Validierung und Berechnungen
public/samples/             Fiktives Typenschild in drei Formaten
scripts/create-samples.ts   Beispiele reproduzierbar erzeugen
tests/                     Fachlogik, reale lokale Dokumentenerkennung, Browserablauf
```

## Konfiguration und Daten

| Variable                  | Standard / Bedeutung                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | `file:./dev.db` – relativ immer zum Verzeichnis `prisma/`; absolute `file:/...`-Pfade ebenfalls möglich |
| `UPLOAD_DIR`              | `./data/uploads` – relativ zum Repository-Root                                                          |
| `SEARCH_PROVIDER`         | `demo` oder optional `brave`                                                                            |
| `BRAVE_SEARCH_API_KEY`    | Nur für Brave; kein Schlüssel im Repository                                                             |
| `CHECKPOINT_DISABLE`      | `1`, deaktiviert Prisma-Updateprüfungen                                                                 |
| `NEXT_TELEMETRY_DISABLED` | `1`, deaktiviert Next-Telemetrie                                                                        |

Datenbank, Uploads, Caches und `.env` sind ignoriert. Beispieldateien enthalten ausschließlich fiktive Daten. Für eine Sicherung den Server stoppen und die SQLite-Datei **zusammen mit dem Uploadverzeichnis** sichern; eine Datenbankkopie allein enthält keine Dateiinhalte. Keine echten Schlüssel oder personenbezogenen Daten in Test-Fixtures ablegen.

Der Seed ist nicht destruktiv. Ein beabsichtigter kompletter Neustart erfordert eine separate Sicherung und das bewusste Entfernen der lokalen Datenbank und Uploads; die Anwendung tut dies nie automatisch.

## Tests und Qualitätsprüfungen

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

- Vitest prüft Validierung, Pflicht zur menschlichen Bestätigung, Suchstufen, Modellabgleich, fehlende API-Schlüssel, URL-Filter, Deduplizierung, Anbieterfehler, Dateitypen, Kostengrenzen und Berechnung. Zusätzlich wird **echte lokale OCR** auf einem erzeugten Bild und Textextraktion aus einem erzeugten PDF ausgeführt.
- Playwright startet den **Produktionsbuild** auf Port 3101 mit eigener SQLite-Datei `prisma/e2e.db` und Uploadablage `data/e2e-uploads`. Der Haupttest legt einen Fall an, lädt ein Dokument hoch, übernimmt Erkennungsdaten, recherchiert, vergleicht, speichert eine begründete Kontaktfreigabe, prüft deren Erhalt bei erneuter Suche, bearbeitet/exportiert einen Kontaktentwurf und überprüft persistente Kosten nach Neuladen.
- Weitere Browser-/API-Checks prüfen zusätzlich PNG-OCR und PDF-Textextraktion über den gestarteten Produktionsserver, Download-Inhalte, Fallzuordnung von Dokumenten sowie Ablehnung, technische Prüfung, verbotene Kontaktentwürfe, falsche Dateisignaturen, ungültige Eingaben, fremde Browser-Ursprünge und mobile Navigation mit Hotelfilter.
- Optional vorhandenes System-Chromium nutzen: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`. Unter Linux kann Playwright zusätzliche Systembibliotheken benötigen (`npx playwright install --with-deps chromium`). Die Testdatenbank wird nicht mit der Entwicklungsdatenbank vermischt.

Tests arbeiten ohne echte externe APIs. Sie prüfen keine realen Lagerbestände, Lieferfähigkeit oder technische Kompatibilität. Browser-Tests benötigen einen aktuellen Build. `npm run samples` erzeugt die Demodateien neu.

## Annahmen und Grenzen

Der MVP ist ein **lokaler, vertrauenswürdiger Arbeitsbereich ohne Login**, Rollen oder verbindliche Beschaffungsfreigaben. Es gibt keine Mailintegration, Bestellfunktion oder eigenständige Herstellerkontaktierung. Der Fallstatus „Recherche abgeschlossen“ dokumentiert nur den Abschluss der Recherche. Entscheidungen haben Zeitstempel und Begründung, aber keine verifizierte Bearbeiteridentität und keine unveränderbare Änderungshistorie.

Für den Betrieb mit 25 realen Hotels sind vor einer Netzwerkbereitstellung insbesondere erforderlich: SSO/Authentifizierung, Hotel- und Rollenberechtigungen, Audit-Historie, sichere Datei- und Schadsoftwareprüfung, Begrenzung der gesamten Request-Größe auf Reverse-Proxy-Ebene, Last-/Parallelitätstests, Backups mit Wiederherstellungstest sowie Datenschutz-, Aufbewahrungs- und Löschregeln. Die lokalen APIs und Downloads sind ohne Anmeldung erreichbar; den Standardhost daher nicht leichtfertig auf `0.0.0.0` ändern.

SQLite ist für diesen lokalen MVP vorgesehen, nicht als zugesicherte Lösung für den parallelen Gruppenbetrieb. Bei sicherheitskritischen Anlagen – insbesondere Brandschutz, elektrische Sicherheit oder Kältemittel – sind befugtes Fachpersonal, Originalunterlagen und die geltenden Vorschriften maßgeblich.

Die wirtschaftliche Rechnung lautet:

```text
Reparatur = Ersatzteil + Einbau/Nebenarbeiten
Potenzial = Vergleichsinvestition − Reparatur + (vermiedene Ausfalltage × Ausfallkosten/Tag)
```

Negative Werte werden angezeigt. Aufgeschobene Investitionen sind keine dauerhaft vermiedenen Kosten; Doppelzählungen von Ausfallkosten vermeiden. Eine Lebensdauerverlängerung ist nur eine dokumentierte Annahme und fließt nicht als erfundener Geldbetrag ein.

## Fehlerbehebung

- **Datenbank fehlt / Seite kann nicht laden:** `.env` prüfen, `npm run setup` ausführen; kein Reset nötig.
- **npm-Cache nicht beschreibbar:** `npm ci --cache /tmp/partsdesk-npm` verwenden.
- **OCR ohne Ergebnis:** scharfes, frontales Bild mit gutem Kontrast verwenden; Werte manuell ergänzen. Sprachdaten werden durch npm installiert, nicht zur Laufzeit aus einem CDN geladen.
- **Websuche schlägt fehl:** Provider, Schlüssel, Kontingent und Zugriff auf `api.search.brave.com` prüfen. Es werden keine Teilergebnisse als erfolgreicher Lauf gespeichert.
- **Port belegt:** z. B. `npm run dev -- --port 3002` verwenden.
- **Setup dauert länger:** die Prisma-CLI-Adapterfunktion kann beim Beenden verzögert sein; auf den Exit-Status und die Seed-Abschlussmeldung warten. Kein Abschalten von TLS- oder Prüfsummenprüfungen nötig.

## Ohne lokale Installation im Browser ansehen

Für einen Arbeitslaptop ohne Installationsrechte ist ein privater GitHub Codespace vorbereitet. Die Schritt-für-Schritt-Anleitung steht in [BROWSER_START.md](BROWSER_START.md). `.devcontainer/devcontainer.json` richtet die Anwendung automatisch ein, sobald der vollständige Projektstand auf GitHub liegt. Alternativ lässt sich das Projekt-ZIP im Browser in einen vorhandenen Codespace hochladen. `npm run browser` übernimmt die genaue HTTPS-Origin-Konfiguration; Port 3000 muss privat bleiben. Die tatsächliche GitHub-Portweiterleitung erfordert einen GitHub-Login und ist von hier aus nicht veröffentlicht oder geprüft.

## Gehostete Website ohne Download

Die alternative Website-Variante ist in [WEBSITE_START.md](WEBSITE_START.md) beschrieben. `render.yaml` bereitet eine passwortgeschützte Testdemo vor, die im Hosting-Dashboard ohne Downloads oder Terminalbefehle bereitgestellt werden kann. `npm run web` prüft sichere Konfiguration und startet den Produktionsserver. Im voreingestellten kostenlosen Demobetrieb sind Daten nicht dauerhaft gesichert; dafür erscheint ein Hinweis in der Oberfläche. Das Demo-Passwort wird ausschließlich im Hostingkonto erzeugt und verwaltet. Eine tatsächliche Veröffentlichung erfordert den dortigen Kontozugriff; ein Konfigurationsfile allein erzeugt noch keine Website-Adresse.
