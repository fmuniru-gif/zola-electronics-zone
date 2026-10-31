const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const playwright=require(process.env.PLAYWRIGHT_CORE_PATH||'playwright-core');
const {startServer,chromeOptions,isolate}=require('./support.cjs');
let server,browser;
before(async()=>{server=await startServer();browser=await playwright.chromium.launch(chromeOptions());});
after(async()=>{if(browser)await browser.close();if(server)await server.close();});
for(const width of [390,1440])test(`email request on ${width}px uses chooser without blank mailto popup`,async()=>{
 const context=await browser.newContext({viewport:{width,height:900}}),outbound=await isolate(context,server.origin),errors=[];
 context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
 const page=await context.newPage();try{
  await page.goto(server.origin,{waitUntil:'networkidle'});
  await page.locator('#zezOrgName').fill('Example institution');
  await page.locator('#zezRequester').fill('Example person');
  await page.locator('#zezContact').fill('example@example.org');
  await page.locator('#zezRequestDetails').fill('5 televisions and 10 freezers');
  await page.locator('[data-procurement-channel="email"]').click();
  assert.equal(await page.locator('#zezEmailOptions').isVisible(),true);
  assert.equal(await page.locator('#zezProcurementFallback').isVisible(),false);
  const gmail=new URL(await page.locator('#zezGmailLink').getAttribute('href'));
  assert.equal(gmail.hostname,'mail.google.com');
  assert.equal(gmail.searchParams.get('to'),'zolaelectronicszone@gmail.com');
  assert.ok(gmail.searchParams.get('body').includes('5 televisions and 10 freezers'));
  const mailto=await page.locator('#zezEmailAppLink').getAttribute('href');
  assert.ok(mailto.startsWith('mailto:zolaelectronicszone@gmail.com?subject='));
  assert.equal(outbound.length,0,'No network submission before the visitor chooses to send');
  assert.deepEqual(errors,[]);
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));
  await page.locator('[data-procurement-channel="whatsapp"]').click();
  assert.equal(await page.locator('#zezEmailOptions').isVisible(),false);
  assert.equal(await page.locator('#zezProcurementFallback').isVisible(),true);
 }finally{await context.close();}
});
