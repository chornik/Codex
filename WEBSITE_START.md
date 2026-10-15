# partsdesk als Website – ohne Download oder lokale Installation

Die Website-Variante läuft auf einem Node.js-Hostingdienst. Auf dem Arbeitslaptop ist nur ein Browser nötig. `render.yaml` enthält eine vorbereitete Render-Konfiguration für eine **passwortgeschützte Testdemo mit Beispieldaten**. Der lokale Start und die private Codespaces-Variante bleiben verfügbar.

## Veröffentlichung im Browser

Voraussetzung: Der vollständige Projektstand mit `render.yaml` liegt im GitHub-Branch `partsdesk-web-demo` des Repositorys `chornik/Codex`. Eine lokale Arbeitskopie oder ein ZIP im Chat veröffentlicht die App nicht.

1. Im Browser bei **https://dashboard.render.com/** anmelden, beispielsweise über den eigenen GitHub-Login.
2. **New → Blueprint** wählen und den Zugriff auf `chornik/Codex` erlauben. Nur dieses Repository freigeben, soweit die Anbieteroberfläche dies anbietet.
3. Als Branch **partsdesk-web-demo** auswählen. Render liest `render.yaml`; es müssen keine Terminalbefehle ausgeführt und keine Dateien hochgeladen werden.
4. Die vorgeschlagenen Einstellungen prüfen. Es ist ausdrücklich `plan: free` voreingestellt. Falls der Anbieter diesen Plan für das Konto nicht anbietet oder eine Zahlung verlangt, **keinen kostenpflichtigen Plan automatisch buchen**; dann den passenden Zugang beziehungsweise eine Alternative klären.
5. Die Bereitstellung starten und warten, bis Render den Dienst als **Live** meldet. Die eigentliche Website-Adresse wird von Render vergeben und steht auf der Dienstseite.
6. Unter **Environment** den automatisch erzeugten Wert von `DEMO_PASSWORD` anzeigen. Der Benutzername ist **demo**. Das Passwort ausschließlich dort verwalten, nicht in GitHub, Dateien oder Chat kopieren.
7. Die Website-Adresse öffnen und im Browser-Anmeldedialog Benutzername und Passwort eingeben. Danach lässt sich die Anwendung wie eine gewöhnliche Website ausprobieren.

Es sind keine Installation, kein Download und keine Browser-Terminalbefehle auf dem Arbeitslaptop nötig. Die erstmalige Anmeldung und Freigabe im Hostingkonto können nicht ohne Zugriff auf dieses Konto übernommen werden. Ein vorbereitetes Repository oder erfolgreiche lokale Tests sind noch keine veröffentlichte Website.

## Verhalten der Testdemo

- Die Adresse wird beim Start aus `RENDER_EXTERNAL_URL` übernommen. Für eine andere Hostingplattform wird `APP_ORIGIN` auf die exakte HTTPS-Adresse gesetzt; nicht aus frei gelieferten Proxy-Headern ableiten.
- Alle Seiten, API-Endpunkte und Dateien sind durch HTTP-Basic-Anmeldung geschützt. Nur `/api/health` liefert ohne Anmeldung einen datenfreien Verfügbarkeitsstatus.
- Fehlendes oder zu kurzes Passwort führt zu einem Startabbruch beziehungsweise HTTP 503, nie zu einer ungeschützten Website. Mindestens 24 Zeichen, Benutzername standardmäßig `demo`.
- Das ist ein gemeinsamer Demo-Zugang, kein produktives Rollen- oder Benutzerverwaltungssystem. Für den Echtbetrieb bleiben SSO, Rechte pro Hotel und verifizierte Bearbeiteridentitäten erforderlich.
- **Kein dauerhafter Speicher im voreingestellten kostenlosen Testbetrieb:** SQLite und Uploads können bei Neustart, Neuveröffentlichung oder Austausch des Servers verloren gehen. Die Oberfläche weist ausdrücklich darauf hin. Nur fiktive Daten benutzen.
- Kostenlose Dienste können nach Inaktivität pausieren; der nächste Aufruf kann entsprechend länger dauern. Verfügbarkeit und Konditionen hängen vom Anbieter und Konto ab.
- Es erfolgen keine Bestellungen, Nachrichten oder technischen Freigaben. Echte Search-API-Zugangsdaten sind für die Demo nicht erforderlich.

## Dauerhaft gespeicherte Daten

Für aufbewahrte Fälle und Uploads wird ein geeigneter Hostingtarif mit persistentem Datenträger oder eine getrennte Datenbank und Dateiablage benötigt. Ein kostenpflichtiger Datenträger wird nicht automatisch angelegt. Bei einem persistenten Datenträger müssen **beide** Pfade dort liegen, beispielsweise `DATABASE_URL=file:/var/data/partsdesk/dev.db` und `UPLOAD_DIR=/var/data/partsdesk/uploads`; das Elternverzeichnis muss angelegt und beschreibbar sein. Backups und Wiederherstellung separat prüfen. Eine statische Seite bei Google Sites oder GitHub Pages führt den Next.js-Server und die SQLite-/Uploadfunktionen nicht aus.

## Technische Prüfung

`npm run web` validiert die HTTPS-Adresse und Passwortkonfiguration, richtet die Datenbank wiederholbar ein und startet den Produktionsbuild auf `0.0.0.0:$PORT`. Das lokale `npm start` bleibt an `127.0.0.1` gebunden. Unit- und Browsertests prüfen den Zugangsschutz, ungeschützte Health-Checks, geschützte Uploads und den Rechercheablauf. Die tatsächliche Anbieter-Bereitstellung und ein öffentlicher HTTPS-Aufruf müssen nach Anmeldung im Hostingkonto gesondert geprüft werden.
