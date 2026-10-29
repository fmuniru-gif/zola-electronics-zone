const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const playwright=require(process.env.PLAYWRIGHT_CORE_PATH||'playwright-core');
const {startServer,chromeOptions,isolate}=require('./support.cjs');
let server,browser;
before(async()=>{server=await startServer();browser=await playwright.chromium.launch(chromeOptions());});
after(async()=>{if(browser)await browser.close();if(server)await server.close();});
async function fixture(options={}){
  const context=await browser.newContext({viewport:{width:390,height:844},...options}),outbound=await isolate(context,server.origin),errors=[];
  context.on('page',p=>p.on('pageerror',e=>errors.push(String(e))));
  const page=await context.newPage();await page.goto(server.origin,{waitUntil:'networkidle'});
  return {context,page,outbound,errors};
}

test('320px, mobile, tablet and desktop retain complete local assets with no horizontal overflow',async()=>{
  for(const width of [320,390,768,1440]){
    const f=await fixture({viewport:{width,height:1000}});
    try{
      await f.page.evaluate(async()=>{for(const image of document.images)image.loading='eager';await Promise.all([...document.images].map(image=>image.decode().catch(()=>null)));});
      const layout=await f.page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('h1').length,ids:[...document.querySelectorAll('[id]')].map(e=>e.id)}));
      assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));assert.deepEqual(layout.broken,[]);assert.equal(layout.h1,1);assert.equal(new Set(layout.ids).size,layout.ids.length);assert.deepEqual(f.errors,[]);assert.equal(f.outbound.length,0);
      if(width<600){const box=await f.page.locator('.mobile-contact a').first().boundingBox();assert.ok(box.height>=44);assert.equal(await f.page.locator('.floating-whatsapp').isVisible(),false);}
    }finally{await f.context.close();}
  }
});
test('mobile navigation works with keyboard and Escape restores focus',async()=>{
  const f=await fixture();try{
    await f.page.keyboard.press('Tab');assert.equal(await f.page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);
    await f.page.locator('#menuToggle').focus();await f.page.keyboard.press('Enter');assert.equal(await f.page.locator('#menuToggle').getAttribute('aria-expanded'),'true');assert.equal(await f.page.locator('#mainNav').isVisible(),true);
    await f.page.keyboard.press('Escape');assert.equal(await f.page.locator('#menuToggle').getAttribute('aria-expanded'),'false');assert.equal(await f.page.locator('#menuToggle').evaluate(e=>e===document.activeElement),true);
    await f.page.locator('#menuToggle').click();await f.page.locator('#mainNav a[href="#services"]').click();assert.equal(await f.page.locator('#menuToggle').getAttribute('aria-expanded'),'false');
  }finally{await f.context.close();}
});
test('category finder searches aliases, resets the full guide and handles no result safely',async()=>{
  const f=await fixture();try{
    await f.page.locator('#productSearch').fill('FrIdGe');assert.equal(await f.page.locator('.product-card:visible').count(),1);assert.equal(await f.page.locator('.product-card:visible h3').textContent(),'Refrigerators');assert.equal(await f.page.locator('#productCount').textContent(),'1 of 6 categories shown');
    await f.page.locator('#clearSearch').click();assert.equal(await f.page.locator('.product-card:visible').count(),6);assert.equal(await f.page.locator('#productSearch').evaluate(e=>e===document.activeElement),true);
    await f.page.locator('#productSearch').fill('washing machine');assert.equal(await f.page.locator('.product-card:visible').count(),1);
    await f.page.locator('#productSearch').fill('<img src=x onerror=alert(1)>');assert.equal(await f.page.locator('.product-card:visible').count(),0);assert.equal(await f.page.locator('#noProducts').isVisible(),true);assert.equal(await f.page.locator('#noProducts img').count(),0);assert.deepEqual(f.errors,[]);
  }finally{await f.context.close();}
});
test('trade-in WhatsApp draft is correctly encoded and is never sent or stored by the website',async()=>{
  const f=await fixture();try{
    await f.page.locator('#enquirySubmit').click();assert.equal(f.outbound.length,0);assert.equal(await f.page.locator('#enquiryReady').isVisible(),false);
    await f.page.locator('[data-enquiry="a possible TV trade-in"]').click();assert.equal(await f.page.locator('#enquiryCategory').inputValue(),'a possible TV trade-in');assert.equal(await f.page.locator('#tradeInFields').isVisible(),true);
    await f.page.locator('#tvModel').fill('Example & Model + 1');await f.page.locator('#tvSize').fill('43 inches');await f.page.locator('#tvCondition').fill('3 years; screen has a line');await f.page.locator('#enquiryMessage').fill('<img src=x> 📺\nCan you advise?');
    const popupPromise=f.page.waitForEvent('popup');await f.page.locator('#enquirySubmit').click();const popup=await popupPromise;await popup.waitForLoadState();
    assert.equal(f.outbound.length,1);assert.equal(f.outbound[0].method,'GET');const url=new URL(f.outbound[0].url);assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/233553486788');const text=url.searchParams.get('text');
    for(const part of ['TV brand/model: Example & Model + 1','Screen size: 43 inches','3 years; screen has a line','<img src=x> 📺\nCan you advise?','acceptance and value are not guaranteed'])assert.ok(text.includes(part),part);
    assert.equal(await f.page.locator('#enquiryDraftLink').getAttribute('href'),url.href);assert.equal(await f.page.locator('#enquiryReady').isVisible(),true);assert.equal(await f.page.locator('#enquiryPreview img').count(),0);
    const storage=await f.page.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),dbs:await indexedDB.databases(),workers:await navigator.serviceWorker.getRegistrations()}));assert.deepEqual(storage,{local:[],session:[],dbs:[],workers:[]});assert.deepEqual(await f.context.cookies(),[]);assert.ok(server.requests.every(r=>r.method==='GET'));assert.deepEqual(f.errors,[]);
    await f.page.locator('#enquiryCategory').selectOption('warranty information');assert.equal(await f.page.locator('#tradeInFields').isVisible(),false);assert.equal(await f.page.locator('#tvModel').isDisabled(),true);
    const second=f.page.waitForEvent('popup');await f.page.locator('#enquirySubmit').click();await(await second).waitForLoadState();const next=new URL(f.outbound.at(-1).url).searchParams.get('text');assert.ok(next.includes('warranty information'));assert.ok(!next.includes('Example & Model + 1'));assert.ok(!next.includes('Screen size:'));
  }finally{await f.context.close();}
});
test('no-JavaScript visitors retain navigation, FAQ and direct contact without submitting enquiry fields',async()=>{
  const f=await fixture({javaScriptEnabled:false});try{
    assert.equal(await f.page.locator('#mainNav').isVisible(),true);assert.equal(await f.page.locator('#menuToggle').isVisible(),false);assert.equal(await f.page.locator('#enquirySubmit').isDisabled(),true);assert.equal(await f.page.locator('#productSearch').isDisabled(),true);assert.equal(await f.page.locator('.product-card:visible').count(),6);assert.equal(await f.page.locator('noscript a[href="https://wa.me/233553486788"]').isVisible(),true);
    await f.page.locator('.faq-items summary').first().click();assert.equal(await f.page.locator('.faq-items details').first().getAttribute('open'),'');assert.equal(f.outbound.length,0);
  }finally{await f.context.close();}
});
test('reduced motion disables smooth scrolling and animation while controls keep focus visibility',async()=>{
  const f=await fixture({reducedMotion:'reduce'});try{
    const styles=await f.page.evaluate(()=>({scroll:getComputedStyle(document.documentElement).scrollBehavior,transition:getComputedStyle(document.querySelector('.button')).transitionDuration}));assert.equal(styles.scroll,'auto');assert.equal(styles.transition,'0s');
    await f.page.locator('#productSearch').focus();const outline=await f.page.locator('#productSearch').evaluate(e=>getComputedStyle(e).outlineStyle);assert.notEqual(outline,'none');
  }finally{await f.context.close();}
});
