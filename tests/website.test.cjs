const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {buildEnquiryText,enquiryURL,matchesCategory}=require('../script.js');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8'),html=read('index.html');

test('WhatsApp draft preserves punctuation, Unicode, line breaks and literal markup safely',()=>{
  const input={category:'warranty information',message:'TV & fridge + size?\n<Model> “Akwaaba” 📺 #care / 100%'};
  const url=new URL(enquiryURL(input));assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/233553486788');
  assert.equal(url.searchParams.get('text'),buildEnquiryText(input));assert.ok(url.searchParams.get('text').endsWith(input.message));
  assert.equal([...url.searchParams.keys()].join(','),'text');
});
test('trade-in enquiry includes optional context without promising acceptance or value',()=>{
  const text=buildEnquiryText({category:'a possible TV trade-in',model:'Example model',size:'43 inches',condition:'Works; small screen fault',message:'Can you advise?'});
  for(const part of ['TV brand/model: Example model','Screen size: 43 inches','Age and condition: Works; small screen fault','acceptance and value are not guaranteed','Can you advise?'])assert.ok(text.includes(part));
});
test('switching to customer care cannot leak prior trade-in fields',()=>{
  const text=buildEnquiryText({category:'after-sales help',model:'OLD TV DETAILS',size:'43',condition:'Old condition'});
  assert.ok(text.includes('after-sales help'));assert.ok(!text.includes('OLD TV DETAILS'));assert.ok(!text.includes('Screen size:'));
  assert.ok(buildEnquiryText({category:'https://unexpected.invalid'}).includes('an electronic product'));
});
test('category finder handles case, multiple words, partial terms and empty search',()=>{
  const terms='televisions smart tv entertainment';
  assert.equal(matchesCategory(terms,' SMART   TV '),true);assert.equal(matchesCategory(terms,'televis'),true);assert.equal(matchesCategory(terms,''),true);assert.equal(matchesCategory(terms,'fridge'),false);
});
test('public metadata describes one factual local business without offer or stock claims',()=>{
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1]);
  assert.equal(schema['@type'],'ElectronicsStore');assert.equal(schema.name,'Zola Electronics Zone');assert.equal(schema.telephone,'+233553486788');assert.equal(schema.slogan,'Buy the right one.');
  assert.equal(schema.address.streetAddress,'Aliu Mahama Road, near Maccasio Fun Base');assert.equal(schema.address.addressLocality,'Tamale');
  assert.ok(!schema.offers&&!schema.openingHours&&!schema.aggregateRating&&!schema.priceRange);
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];assert.equal(canonical,'https://fmuniru-gif.github.io/zola-electronics-zone/');assert.ok(read('sitemap.xml').includes(canonical));assert.ok(read('robots.txt').includes(canonical+'sitemap.xml'));
  assert.ok(html.includes('not a live stock or price list'));assert.ok(html.includes('no trade-in is guaranteed'));assert.ok(html.includes('Warranty coverage and terms vary'));
});
test('all static links and images remain local or explicit public contact destinations',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const [,href] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    if(href.startsWith('#'))assert.ok(ids.includes(href.slice(1)),href);
    else if(/^(?:https?:|tel:)/.test(href)){
      const url=new URL(href.replace(/&amp;/g,'&'));assert.ok(['https://wa.me','https://www.google.com','https://fmuniru-gif.github.io','null'].includes(url.origin),href);
      if(url.origin==='https://wa.me')assert.equal(url.pathname,'/233553486788');
      if(url.protocol==='tel:')assert.equal(url.pathname,'+233553486788');
    }else assert.ok(fs.existsSync(path.join(root,href)),href);
  }
});
test('public code has no operational data, storage, analytics, checkout or server submission path',()=>{
  const script=read('script.js');for(const forbidden of ['supabase','tradeflow_v321','localStorage','indexedDB','fetch(','XMLHttpRequest','sendBeacon(','document.cookie','serviceWorker'])assert.ok(!script.includes(forbidden),forbidden);
  assert.ok(!html.toLowerCase().includes('tradeflow'));assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('<input type="file"'));
  assert.ok(html.includes('id="enquiryFields" disabled'));assert.ok(html.includes('<noscript>'));assert.ok(script.includes('event.preventDefault()'));assert.ok(script.includes('.textContent = buildEnquiryText'));
});
