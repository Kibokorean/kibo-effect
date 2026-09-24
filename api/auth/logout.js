module.exports = async function handler(req,res){
  res.setHeader("Set-Cookie","__kibo_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
  res.setHeader("Cache-Control","no-store, private");
  return res.status(200).json({ok:true});
};
