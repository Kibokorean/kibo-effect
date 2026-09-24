# KIBO EFFECT — Security notes

## Firebase API key
The Firebase Web API key is a public project identifier. It is expected to be visible in browser source. Do not put service-account private keys, Admin SDK credentials, Gemini/other billable API keys, or FCM server keys in the frontend.

## Firestore
`firestore.rules` denies every path by default and gives each authenticated user access only to `/users/{theirUid}`. UID and createdAt cannot be changed, and the email must match the Firebase Authentication identity.

## Vercel
`vercel.json` adds common browser security headers, including HSTS, CSP, Referrer-Policy, Permissions-Policy, and MIME sniffing protection.

## App Check
For production, enable Firebase App Check for the Firebase products used by the app (Cloud Firestore and any other supported backend product). For a web app, configure reCAPTCHA Enterprise or reCAPTCHA v3 in Firebase App Check, then enforce it after verifying production traffic.

## Important limitation
Static HTML/JS shipped to a browser cannot keep client-side lesson content, Firebase web config, or other frontend data secret. Anything that must remain secret must be moved to a trusted server/Cloud Function and never returned to unauthorized clients.
