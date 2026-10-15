# partsdesk ohne Installation auf dem Arbeitslaptop

Der vollständige MVP kann in einem **privaten GitHub Codespace** laufen. Node.js, Datenbank und OCR werden auf GitHub ausgeführt. Auf dem Laptop werden nur ein Browser und ein GitHub-Login benötigt. Die Port-Sichtbarkeit muss auf **Private** bleiben: Der MVP hat keine eigene Anmeldung. GitHub schützt den privaten weitergeleiteten Port mit deinem Login.

Codespaces kann je nach Konto, Kontingent und Organisationseinstellung kostenpflichtig oder gesperrt sein. Vor Erstellung das verfügbare Kontingent im GitHub-Konto prüfen. Keinen kostenpflichtigen Plan für diese Demo automatisch buchen. Nur die mitgelieferten Beispieldaten verwenden.

## Wenn das vollständige Projekt auf GitHub gespeichert ist

1. Das Repository `chornik/Codex` auf GitHub im Browser öffnen. Die Dateien `package.json` und `.devcontainer/devcontainer.json` müssen dort sichtbar sein. **Die Dateien in dieser Codex-Arbeitsumgebung sind noch nicht automatisch auf GitHub gespeichert.** Ein Codespace des bisherigen README-only-Stands enthält die App nicht.
2. Den Branch mit dem vollständigen Projekt wählen. Über **Code → Codespaces → Create codespace** einen privaten Codespace starten. Falls GitHub eine Konfiguration anbietet, `partsdesk – private Browserdemo` wählen.
3. Die Einrichtung läuft automatisch. Die App wird nach Installation und Datenbankeinrichtung auf Port 3000 gestartet. Das erste Einrichten kann mehrere Minuten dauern.
4. Im Bereich **Ports** den Eintrag **3000 / partsdesk** öffnen. **Visibility: Private** belassen. Über das Browser-Symbol die Anwendung in einem neuen Tab öffnen. Es ist eine echte HTTPS-Adresse dieses Codespaces, keine lokale Laptop-Adresse.
5. Den Fall „Stellantrieb für Heizkreisverteiler“ ausprobieren.
6. Nach der Nutzung den Codespace im GitHub-Menü stoppen. Beim erneuten Start startet die App wieder. Daten bleiben im Codespace, bis er gelöscht wird; automatische Aufbewahrungsfristen beachten.

## Ohne vorheriges Speichern des Projekts auf GitHub

1. Das bereitgestellte Projekt-ZIP auf den Laptop herunterladen; keine Programme installieren.
2. Unter GitHub einen Codespace für `chornik/Codex` öffnen. Falls das Repository privat ist, muss dein Konto Zugriff haben.
3. Im Browser-Dateiexplorer des Codespaces die ZIP-Datei per Drag-and-drop hochladen, sodass sie im Workspace-Root liegt.
4. Im **Terminal innerhalb des Browser-Codespaces** diese Befehle ausführen. Der ZIP-Dateiname wird beim Herunterladen eventuell umbenannt; dann entsprechend anpassen:

   ```bash
   unzip partsdesk-browser.zip
   cd partsdesk
   node scripts/browser-setup.mjs
   npm run browser
   ```

5. **Ports → 3000 → Open in Browser** öffnen und die Sichtbarkeit auf **Private** belassen.

Das sind Cloud-Befehle im Browser; auf dem Arbeitslaptop wird weder Node.js noch eine andere Software installiert. Das Terminal offen lassen. Später im selben Codespace wieder in den Ordner `partsdesk` wechseln und `npm run browser` ausführen; die Installation muss nicht wiederholt werden.

## Technische Hinweise

- `npm run browser` verweigert einen Start außerhalb von Codespaces. Die genaue erlaubte HTTPS-Adresse wird aus den von GitHub gesetzten Variablen `CODESPACES`, `CODESPACE_NAME` und `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN` abgeleitet; es wird keine fremde Benutzer-Domain pauschal freigegeben.
- `APP_ORIGIN` erlaubt Schreibanfragen ausschließlich von dieser expliziten HTTPS-Adresse. Lokaler Betrieb und bisheriger Schutz vor fremden Ursprüngen bleiben bestehen. Es werden keine frei angelieferten Forwarded-Header als Vertrauensquelle verwendet.
- Der Server bindet im Codespace an `0.0.0.0`, damit der private GitHub-Proxy ihn erreichen kann. Dieser Startweg ist keine Freigabe für eine öffentliche Website.
- Die Datenbank liegt im Projekt unter `prisma/dev.db`, Uploads unter `data/uploads`. Beides ist ignoriert und bleibt auf dem Cloud-Rechner. Vor dem Löschen des Codespaces bei Bedarf separat sichern.
- Server-Logs bei automatischem Start: `/tmp/partsdesk-browser.log`. Falls Port 3000 noch nicht erscheint, zuerst die Einrichtung abwarten und dieses Log prüfen.
- Der Codespaces-spezifische Start und die Origin-Prüfung werden lokal getestet. Die tatsächliche Erstellung, GitHub-Anmeldung und Portweiterleitung müssen mit deinem GitHub-Konto geprüft werden; diese Umgebung hat keinen Codespaces-Zugang.

## Dauerhaft gehostete Website

Dafür wird ein Hosting-Konto benötigt. Die Anwendung braucht einen Node.js-Server sowie dauerhaften Speicher für SQLite und Uploads. Einfache statische Dienste wie Google Sites oder GitHub Pages können den vollständigen MVP nicht ausführen. Vor einer öffentlichen Veröffentlichung sind mindestens Zugriffsschutz und eine konkret konfigurierte HTTPS-Adresse erforderlich. Die private Codespaces-Demo ersetzt keinen produktiven Gruppenbetrieb.
