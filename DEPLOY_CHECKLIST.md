# KIBO EFFECT deployment checklist

1. Vercel environment variables:
   - FIREBASE_PROJECT_ID
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
   - KIBO_ANSWERS_TEST_01 ... KIBO_ANSWERS_TEST_16
2. Firebase Authentication -> Authorized domains: add the exact Vercel production domain and preview domain if needed.
3. Firebase App Check: register the same web app and use the ReCaptcha Enterprise site key in `index.html`.
4. Deploy with the project root containing `api/`, `dars/`, `index.html`, `vercel.json` and `package.json`.
5. After deployment verify:
   - Google popup login
   - popup-blocked redirect login
   - `/api/auth/session` creates `__kibo_session`
   - each `/api/test/test-01` ... `/api/test/test-16` loads only after login
   - submitting each test returns `results[]`
   - refresh before submit restores answers for the same test
   - submitting twice is rejected
   - logout removes server session
   - homepage progress/history updates after submission
