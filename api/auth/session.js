const { getApps, initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getAppCheck } = require("firebase-admin/app-check");

function getAdminApp(){
  if (getApps().length) return getApps()[0];
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin environment variables are missing");
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

module.exports = async function handler(req,res){
  try {
    if (req.method !== "POST") return res.status(405).json({ok:false,error:"method-not-allowed"});
    const authHeader = String(req.headers.authorization || "");
    const appCheckToken = String(req.headers["x-firebase-appcheck"] || "");
    if (!authHeader.startsWith("Bearer ") || !appCheckToken) return res.status(401).json({ok:false,error:"missing-auth-or-appcheck"});
    const idToken = authHeader.slice(7).trim();
    const adminApp = getAdminApp();
    await getAppCheck(adminApp).verifyToken(appCheckToken);
    const decoded = await getAuth(adminApp).verifyIdToken(idToken, true);
    const expiresIn = 60 * 60 * 1000;
    const sessionCookie = await getAuth(adminApp).createSessionCookie(idToken, {expiresIn});
    res.setHeader("Set-Cookie", `__kibo_session=${encodeURIComponent(sessionCookie)}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax`);
    res.setHeader("Cache-Control","no-store, private");
    return res.status(200).json({ok:true,uid:decoded.uid,expiresIn});
  } catch (err) {
    console.error("Session create error:", err);
    return res.status(401).json({ok:false,error:"session-verification-failed"});
  }
};
