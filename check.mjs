

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app-check.js";

import {
  initializeAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
  signOut,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* FIREBASE CONFIG */

const firebaseConfig = {

  apiKey:
    "AIzaSyDiPu8HXGlSHJTrM0sWmJaJQqtYai0rQlo",

  authDomain:
    "kibo-effect.firebaseapp.com",

  projectId:
    "kibo-effect",

  storageBucket:
    "kibo-effect.firebasestorage.app",

  messagingSenderId:
    "31759655527",

  appId:
    "1:31759655527:web:4e3ec3db90a87147f76ac2"
};


/* INITIALIZE */

const firebaseApp = initializeApp(firebaseConfig);

/*
 * FIREBASE APP CHECK
 * Use the SAME Web score-based reCAPTCHA Enterprise site key that was used
 * when "KIBO EFFECT WEB" was registered in Firebase Console -> App Check.
 *
 * The site key is a public browser value. Never put a reCAPTCHA secret key,
 * Firebase Admin credential, service-account JSON, or other server secret here.
 */
const RECAPTCHA_ENTERPRISE_SITE_KEY = "6LcBB80tAAAAADX7WCPLKajV1HHwVDnyaDKLyI6o";
let appCheck = null;

if (
  RECAPTCHA_ENTERPRISE_SITE_KEY &&
  !RECAPTCHA_ENTERPRISE_SITE_KEY.includes("PASTE_YOUR_")
) {
  appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
  window.__kiboGetAppCheckToken = () => getToken(appCheck, true).then(r => r.token);
}

// Use durable browser persistence with IndexedDB first and localStorage
// as a fallback. Explicitly provide the popup resolver for mobile browsers.
const auth = initializeAuth(firebaseApp, {
  persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence
  ],
  popupRedirectResolver: browserPopupRedirectResolver
});

const db = getFirestore(firebaseApp);

const provider = new GoogleAuthProvider();
// Do not force account selection. Returning users keep their Firebase session
// and do not need to choose their Google account again.



/* ELEMENTS */

const login =
  document.getElementById("login");

const app =
  document.getElementById("app");

const error =
  document.getElementById("error");

const googleLogin =
  document.getElementById("googleLogin");

const logoutBtn =
  document.getElementById("logoutBtn");

const userBtn =
  document.getElementById("userBtn");

const userMenu =
  document.getElementById("userMenu");

const userPhoto =
  document.getElementById("userPhoto");

const userName =
  document.getElementById("userName");

const menuUserPhoto =
  document.getElementById("menuUserPhoto");

const menuUserName =
  document.getElementById("menuUserName");

const menuUserEmail =
  document.getElementById("menuUserEmail");

const frame =
  document.getElementById("testWorkspace");

const buttons =
  [...document.querySelectorAll("[data-lesson]")];


/* USER PROFILE */

function setProfile(user){

  const name = user?.displayName ||
    user?.email?.split("@")[0] ||
    "Foydalanuvchi";

  const email = user?.email || "";
  const photo = user?.photoURL || "";

  userName.textContent = name;
  menuUserName.textContent = name;
  menuUserEmail.textContent = email;

  if(photo){
    userPhoto.src = photo;
    menuUserPhoto.src = photo;
    userPhoto.style.visibility = "visible";
    menuUserPhoto.style.visibility = "visible";
  }else{
    userPhoto.removeAttribute("src");
    menuUserPhoto.removeAttribute("src");
  }
}

function clearProfile(){
  userName.textContent = "Foydalanuvchi";
  menuUserName.textContent = "Foydalanuvchi";
  menuUserEmail.textContent = "";
  userPhoto.removeAttribute("src");
  menuUserPhoto.removeAttribute("src");
  userMenu.hidden = true;
  userBtn.setAttribute("aria-expanded","false");
}

userBtn.addEventListener("click", event => {
  event.stopPropagation();
  userMenu.hidden = !userMenu.hidden;
  userBtn.setAttribute("aria-expanded", String(!userMenu.hidden));
});

document.addEventListener("click", event => {
  if(!userAreaContains(event.target)){
    userMenu.hidden = true;
    userBtn.setAttribute("aria-expanded","false");
  }
});

function userAreaContains(target){
  const area = document.getElementById("userArea");
  return area && area.contains(target);
}
const profileProgressBtn=document.getElementById("profileProgressBtn");
if(profileProgressBtn) profileProgressBtn.addEventListener("click",()=>{userMenu.hidden=true;showHome();document.getElementById("home")?.scrollIntoView({behavior:"smooth"})});

/* TEST SOURCES */

const sources = {
  "읽기 1–2":"/api/test/test-01",
  "읽기 3–4":"/api/test/test-02",
  "읽기 5":"/api/test/test-03",
  "읽기 6":"/api/test/test-04",
  "읽기 7":"/api/test/test-05",
  "읽기 8":"/api/test/test-06",
  "읽기 9":"/api/test/test-07",
  "읽기 10":"/api/test/test-08",
  "읽기 11–12":"/api/test/test-09",
  "읽기 13–15":"/api/test/test-10",
  "읽기 16–18":"/api/test/test-11",
  "읽기 19–20":"/api/test/test-12",
  "읽기 21–22":"/api/test/test-13",
  "읽기 23–24":"/api/test/test-14",
  "읽기 25–27":"/api/test/test-15",
  "읽기 28–31":"/api/test/test-16"
};


/* OPEN LESSON */

async function openLesson(label){
  const src=sources[label];if(!src)return;
  app.classList.remove("home","vocabulary-mode");document.getElementById("vocabularyView").hidden=true;
  frame.hidden=false;frame.style.display="block";frame.innerHTML='<div class="test-loading">TOPIK testi xavfsiz tarzda yuklanmoqda…</div>';
  localStorage.setItem("kibo-last-route",label);
  try{
    const response=await fetch(src,{credentials:"same-origin",cache:"no-store"});if(!response.ok)throw new Error("Testga kirish rad etildi ("+response.status+")");
    const parsed=new DOMParser().parseFromString(await response.text(),"text/html");
    const scopeCss=css=>{let out="",i=0,start=0;while(i<css.length){if(css[i]==="{"){const head=css.slice(start,i).trim();let depth=1,j=i+1;while(j<css.length&&depth){if(css[j]==="{")depth++;else if(css[j]==="}")depth--;j++;}const inner=css.slice(i+1,j-1);if(/^@(media|supports|container)\b/.test(head))out+=head+"{"+scopeCss(inner)+"}";else if(head.startsWith("@"))out+=head+"{"+inner+"}";else{const sels=head.split(",").map(x=>{x=x.trim().replace(/^(html|body|:root)(?=[:.#\s\[]|$)/,"#testWorkspace").replace(/^\.(night|day)(?=[:.#\s\[]|$)/,"#testWorkspace$&");return x==="#testWorkspace"||x.startsWith("#testWorkspace")?x:"#testWorkspace "+x});out+=sels.join(",")+"{"+inner+"}";}i=j;start=j;}else{i++;}}return out+css.slice(start);};
    for(const style of parsed.querySelectorAll("style")){const s=document.createElement("style");s.textContent=scopeCss(style.textContent);frame.appendChild(s);}
    const page=parsed.body.cloneNode(true);page.querySelectorAll("script,style").forEach(n=>n.remove());frame.insertAdjacentHTML("beforeend",page.innerHTML);
    window.kiboTestStorage=new Proxy(window.localStorage,{get(target,key){if(["getItem","setItem","removeItem"].includes(key))return(name,...args)=>target[key]("__kibo_test_"+auth.currentUser.uid+"_"+name,...args);const v=target[key];return typeof v==="function"?v.bind(target):v;}});
    if(!window.kiboTestGradeBridge){window.kiboTestGradeBridge=true;const baseFetch=window.fetch.bind(window);window.fetch=async(...args)=>{const response=await baseFetch(...args);try{const url=String(args[0]?.url||args[0]||"");if(url.includes("/api/test/grade"))response.clone().json().then(data=>{if(data?.ok&&auth.currentUser)loadDashboard(auth.currentUser);}).catch(()=>{});}catch{}return response;};}
    const scopedDocument={get body(){return frame;},get documentElement(){return frame;},getElementById(id){return frame.querySelector("#"+CSS.escape(id));},querySelector(s){return frame.querySelector(s);},querySelectorAll(s){return frame.querySelectorAll(s);},createElement(tag){return document.createElement(tag);},addEventListener(...a){return frame.addEventListener(...a);}};
    window.kiboTestDocument=scopedDocument;
    for(const old of parsed.querySelectorAll("script")){const s=document.createElement("script");s.textContent=old.textContent.replace(/\bwindow\.localStorage\b/g,"window.kiboTestStorage").replace(/window\.parent!==window && typeof window\.parent\.__kiboGetAppCheckToken==="function"/g,'typeof window.__kiboGetAppCheckToken==="function"').replace(/await window\.parent\.__kiboGetAppCheckToken\(\)/g,'await window.__kiboGetAppCheckToken()').replace(/document\.getElementById\((["'])resultPanel\1\)\.scrollIntoView\(/g,'document.getElementById("resultPanel")?.scrollIntoView?.(').replace(/\bdocument\./g,"window.kiboTestDocument.");document.body.appendChild(s);s.remove();}
    sendMasterTheme();
  }catch(e){frame.innerHTML="<div class='test-loading'>Test yuklanmadi. Qayta kirib urinib ko‘ring.</div>";console.error("TOPIK test load:",e);}
}


/* SERVER SESSION */

async function createServerSession(user){
  if(!user) throw new Error("no-user");
  if(!appCheck) throw new Error("app-check-not-initialized");

  const [idTokenResult, appCheckResult] = await Promise.all([
    user.getIdToken(true),
    getToken(appCheck, false)
  ]);

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idTokenResult}`,
      "X-Firebase-AppCheck": appCheckResult.token,
      "Content-Type": "application/json"
    },
    credentials: "include",
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({}));

  if(!response.ok || !payload.ok){
    throw new Error(payload.error || `session-http-${response.status}`);
  }

  return payload;
}

async function clearServerSession(){
  try{
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store"
    });
  }catch(err){
    console.warn("Server logout error:", err);
  }
}


/* GOOGLE LOGIN */

googleLogin.addEventListener(
  "click",
  async () => {

    error.textContent = "";

    // Keep the protected app hidden until Firestore approval is confirmed.
    login.style.display = "grid";
    app.style.display = "none";
    app.setAttribute("aria-hidden", "true");

    googleLogin.disabled = true;

    googleLogin.textContent =
      "Kirish...";

    try{

      await signInWithPopup(
        auth,
        provider
      );

    }catch(err){

      console.error(err);

      // A cancelled/closed Google popup must never reveal the app.
      login.style.display = "grid";
      app.style.display = "none";
      app.setAttribute("aria-hidden", "true");
      app.classList.add("home");
      frame.hidden=true;frame.replaceChildren();

      if(err?.code === "auth/popup-blocked" || err?.code === "auth/operation-not-supported-in-this-environment"){
        error.textContent = "Popup bloklandi. Redirect orqali Google kirishi ochilmoqda...";
        try { await signInWithRedirect(auth, provider); return; } catch(redirectErr){ console.error(redirectErr); }
      } else if(err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request"){
        error.textContent = "Google orqali kirish bekor qilindi.";
      } else if(err?.code === "auth/unauthorized-domain"){
        error.textContent = "Bu domen Firebase Authentication'da ruxsat etilmagan.";
      } else if(err?.code === "auth/network-request-failed"){
        error.textContent = "Internet aloqasi bilan muammo. Qayta urinib ko‘ring.";
      } else {
        error.textContent = "Google orqali kirishda xatolik yuz berdi.";
      }
      googleLogin.disabled = false;
      googleLogin.textContent = "Google orqali kirish";

    }

  }
);


/* LOGOUT */

logoutBtn.addEventListener(
  "click",
  async () => {

    try{
      await clearServerSession();
      await signOut(auth);

    }catch(err){

      console.error(err);

    }

  }
);


/* AUTH STATE */

async function loadDashboard(user){
  const stats={tests:0,correct:0,total:0,answered:0,days:new Set(),recent:[]};
  try{
    const snap=await getDocs(collection(db,"users",user.uid,"history"));
    snap.forEach(x=>{const d=x.data();stats.tests++;stats.correct+=Number(d.correct)||0;stats.total+=Number(d.total)||0;stats.answered+=Number(d.answered)||0;const ts=d.submittedAt?.toDate?.();if(ts){stats.days.add(ts.toISOString().slice(0,10));stats.recent.push({...d,submittedAt:ts})}});
    stats.recent.sort((a,b)=>b.submittedAt-a.submittedAt);
  }catch(e){console.warn("Dashboard load:",e)}
  const pct=stats.total?Math.round(stats.correct/stats.total*100):0;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
  set("liveTests",stats.tests);set("liveAccuracy",pct+"%");set("liveAnswered",stats.total?`${stats.correct}/${stats.total}`:"0/0");set("liveDays",stats.days.size+" kun");
  const totalQuestions=stats.total||0;
  const heroFill=document.getElementById("liveHeroFill");if(heroFill)heroFill.style.width=(totalQuestions?Math.min(100,Math.round(stats.correct/totalQuestions*100)):0)+"%";
  set("liveHeroText",stats.total?`${stats.correct} / ${stats.total}`:"0 / 0");set("liveHeroPercent",pct+"%");set("liveAccuracy2",pct+"%");const overall=document.getElementById("liveOverallFill");if(overall)overall.style.width=pct+"%";
  const list=document.getElementById("recentLessons");
  const routes={"test-01":"읽기 1–2","test-02":"읽기 3–4","test-03":"읽기 5","test-04":"읽기 6","test-05":"읽기 7","test-06":"읽기 8","test-07":"읽기 9","test-08":"읽기 10","test-09":"읽기 11–12","test-10":"읽기 13–15","test-11":"읽기 16–18","test-12":"읽기 19–20","test-13":"읽기 21–22","test-14":"읽기 23–24","test-15":"읽기 25–27","test-16":"읽기 28–31"};
  if(list){list.innerHTML=stats.recent.slice(0,5).map(d=>`<button type="button" class="lesson-row live-row" data-history="${d.testId}"><div class="lesson-thumb">✓</div><div><strong>${routes[d.testId]||d.testId}</strong><span>${d.submittedAt.toLocaleDateString("uz-UZ")} · ${d.correct}/${d.total}</span></div><div class="lesson-progress"><div class="mini-track"><i style="width:${d.percent}%;background:#696bf0"></i></div><em>${d.percent}%</em></div></button>`).join("") || `<div class="empty-state">Hali test natijalari yo‘q.</div>`;list.querySelectorAll("[data-history]").forEach(b=>b.addEventListener("click",()=>openLesson(routes[b.dataset.history]||"읽기 1–2")));}
  const cal=document.getElementById("liveCalendar");if(cal){const now=new Date();now.setHours(0,0,0,0);cal.innerHTML=Array.from({length:35},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-34+i);const k=d.toISOString().slice(0,10);return `<span class="${stats.days.has(k)?"done":""}">${d.getDate()}</span>`}).join("");}
}

onAuthStateChanged(auth, async user=>{
  login.style.display="grid";app.style.display="none";app.setAttribute("aria-hidden","true");app.classList.add("home");frame.hidden=true;frame.replaceChildren();
  if(!user){clearProfile();if(vocabObserver){vocabObserver.disconnect();vocabObserver=null;}vocabLoaded=false;vocabLoadedUid=null;vocabRoot.replaceChildren();googleLogin.disabled=false;googleLogin.textContent="Google orqali kirish";return;}
  try{
    await createServerSession(user);
    const userRef=doc(db,"users",user.uid), snap=await getDoc(userRef), now=serverTimestamp();
    const profile={uid:user.uid,name:user.displayName||snap.data()?.name||"",email:user.email||snap.data()?.email||"",photoURL:user.photoURL||snap.data()?.photoURL||"",lastLogin:now};
    if(!snap.exists()){profile.createdAt=now;await setDoc(userRef,profile)}else await updateDoc(userRef,profile);
    setProfile(user);login.style.display="none";app.style.display="grid";app.setAttribute("aria-hidden","false");app.classList.add("home");frame.hidden=true;frame.replaceChildren();error.textContent="";await loadDashboard(user);
  }catch(err){console.error("KIBO startup/session error:",err);error.textContent=(err?.message||"").includes("session")||(err?.message||"").includes("app-check")?"Xavfsiz sessiya yaratilmadi. Sahifani yangilang yoki qayta kiring.":"Profilni yuklashda xatolik yuz berdi.";app.style.display="none";app.setAttribute("aria-hidden","true");try{await clearServerSession();await signOut(auth)}catch(e){}}
});
getRedirectResult(auth).catch(err=>{if(err)console.warn("Google redirect result:",err)});

/* HOME */

function showHome(){

  app.classList.add("home");app.classList.remove("vocabulary-mode");
  document.getElementById("vocabularyView").hidden=true;frame.hidden=true;frame.replaceChildren();

}


document
  .getElementById("homeBtn")
  .addEventListener(
    "click",
    showHome
  );



const vocabView=document.getElementById("vocabularyView"), vocabRoot=document.getElementById("vocabWorkspace");
let vocabLoaded=false,vocabLoadedUid=null,vocabObserver=null;
async function openVocabulary(){
  if(!auth.currentUser){showHome();return;}
  app.classList.remove("home");app.classList.add("vocabulary-mode");frame.style.display="none";vocabView.hidden=false;
  if(vocabLoaded&&vocabLoadedUid===auth.currentUser.uid){vocabRoot.scrollIntoView({behavior:"smooth",block:"start"});return;}
  if(vocabObserver){vocabObserver.disconnect();vocabObserver=null;}vocabLoaded=false;vocabRoot.replaceChildren();
  vocabRoot.innerHTML='<div class="vocab-loading">Lug‘at yuklanmoqda…</div>';
  try{
    const res=await fetch('/vocabulary.fragment.html',{credentials:'same-origin'});if(!res.ok)throw new Error('Lug‘at yuklanmadi');
    const raw=await res.text(), parsed=new DOMParser().parseFromString(raw,'text/html');
    const data=await getDoc(doc(db,'users',auth.currentUser.uid,'progress','vocabulary'));
    const saved=data.exists()&&data.data().vocabulary||{};
    const cachePrefix='__kibo_vocab_'+auth.currentUser.uid+'_';
    window.kiboVocabStorage={getItem(key){return localStorage.getItem(cachePrefix+key)??saved[key]??null;},setItem(key,val){localStorage.setItem(cachePrefix+key,String(val));saved[key]=String(val);setDoc(doc(db,'users',auth.currentUser.uid,'progress','vocabulary'),{vocabulary:saved},{merge:true}).catch(e=>console.error('Lug‘at progressini saqlab bo‘lmadi',e));},removeItem(key){localStorage.removeItem(cachePrefix+key);delete saved[key];setDoc(doc(db,'users',auth.currentUser.uid,'progress','vocabulary'),{vocabulary:saved},{merge:true}).catch(e=>console.error(e));}};
    const styles=[...parsed.querySelectorAll('style')];styles.forEach(s=>{const st=document.createElement('style');st.textContent=s.textContent;vocabRoot.appendChild(st);});
    const body=parsed.body.cloneNode(true);body.querySelectorAll('script,style').forEach(x=>x.remove());
    vocabRoot.insertAdjacentHTML('beforeend',body.innerHTML);
    window.kiboVocabRoot=vocabRoot;window.kiboVocabGet=id=>vocabRoot.querySelector('#'+CSS.escape(id));
    const patchScript=(text)=>text.replace(/\blocalStorage\.(getItem|setItem|removeItem)\s*\(/g,'kiboVocabStorage.$1(').replace(/document\.body/g,'window.kiboVocabRoot').replace(/document\.getElementById\(/g,'kiboVocabGet(').replace(/document\.querySelector(All)?\(/g,'window.kiboVocabRoot.querySelector$1(').replace(/document\.addEventListener\(/g,'window.kiboVocabRoot.addEventListener(').replace(/(?<!\?)\.scrollIntoView\(/g,'?.scrollIntoView?.(');
    for(const [i,old] of [...parsed.querySelectorAll('script')].entries()){const s=document.createElement('script');s.textContent=patchScript(old.textContent)+'\n//# sourceURL=kibo-vocabulary-'+(old.id||('script-'+i))+'.js';document.body.appendChild(s);s.remove();}
    vocabLoaded=true;vocabLoadedUid=auth.currentUser.uid;
    vocabObserver=new MutationObserver(()=>{const dark=vocabRoot.classList.contains('night');if((document.documentElement.dataset.theme==='dark')!==dark)applyTheme(dark?'dark':'light');});vocabObserver.observe(vocabRoot,{attributes:true,attributeFilter:['class']});
    vocabRoot.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){vocabRoot.innerHTML='<div class="vocab-loading">Lug‘atni ochishda xatolik. Sahifani yangilang.</div>';console.error(e);}
}
document.getElementById('openVocabulary')?.addEventListener('click',openVocabulary);
document.getElementById('openVocabularyNav')?.addEventListener('click',openVocabulary);

/* HOME MESSAGE FROM TEST IFRAMES */
window.addEventListener("message", event => {
  if(event.source !== window) return;
  if(event.data && event.data.type === "kibo-home"){
    showHome();
    return;
  }
  if(event.data && event.data.type === "kibo-module-ready"){
    sendMasterTheme();
    return;
  }
  if(event.data && event.data.type === "kibo-close-module"){
    showHome();
    return;
  }
  if(event.data && event.data.type === "kibo-test-height" && Number.isFinite(Number(event.data.height))){
    const h=Math.max(300, Number(event.data.height));
    frame.style.minHeight=h+"px";
  }
  if(event.data && event.data.type === "kibo-test-result" && auth.currentUser){ loadDashboard(auth.currentUser); }
});


/* KIBO DARS MODULES */
document.querySelectorAll("[data-dars]").forEach(card => {
  card.addEventListener("click", () => {
    openLesson(card.dataset.dars === "1" ? "1-DARS" : "2-DARS");
  });
});

/* HOME TEST CARDS */

document
  .querySelectorAll("[data-open]")
  .forEach(card => card.addEventListener("click", () => openLesson(card.dataset.open)));


/* NAV BUTTONS */

buttons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      app.classList.remove(
        "home"
      );

      openLesson(
        button.dataset.lesson
      );

    }
  );

});



/* SEARCH / PROFILE SHORTCUTS */
const globalSearch=document.getElementById("globalSearch");
function runSearch(){
  const q=(globalSearch?.value||"").trim().toLowerCase();
  document.querySelectorAll(".course-card,.test-row,.lesson-row").forEach(el=>{
    if(!q){el.style.display="";return;}
    el.style.display=el.innerText.toLowerCase().includes(q)?"":"none";
  });
}
if(globalSearch){globalSearch.addEventListener("input",runSearch);document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();globalSearch.focus();}})}
const goalSettings=document.getElementById("goalSettings");
if(goalSettings) goalSettings.addEventListener("click",()=>{userMenu.hidden=false;userBtn.setAttribute("aria-expanded","true");userBtn.focus();});

/* DAY / NIGHT MODE */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

function sendMasterTheme(){
  const dark=document.documentElement.dataset.theme==="dark";if(frame)frame.classList.toggle("day",!dark);if(vocabLoaded)vocabRoot.classList.toggle("night",dark);
}

function applyTheme(theme){
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeIcon.textContent = dark ? "🌙" : "☀️";
  themeText.textContent = dark ? "Night" : "Day";
  themeToggle.setAttribute("aria-label", dark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish");
  sendMasterTheme();
}

const savedTheme = localStorage.getItem("kibo-theme");
applyTheme(savedTheme === "dark" ? "dark" : "light");

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("kibo-theme", next);
  applyTheme(next);
});


