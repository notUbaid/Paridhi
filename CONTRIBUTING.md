# Contributing to Paridhi

## Setup

```bash
npm install
npm test            # API, database (PGlite), sign-in, domain and evidence tests
npm run typecheck   # type-check the API, shared code and tests
npm run lint        # lint the web app (oxlint)
npm run build       # type-check and build the web app
```

Run `npm run dev:api` and `npm run dev:web` together for hot reload on http://localhost:3000.

## Principles

1. **Never show a claim the data doesn't support.** Every status, badge and checkmark must be computed from the data.
   If a rule decides whether something is "clear", put it in `shared/domain.ts` so the API and the UI agree.
2. **Owner actions are requests.** The app records that an inspection or caveat renewal was requested. Only the
   inspector or advocate can confirm it happened.
3. **Be careful with legal wording.** Say what a caveat or a signature actually does. Anything that reads as legal
   advice needs an advocate's review.
4. **Sample data stays obviously fake.** Use `example.com` emails, reserved fictional phone numbers (555-01xx in North
   America, 07700 900xxx or 020 7946 0xxx in the UK) and zeroed enrolment numbers.
5. **Design.** Use the tokens in `web/src/index.css` (warm paper surfaces, forest ink, one laterite accent) and the
   components in `web/src/ui/` (Button, Card, Badge, Tabs, Menu, form fields) rather than raw colours. Headings use the
   display serif (Newsreader), interface text IBM Plex Sans at 14–15 px, and mono only for IDs and hashes. Status
   colours are for status only: green clear, ochre attention, brick action. No gradients, glows or dark backgrounds.
   Write for owners in plain words: say what was checked, what it means, and what they can do.

## Where help is welcome

- Roles for inspectors, ops staff and advocates.
- Camera integrations (snapshot upload from specific 4G solar camera models).
- Land record check workflows for more states (Maharashtra, Uttar Pradesh, Tamil Nadu).
- Frontend tests.

## Pull requests

- `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` must pass. CI runs all four.
- Add or update tests for any change to API behaviour or domain rules. Schema changes go in a new file in
  `supabase/migrations/`; the tests apply every migration to a fresh PGlite database.
- Use clear commit messages, for example `feat: add Maharashtra 7/12 record model`.
