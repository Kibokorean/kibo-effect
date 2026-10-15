# KIBO EFFECT production audit

## Code changes

- `index.html`: TOPIK pages now load in a same-origin iframe directly from the protected `/api/test/test-XX` endpoint. The previous loader fetched HTML, rewrote JavaScript source with regex, and executed it in the dashboard's global scope. Reopening another test could redeclare top-level identifiers; text rewriting could also alter code outside executable expressions. The isolated page retains its normal document, styles, browser APIs, grading request, progress resume, theme bridge, and result notification.
- `index.html`: vocabulary scripts now run in an isolated iframe from the original fragment, without changing their source. A UID-scoped storage adapter restores progress from and saves updates to `users/{uid}/progress/vocabulary`. Messages are accepted only from the active TOPIK or vocabulary iframe; vocabulary writes also require the current UID and bounded key/value sizes. Duplicate in-flight vocabulary loads are prevented, and sign-out unloads the active TOPIK frame.
- `vercel.json`: direct requests to `/korean/test-01.html` through `/korean/test-16.html` redirect to the protected API routes, avoiding the static pages' client-side answer data on Vercel.

No question, answer choice, vocabulary dataset, Firestore rule, or secret was changed.

## Root causes addressed

The confirmed architectural bug was re-executing test documents in the dashboard global scope after regex-based JavaScript rewriting. Each test declares top-level identifiers such as `KIBO_TEST_ID`, so loading a second test in the same page can throw duplicate-declaration errors. The same global execution model made fragment initialization dependent on source-text rewrites. Separate document contexts remove those collisions and transformations.

The reported server error `Assignment to constant variable` was not reproducible from the supplied source: `api/test/[id].js` declares the attempt ID with `let`, and the other reassigned attempt value is mutable. The current archive has no Firebase Admin credentials or live Vercel logs, so the reported production 500 cannot be traced further here. If it remains after deployment, inspect the runtime log and confirm the Vercel environment values described below.

## Checks run

- JavaScript syntax checked for 74 inline scripts across the dashboard, vocabulary fragment, Korean index, and all 16 test pages; each page's scripts were also checked together for conflicting global declarations. Result: **0 failures**.
- Node syntax checked for all 4 API files. Result: **0 failures**.
- Parsed `package.json`, `firebase.json`, and `vercel.json`; validated 16 protected test routes and their 16 redirects.
- Inspected all protected test data: **16 tests, 331 questions, 1,324 answer options**, four choices per question, and no answer fields in the protected payloads.
- Mock HTTP smoke checks: protected test POST → 405; protected test GET without session → 401; grading GET → 405; session GET → 405.

The repository defines no npm lint, test, or build scripts. No authenticated browser, Firebase project, or Vercel account was available, so live Google sign-in, App Check enforcement, Firestore reads/writes/rules, full test submission, and deployment routing remain unverified.

## Existing content discrepancy

The protected server copy and the standalone source for `test-11` differ in question text and choices for questions 11–20. This was present before the audit; the server copy remains the app's active version. It was preserved without editing either version. Confirm which version is authoritative before synchronizing the source files or answer keys.

## Deployment requirements

In Vercel, set Production (and Preview, if used) values for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `KIBO_ANSWERS_TEST_01` through `KIBO_ANSWERS_TEST_16`. Each answer key must match the corresponding protected test's question count and use comma-separated choice indices from 0 through 3. Keep the private key server-side; if Vercel stores escaped newlines, the existing Admin setup converts `\n` to line breaks.

In Firebase, verify the production and preview hostnames under Authentication authorized domains, confirm the configured reCAPTCHA Enterprise site key matches the registered web app, and enforce App Check only after confirming valid production traffic. Deploy the ZIP's project root (the folder containing `api/`, `index.html`, and `vercel.json`). After deployment, run the live checks in `DEPLOY_CHECKLIST.md`; verify all direct `/korean/test-XX.html` routes reach the protected handler and an unauthenticated request is denied.
