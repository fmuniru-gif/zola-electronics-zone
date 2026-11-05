const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const playwright=require(process.env.PLAYWRIGHT_CORE_PATH||'playwright-core');
const {startServer,chromeOptions,isolate}=require('./support.cjs');
const slugs=['televisions-tamale','refrigerators-freezers-tamale','washing-machines-tamale','air-conditioners-tamale'];
let server,browser;
before(async()=>{server=await startServer();browser=await playwright.chromium.launch(chromeOptions());});
after(async()=>{if(browser)await browser.close();if(server)await server.close();});
test('four buying guides render without JavaScript, broken assets, network submissions or overflow from 320px to desktop',async()=>{
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false});const outbound=await isolate(context,server.origin),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{for(const slug of slugs){
   const response=await page.goto(server.origin+'/guides/'+slug+'.html');assert.equal(response.status(),200);
   const data=await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));return {width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,canonical:document.querySelector('[rel="canonical"]').href,robots:document.querySelector('[name="robots"]').content,images:[...document.images].map(i=>({loaded:!!i.naturalWidth,width:i.clientWidth,height:i.clientHeight})),forms:document.forms.length,scripts:[...document.scripts].filter(s=>s.type!=='application/ld+json').length};});
   assert.ok(data.scroll<=width+1,JSON.stringify({slug,width,data}));assert.equal(data.h1,1);assert.equal(data.canonical,'https://zolaelectronicszone.com/guides/'+slug+'.html');assert.equal(data.robots,'index,follow');assert.equal(data.forms,0);assert.equal(data.scripts,0);assert.deepEqual(data.images,[{loaded:true,width:52,height:52}]);
  }assert.deepEqual(outbound,[]);assert.deepEqual(errors,[]);}finally{await context.close();}
 }
});
test('homepage guide links, keyboard skip navigation and cross-guide links remain usable',async()=>{
 const context=await browser.newContext({viewport:{width:390,height:844}});await isolate(context,server.origin);const page=await context.newPage();
 try{
  await page.goto(server.origin);assert.equal(await page.locator('#buying-guides .local-guide-card').count(),4);
  await page.locator('#buying-guides a[href="guides/televisions-tamale.html"]').click();assert.ok(page.url().endsWith('/guides/televisions-tamale.html'));await page.waitForLoadState('load');
  await page.keyboard.press('Tab');assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);assert.ok((await page.locator('.skip-link').boundingBox()).y>=0);await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#main');
  await page.getByRole('navigation',{name:'Other buying guides'}).getByRole('link',{name:'Washing machine guide'}).click();assert.ok(page.url().endsWith('/guides/washing-machines-tamale.html'));
  await page.getByRole('link',{name:'Visit us in Tamale'}).click();assert.equal(new URL(page.url()).pathname,'/');assert.equal(new URL(page.url()).hash,'#visit');
 }finally{await context.close();}
});
test('guide WhatsApp links prepare the appropriate enquiry only after a deliberate click',async()=>{
 const context=await browser.newContext();const outbound=await isolate(context,server.origin),page=await context.newPage();
 try{for(const slug of slugs){
  await page.goto(server.origin+'/guides/'+slug+'.html');const count=outbound.length;await page.getByRole('link',{name:'Enquire on WhatsApp: 055 348 6788'}).waitFor({state:'visible'});assert.equal(outbound.length,count);
  const popupPromise=page.waitForEvent('popup');await page.getByRole('link',{name:'Enquire on WhatsApp: 055 348 6788'}).click();const popup=await popupPromise;await popup.waitForLoadState();const req=outbound.at(-1),url=new URL(req.url);assert.equal(outbound.length,count+1);assert.equal(req.method,'GET');assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/233553486788');assert.ok(url.searchParams.get('text').startsWith('Hello Zola Electronics Zone.'));await popup.close();
 }const stored=await page.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),databases:await indexedDB.databases(),workers:await navigator.serviceWorker.getRegistrations()}));assert.deepEqual(stored,{local:[],session:[],databases:[],workers:[]});assert.deepEqual(await context.cookies(),[]);}finally{await context.close();}
});
