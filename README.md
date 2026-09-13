# Uhlenmixer

Statische Website für die Feldhockey-Elternmannschaft des UHC Hamburg.

Die Seite liegt vollständig unter `src/` und wird über GitHub Pages veröffentlicht. Es gibt kein Build-System: Änderungen an HTML, CSS oder JavaScript können direkt nach `main` gepusht werden. Die Navigation öffnet auf kleinen Bildschirmen ein mobiles Menü; Termine und Kontaktdaten stehen direkt in `src/index.html`.

## Lokal ansehen

```sh
python3 -m http.server 8000 --directory src
```

Anschließend `http://localhost:8000` öffnen.

## Team-Finanzen einrichten

Die Website verwendet die Supabase-Konfiguration aus `src/supabase-config.js`. Führe einmalig `supabase/finance-schema.sql` im SQL Editor dieses Supabase-Projekts aus. Lege danach unter **Authentication → Users** die erlaubten Team-Konten an. Nur eingeloggte Nutzer können Finanzdaten lesen, anlegen oder löschen; der Service-Role-Key wird nicht verwendet.

## Deployment

Der Workflow `.github/workflows/pages.yml` veröffentlicht den Inhalt von `src/` automatisch auf GitHub Pages, sobald nach `main` gepusht wird.
