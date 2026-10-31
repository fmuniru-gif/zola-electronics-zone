const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const playable=new Set(['index.html','styles.css','script.js','robots.txt','sitemap.xml',...fs.readdirSync(path.join(root,'assets')).map(name=>'assets/'+name)]);
// GALLERY_ASSET_SERVER_ALLOWLIST_R1: serve only known gallery resource types from this repository.
// The older test server only enumerated assets/*, leaving assets/gallery/* as HTTP 404.
const galleryDir=path.join(root,'assets','gallery');
for(const entry of fs.readdirSync(galleryDir,{withFileTypes:true})){
  if(!entry.isFile())continue;
  if(/^(?:manifest\.json|gallery\.js|lightbox\.(?:js|css)|[a-zA-Z0-9_-]+\.(?:webp|jpe?g|png|mp4|webm))$/.test(entry.name))
    playable.add('assets/gallery/'+entry.name);
}
async function startServer(ref){
  const memo=new Map(),requests=[];
  const server=http.createServer((req,res)=>{
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';
    requests.push({path:name,method:req.method});
    if(req.method!=='GET'||!playable.has(name)){res.writeHead(404);return res.end('Not found');}
    if(!memo.has(name))memo.set(name,ref?execFileSync('git',['show',ref+':'+name],{cwd:root,maxBuffer:5*1024*1024}):fs.readFileSync(path.join(root,name)));
    res.setHeader('Content-Type',name.endsWith('.html')?'text/html; charset=utf-8':name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':name.endsWith('.webp')?'image/webp':'text/plain');
    res.setHeader('Cache-Control','no-store');res.end(memo.get(name));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {origin:'http://127.0.0.1:'+server.address().port,requests,close:()=>new Promise(resolve=>server.close(resolve))};
}
function chromeOptions(){return {headless:true,executablePath:process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'};}
async function isolate(context,origin){
  const outbound=[];
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin===origin)return route.continue();
    outbound.push({url:url.href,method:route.request().method()});
    return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Intercepted review-only external link</title><p>No external request was sent.</p>'});
  });return outbound;
}
module.exports={startServer,chromeOptions,isolate,root};
