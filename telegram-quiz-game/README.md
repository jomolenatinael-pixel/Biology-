# Grade 10 Quiz Arena

A static Telegram Mini App-style quiz game for Ethiopian Grade 10 curriculum practice.

## Included games

- Mathematics flashcards
- Physics challenge
- History quest
- Economics arena
- Chemistry lab quiz

Each subject is an offline-first HTML game with embedded question banks, instant feedback, unit navigation, scores, and missed-question review.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/`.

## Deploy

This project is configured as a no-build static site for Vercel. The public entry point is `index.html`; the individual subject games are linked directly from the landing page.
