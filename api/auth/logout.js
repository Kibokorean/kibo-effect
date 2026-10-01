module.exports = async function handler(req,res){
  const cookies = [
    "__kibo_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
    ...Array.from({length:16},(_,i)=>`__kibo_attempt_test_${String(i+1).padStart(2,'0')}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`)
  ];
  res.setHeader("Set-Cookie", cookies);
  res.setHeader("Cache-Control","no-store, private");
  return res.status(200).json({ok:true});
};
