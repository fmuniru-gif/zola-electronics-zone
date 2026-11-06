const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const playwright=require('playwright-core');
const {startServer,chromeOptions,isolate}=require('./support.cjs');
let server,browser;
before(async()=>{server=await startServer();browser=await playwright.chromium.launch(chromeOptions());});
after(async()=>{if(browser)await browser.close();if(server)await server.close();});

test('directions identify the exact shop; reviews only open after a deliberate click',async()=>{
 const context=await browser.newContext(),outbound=await isolate(context,server.origin),page=await context.newPage();
 try{
  await page.goto(server.origin,{waitUntil:'networkidle'});
  assert.equal(outbound.length,0);
  const directions=page.getByRole('link',{name:'Get directions to our shop'}),url=new URL(await directions.getAttribute('href'));
  assert.equal(url.origin,'https://www.google.com');assert.ok(url.pathname.startsWith('/maps/dir//'));
  assert.ok(url.pathname.includes('0xfd43ddc04dd3123:0x707e0ed39a04177e'));
  const listing=page.getByRole('link',{name:'View our shop on Google Maps'});
  assert.ok((await listing.getAttribute('href')).includes('/maps/place/Zola+Electronics+Zone/'));
  const opened=page.waitForEvent('popup');await page.getByRole('link',{name:'Leave a Google review',exact:false}).click();
  const popup=await opened;await popup.waitForLoadState();
  assert.equal(outbound.length,1);assert.equal(outbound[0].url,'https://g.page/r/CX4XBJrTDn5wEBM/review');assert.equal(outbound[0].method,'GET');await popup.close();
  await page.getByRole('link',{name:'Print a review card',exact:false}).click();
  assert.equal(new URL(page.url()).pathname,'/review-card.html');assert.equal(outbound.length,1);
  assert.equal(await page.getByRole('button',{name:'Print A5 review card',exact:true}).isVisible(),true);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,follow');
 }finally{await context.close();}
});

test('review card works without JavaScript, fits small screens and prints on one A5 sheet',async()=>{
 const context=await browser.newContext({javaScriptEnabled:false}),outbound=await isolate(context,server.origin),page=await context.newPage();
 try{
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});await page.goto(server.origin+'/review-card.html');
   await page.locator('.qr').evaluate(img=>img.decode());
   const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));
   assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));assert.deepEqual(layout.broken,[]);
   assert.equal(await page.getByRole('button',{name:'Print A5 review card',exact:true}).isVisible(),false);
   assert.equal(await page.getByRole('link',{name:'Download QR image',exact:true}).isVisible(),true);
  }
  await page.emulateMedia({media:'print'});
  const layout=await page.locator('.paper').evaluate(el=>({height:el.getBoundingClientRect().height,scroll:el.scrollHeight,width:el.getBoundingClientRect().width}));
  assert.ok(Math.abs(layout.width-148*96/25.4)<1);assert.ok(Math.abs(layout.height-210*96/25.4)<1);
  assert.ok(layout.scroll<=layout.height+1,JSON.stringify(layout));
  assert.equal(await page.locator('.print-tools').isVisible(),false);
  const pdf=await page.pdf({preferCSSPageSize:true,printBackground:true});
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length,1,'review card must fit one printed sheet');
  assert.equal(outbound.length,0);
 }finally{await context.close();}
});
