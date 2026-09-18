# fullstackopen-part8

Full Stack Open GraphQL library application, exercises 1-28. The final application uses the nested author schema introduced in chapter 4. Exercise 29 is the repository submission on MOOC.fi.

## Features

- Book and author counts, author and genre filters, adding books and editing author birth years.
- MongoDB/Mongoose persistence and validation with GraphQL errors.
- JWT login, current user and authenticated mutations. The shared exercise password is `secret`.
- React/Apollo authors, books, login, book form, genre filtering and recommendations.
- Cache invalidation for all genre variants after mutations and subscription events.
- Shared GraphQL fragments, WebSocket bookAdded subscriptions and notifications across browser sessions.
- Author counts computed with two database queries, avoiding the n+1 problem.

## Install

Use Node.js 24 and npm. In each directory run `npm ci`:

```text
library-backend
library-frontend
tests-chapter4
tests-chapter5
```

## Verify

```sh
cd tests-chapter4
npm test
cd ../tests-chapter5
npx playwright install chromium
npm test
cd ../library-frontend
npm run lint
npm run build
```

The test suites create their own temporary MongoDB databases. No Atlas account or `.env` file is needed for tests. The first run downloads MongoDB and Chromium. Stop any app already using ports 4000 and 5173 before running browser tests.

The original course tests are preserved. Additional tests cover combined filters, author counts, subscription delivery, reset protection, cross-browser updates and stale recommendation caches. Both supplied GitHub Actions workflows are enabled for main/master pushes.

## Local verification (2026-09-06)

- Backend: 28/28 tests passed (23 original course tests and 5 additional tests).
- Browser: 18/18 tests passed (16 original course tests and 2 additional tests). Local execution used installed Google Chrome through a temporary configuration because the bundled Chromium download stalled. GitHub Actions uses the original Chromium configuration.
- Frontend lint and production build passed.

## Run with your own database (optional)

Copy `library-backend/.env.example` to `library-backend/.env`. Set `MONGODB_URI` to a local MongoDB database or an Atlas connection string, and replace `JWT_SECRET` with a long random secret. Keep `.env` private.

In one terminal:

```sh
cd library-backend
npm start
```

In another:

```sh
cd library-frontend
npm run dev
```

Open http://localhost:5173. To create the first user, run this mutation in the GraphQL explorer at http://localhost:4000:

```graphql
mutation {
  createUser(username: "libraryuser", favoriteGenre: "refactoring") {
    username
  }
}
```

Log in to the frontend as `libraryuser` with password `secret`. Add books through the form. The shared password is an exercise requirement, not a production authentication design. `_resetDatabase` rejects requests unless NODE_ENV is exactly test; do not use test mode with a real database.

## Course submission

Repository: https://github.com/fkawi004/fullstackopen-part8

1. Check that both GitHub Actions workflows are green for the latest commit.
2. On MOOC.fi, finish the exercise submissions in chapter 3 (8-12), then lock the chapter only after all intended answers are submitted.
3. Continue chapter 4 (13-17), then chapter 5 (18-24), submitting completed exercises and locking each chapter in order. Exercises 17 and 24 require the corresponding green Actions runs.
4. Chapter 6 exercises 25-28 are optional and implemented here. For exercise 29, submit the repository URL above.
5. Complete the remaining course completion prompts in your own account. A code push alone does not register course credit.

The repository is public, so the grader can access it without a collaborator invitation. Do not mark any exercise complete until its implementation and required checks are verified.
