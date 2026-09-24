# KIBO EFFECT — Firebase App Check setup

App Check is wired into `index.html` using the Firebase Web SDK and the
reCAPTCHA Enterprise provider.

## 1. Add the reCAPTCHA Enterprise site key

Open `index.html` and find:

```js
const RECAPTCHA_ENTERPRISE_SITE_KEY = "PASTE_YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY_HERE";
```

Replace only the placeholder with the **Web score-based reCAPTCHA Enterprise
site key** that you created for `kibo-effect` and used to register
**KIBO EFFECT WEB** in Firebase App Check.

The site key is a public browser value. Never put a reCAPTCHA secret key,
Firebase Admin service-account JSON, or another server secret in this file.

## 2. Deploy

Commit/push the changed files to GitHub. Vercel should deploy automatically.

## 3. Verify before enforcement

In Firebase Console -> App Check -> APIs, wait for traffic from the deployed
site and verify that requests are being attested.

Do **not** enable Firestore enforcement until the deployed site is confirmed
to be sending valid App Check tokens.

## 4. Production domain

The production reCAPTCHA key should be restricted to:

`kibo-effect.vercel.app`

Do not add `localhost` to the production reCAPTCHA key. If local development
is needed later, use Firebase App Check's debug provider for development.

Firebase documentation:
https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider


## Protected test delivery
This build also adds server-side session protection for test pages. See `SECURE_TESTS_SETUP.md`.
