const { getApps, initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getAppCheck } = require("firebase-admin/app-check");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

function getAdminApp(){
  if (getApps().length) return getApps()[0];
  const projectId=process.env.FIREBASE_PROJECT_ID;
  const clientEmail=process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey=(process.env.FIREBASE_PRIVATE_KEY||"").replace(/\\n/g,"\n");
  if(!projectId||!clientEmail||!privateKey) throw new Error("Firebase Admin environment variables are missing");
  return initializeApp({credential:cert({projectId,clientEmail,privateKey})});
}

// Server-only answer keys. Never send these arrays to the browser.
const ANSWERS={
  "test-01": [
    2,
    3,
    1,
    3,
    0,
    0,
    0,
    1,
    2,
    3,
    1,
    0,
    1,
    0,
    1,
    0,
    0,
    1,
    3,
    3,
    3,
    0,
    0,
    0
  ],
  "test-02": [
    0,
    3,
    1,
    0,
    2,
    0,
    1,
    0,
    0,
    2,
    3,
    0,
    2,
    3,
    3,
    3,
    2,
    3,
    0,
    2,
    0,
    3,
    3,
    3
  ],
  "test-03": [
    0,
    1,
    1,
    1,
    0,
    1,
    2,
    0,
    2,
    1
  ],
  "test-04": [
    1,
    3,
    3,
    1,
    1,
    1,
    3,
    1,
    1,
    2
  ],
  "test-05": [
    0,
    0,
    0,
    0,
    3,
    0,
    2,
    3,
    1,
    0
  ],
  "test-06": [
    2,
    1,
    0,
    0,
    1,
    1,
    1,
    0,
    0,
    0
  ],
  "test-07": [
    3,
    2,
    2,
    2,
    1,
    0,
    0,
    2,
    1,
    0,
    3
  ],
  "test-08": [
    0,
    0,
    1,
    2,
    2,
    3,
    0,
    2,
    2,
    1,
    1
  ],
  "test-09": [
    1,
    2,
    2,
    3,
    2,
    1,
    3,
    3,
    3,
    0,
    0,
    1,
    3,
    0,
    0,
    2,
    1,
    1,
    2,
    1
  ],
  "test-10": [
    3,
    0,
    2,
    2,
    2,
    1,
    1,
    2,
    1,
    1,
    2,
    0,
    0,
    2,
    3,
    0,
    2,
    2,
    1,
    3,
    2,
    3,
    0,
    2,
    0,
    1,
    2,
    0,
    3,
    2,
    1,
    2
  ],
  "test-11": [
    1,
    0,
    3,
    3,
    1,
    1,
    0,
    3,
    2,
    0,
    1,
    0,
    3,
    3,
    1,
    1,
    0,
    3,
    2,
    0,
    2,
    1,
    2,
    0,
    3,
    2,
    2,
    3,
    2,
    0
  ],
  "test-12": [
    1,
    3,
    1,
    0,
    1,
    3,
    0,
    0,
    1,
    3,
    1,
    0,
    2,
    2,
    2,
    2,
    3,
    0,
    0,
    0
  ],
  "test-13": [
    3,
    3,
    3,
    2,
    1,
    2,
    2,
    2,
    2,
    3,
    0,
    1,
    1,
    3,
    0,
    1,
    3,
    2,
    0,
    1
  ],
  "test-14": [
    1,
    2,
    0,
    2,
    0,
    1,
    0,
    1,
    2,
    3,
    0,
    2,
    3,
    3,
    1,
    3,
    3,
    1,
    0,
    3
  ],
  "test-15": [
    2,
    0,
    3,
    2,
    2,
    3,
    3,
    2,
    3,
    2,
    3,
    2,
    3,
    0,
    3,
    0,
    2,
    3,
    0,
    2,
    1,
    0,
    3,
    2,
    0,
    2,
    0,
    0,
    2,
    3,
    0,
    2,
    0,
    2,
    2,
    3,
    0,
    1,
    1
  ],
  "test-16": [
    0,
    3,
    2,
    1,
    0,
    3,
    2,
    1,
    1,
    0,
    0,
    3,
    2,
    2,
    3,
    0,
    3,
    0,
    2,
    3,
    2,
    3,
    0,
    2,
    2,
    3,
    0,
    0,
    1,
    2,
    3,
    2,
    1,
    3,
    3,
    0,
    1,
    2,
    0,
    0
  ]
};

function cookie(req,name){const raw=String(req.headers.cookie||"");const m=raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));return m?decodeURIComponent(m[1]):"";}
function sameOrigin(req){const origin=String(req.headers.origin||"");if(!origin)return true;return ["https://kibo-effect.vercel.app","https://kibo-effect.firebaseapp.com","https://kibo-effect.web.app"].includes(origin);}

module.exports=async function handler(req,res){
  try{
    if(req.method!=="POST")return res.status(405).json({ok:false,error:"method-not-allowed"});
    if(!sameOrigin(req))return res.status(403).json({ok:false,error:"bad-origin"});
    const appCheckToken=String(req.headers["x-firebase-appcheck"]||"");
    if(!appCheckToken)return res.status(401).json({ok:false,error:"missing-appcheck"});
    let body=req.body;if(typeof body==="string")body=JSON.parse(body);
    const testId=String(body?.testId||"").toLowerCase();const answers=Array.isArray(body?.answers)?body.answers:null;
    if(!ANSWERS[testId])return res.status(400).json({ok:false,error:"invalid-test"});
    const key=ANSWERS[testId];
    if(!answers||answers.length!==key.length)return res.status(400).json({ok:false,error:"invalid-answer-count"});
    if(answers.some(v=>v!==null&&(!Number.isInteger(v)||v<0||v>3)))return res.status(400).json({ok:false,error:"invalid-answers"});
    const adminApp=getAdminApp();
    await getAppCheck(adminApp).verifyToken(appCheckToken);
    const session=cookie(req,"__kibo_session"),attemptId=cookie(req,"__kibo_attempt");
    if(!session||!attemptId)return res.status(401).json({ok:false,error:"missing-session"});
    const decoded=await getAuth(adminApp).verifySessionCookie(session,true);
    if(!decoded.uid)return res.status(403).json({ok:false,error:"invalid-session"});
    const ref=getFirestore(adminApp).collection("testAttempts").doc(attemptId);
    const result=await getFirestore(adminApp).runTransaction(async tx=>{
      const snap=await tx.get(ref);if(!snap.exists)throw new Error("attempt-not-found");
      const a=snap.data();if(a.uid!==decoded.uid||a.testId!==testId)throw new Error("attempt-mismatch");
      if(a.used===true)throw new Error("attempt-used");
      const exp=a.expiresAt?.toMillis?.()||0;if(exp&&exp<Date.now())throw new Error("attempt-expired");
      const results=answers.map((v,i)=>v!==null&&v===key[i]);
      const answered=answers.filter(v=>v!==null).length;const correct=results.filter(Boolean).length;const total=key.length;
      tx.update(ref,{used:true,usedAt:Timestamp.now()});return {correct,answered,total,percent:Math.round(correct/total*100),results};
    });
    res.setHeader("Cache-Control","no-store, private, max-age=0");res.setHeader("X-Content-Type-Options","nosniff");
    return res.status(200).json({ok:true,...result});
  }catch(err){
    const c=String(err?.message||"");if(["attempt-not-found","attempt-mismatch","attempt-used","attempt-expired"].includes(c))return res.status(409).json({ok:false,error:c});
    console.error("Grade error:",err);return res.status(500).json({ok:false,error:"grading-failed"});
  }
};
