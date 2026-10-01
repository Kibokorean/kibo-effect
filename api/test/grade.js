const { getApps, initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getAppCheck } = require("firebase-admin/app-check");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are missing");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

/*
  ============================================================
  SERVER-ONLY ANSWER KEYS
  ============================================================

  Javoblar endi GitHub kodida saqlanmaydi.

  Vercel Environment Variables:

  KIBO_ANSWERS_TEST_01
  KIBO_ANSWERS_TEST_02
  ...
  KIBO_ANSWERS_TEST_16

  qiymatlari quyidagi formatda bo'ladi:

  test-01:
  2,3,1,3,0,0,0,1,2,3,1,0,1,0,1,0,0,1,3,3,3,0,0,0

  test-02:
  0,3,1,0,2,0,1,0,0,2,3,0,2,3,3,3,2,3,0,2,0,3,3,3

  va hokazo.
*/

function getAnswerKey(testId) {
  const envName = `KIBO_ANSWERS_${testId.replace("-", "_").toUpperCase()}`;

  const raw = process.env[envName];

  if (!raw) {
    throw new Error(`Missing answer key environment variable: ${envName}`);
  }

  const key = raw
    .split(",")
    .map((value) => Number(value.trim()));

  if (
    key.length === 0 ||
    key.some(
      (value) =>
        !Number.isInteger(value) ||
        value < 0 ||
        value > 3
    )
  ) {
    throw new Error(`Invalid answer key: ${envName}`);
  }

  return key;
}

function cookie(req, name) {
  const raw = String(req.headers.cookie || "");

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(
    `(?:^|;\\s*)${escapedName}=([^;]+)`
  );

  const match = raw.match(regex);

  return match ? decodeURIComponent(match[1]) : "";
}

function sameOrigin(req) {
  const origin = String(req.headers.origin || "");

  if (!origin) return true;

  const allowedOrigins = [
    "https://kibo-effect.vercel.app",
    "https://kibo-effect.firebaseapp.com",
    "https://kibo-effect.web.app"
  ];

  return allowedOrigins.includes(origin);
}

module.exports = async function handler(req, res) {
  try {
    /*
      ----------------------------------------------------------
      1. METHOD
      ----------------------------------------------------------
    */

    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "method-not-allowed"
      });
    }

    /*
      ----------------------------------------------------------
      2. ORIGIN
      ----------------------------------------------------------
    */

    if (!sameOrigin(req)) {
      return res.status(403).json({
        ok: false,
        error: "bad-origin"
      });
    }

    /*
      ----------------------------------------------------------
      3. APP CHECK
      ----------------------------------------------------------
    */

    const appCheckToken = String(
      req.headers["x-firebase-appcheck"] || ""
    );

    if (!appCheckToken) {
      return res.status(401).json({
        ok: false,
        error: "missing-appcheck"
      });
    }

    /*
      ----------------------------------------------------------
      4. REQUEST BODY
      ----------------------------------------------------------
    */

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          ok: false,
          error: "invalid-json"
        });
      }
    }

    const testId = String(
      body?.testId || ""
    ).toLowerCase();

    const answers = Array.isArray(body?.answers)
      ? body.answers
      : null;

    /*
      ----------------------------------------------------------
      5. TEST ID VALIDATION
      ----------------------------------------------------------
    */

    if (!/^test-(0[1-9]|1[0-6])$/.test(testId)) {
      return res.status(400).json({
        ok: false,
        error: "invalid-test"
      });
    }

    /*
      ----------------------------------------------------------
      6. GET SERVER-ONLY ANSWER KEY
      ----------------------------------------------------------
    */

    const key = getAnswerKey(testId);

    /*
      ----------------------------------------------------------
      7. ANSWER VALIDATION
      ----------------------------------------------------------
    */

    if (!answers) {
      return res.status(400).json({
        ok: false,
        error: "invalid-answers"
      });
    }

    if (answers.length !== key.length) {
      return res.status(400).json({
        ok: false,
        error: "invalid-answer-count"
      });
    }

    const invalidAnswer = answers.some(
      (value) =>
        value !== null &&
        (
          !Number.isInteger(value) ||
          value < 0 ||
          value > 3
        )
    );

    if (invalidAnswer) {
      return res.status(400).json({
        ok: false,
        error: "invalid-answers"
      });
    }

    /*
      ----------------------------------------------------------
      8. FIREBASE ADMIN
      ----------------------------------------------------------
    */

    const adminApp = getAdminApp();

    /*
      ----------------------------------------------------------
      9. VERIFY APP CHECK
      ----------------------------------------------------------
    */

    await getAppCheck(adminApp).verifyToken(
      appCheckToken
    );

    /*
      ----------------------------------------------------------
      10. SESSION + ATTEMPT COOKIES
      ----------------------------------------------------------
    */

    const session = cookie(
      req,
      "__kibo_session"
    );

    const attemptId = cookie(
      req,
      "__kibo_attempt"
    );

    if (!session || !attemptId) {
      return res.status(401).json({
        ok: false,
        error: "missing-session"
      });
    }

    /*
      ----------------------------------------------------------
      11. VERIFY FIREBASE SESSION
      ----------------------------------------------------------
    */

    const decoded = await getAuth(
      adminApp
    ).verifySessionCookie(
      session,
      true
    );

    if (!decoded.uid) {
      return res.status(403).json({
        ok: false,
        error: "invalid-session"
      });
    }

    /*
      ----------------------------------------------------------
      12. FIRESTORE ATTEMPT
      ----------------------------------------------------------
    */

    const firestore = getFirestore(
      adminApp
    );

    const ref = firestore
      .collection("testAttempts")
      .doc(attemptId);

    /*
      ----------------------------------------------------------
      13. ONE-TIME GRADING TRANSACTION
      ----------------------------------------------------------
    */

    const result = await firestore.runTransaction(
      async (tx) => {
        const snap = await tx.get(ref);

        if (!snap.exists) {
          throw new Error(
            "attempt-not-found"
          );
        }

        const attempt = snap.data();

        /*
          Attempt boshqa userniki bo'lmasligi kerak.
        */

        if (
          attempt.uid !== decoded.uid ||
          attempt.testId !== testId
        ) {
          throw new Error(
            "attempt-mismatch"
          );
        }

        /*
          Bir attempt faqat bir marta ishlaydi.
        */

        if (attempt.used === true) {
          throw new Error(
            "attempt-used"
          );
        }

        /*
          30 daqiqalik expiry.
        */

        const expiresAt =
          attempt.expiresAt?.toMillis?.() || 0;

        if (
          expiresAt &&
          expiresAt < Date.now()
        ) {
          throw new Error(
            "attempt-expired"
          );
        }

        /*
          ------------------------------------------------------
          REAL GRADING
          ------------------------------------------------------
        */

        let answered = 0;
        let correct = 0;

        for (
          let i = 0;
          i < key.length;
          i++
        ) {
          const selected = answers[i];

          if (
            selected !== null
          ) {
            answered++;

            if (
              selected === key[i]
            ) {
              correct++;
            }
          }
        }

        const total = key.length;

        const percent =
          total > 0
            ? Math.round(
                (correct / total) * 100
              )
            : 0;

        /*
          Attemptni ishlatilgan deb belgilaymiz.
        */

        tx.update(ref, {
          used: true,
          usedAt: Timestamp.now()
        });

        /*
          MUHIM:
          key ham,
          results ham,
          to'g'ri javob indekslari ham
          browserga yuborilmaydi.
        */

        return {
          correct,
          answered,
          total,
          percent
        };
      }
    );

    /*
      ----------------------------------------------------------
      14. SECURITY HEADERS
      ----------------------------------------------------------
    */

    res.setHeader(
      "Cache-Control",
      "no-store, private, max-age=0"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    /*
      ----------------------------------------------------------
      15. RESPONSE
      ----------------------------------------------------------
    */

    return res.status(200).json({
      ok: true,
      correct: result.correct,
      answered: result.answered,
      total: result.total,
      percent: result.percent
    });

  } catch (err) {

    const code = String(
      err?.message || ""
    );

    /*
      Attempt bilan bog'liq xatolar.
    */

    if (
      [
        "attempt-not-found",
        "attempt-mismatch",
        "attempt-used",
        "attempt-expired"
      ].includes(code)
    ) {
      return res.status(409).json({
        ok: false,
        error: code
      });
    }

    /*
      Answer key / Firebase / App Check
      xatolarini clientga ochmaymiz.
    */

    console.error(
      "Grade error:",
      err
    );

    return res.status(500).json({
      ok: false,
      error: "grading-failed"
    });
  }
};