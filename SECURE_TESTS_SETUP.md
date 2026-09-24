# KIBO EFFECT — Protected test pages

This version removes the public `test-01.html` … `test-16.html` files. Tests are served only by `/api/test/test-XX` after a Firebase Auth session cookie has been created. The session endpoint requires both a valid Firebase ID token and a valid Firebase App Check token.

## Vercel Environment Variables

In Vercel → Project → Settings → Environment Variables, add these to **Production** (and Preview if you want to test there):

- `FIREBASE_PROJECT_ID` = `kibo-effect`
- `FIREBASE_CLIENT_EMAIL` = the service account email
- `FIREBASE_PRIVATE_KEY` = the service account private key, exactly as provided by Google, including `\n` escapes if Vercel stores it on one line

Never put these values in GitHub, `index.html`, or any frontend JavaScript. The Admin SDK is server-side only.

## Service account

Create a dedicated Firebase/GCP service account for the server-side KIBO endpoint. Downloading the JSON is only for obtaining the values; do **not** commit the JSON file. Grant only the permissions needed by the Admin SDK for Authentication/App Check verification.

## What changed

- `test-01.html` … `test-16.html` are no longer public files.
- `api/auth/session.js` verifies Firebase ID token + App Check token and issues an HttpOnly, Secure session cookie for 1 hour.
- `api/auth/logout.js` clears the session cookie.
- `api/test/[id].js` serves the existing test HTML only after verifying the session cookie.
- `index.html` now creates the server session after Firebase Auth/App Check succeeds and loads tests through `/api/test/test-XX`.
- Firestore rules are unchanged.

## Important limitation

This protects the test pages from unauthenticated direct URL access. Once an authenticated user is allowed to view a test, the browser necessarily receives the test HTML and client-side answer key, so a determined authorized user can still inspect it. For stronger protection of answer keys, the next step is server-side grading where answers never reach the browser before submission.


## V14 server-side grading
The browser receives questions and options without correct-answer indices. On submission it sends only selected option indices to `/api/test/grade`; Firebase Admin checks them against server-only answer keys. Each test load gets a one-time Firestore attempt token.

Optional: configure a Firestore TTL policy on `expiresAt` for the `testAttempts` collection to automatically remove expired attempt documents.
