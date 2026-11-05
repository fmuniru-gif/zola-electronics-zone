const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const home=read('index.html'),sitemap=read('sitemap.xml');
const names=['televisions-tamale','refrigerators-freezers-tamale','washing-machines-tamale','air-conditioners-tamale'];
test('each local guide has an indexable distinct canonical, intent title and helpful content',()=>{
  assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'XML declaration must start at the first byte so search engines can parse the sitemap');
  const titles=new Set();
  for(const slug of names){
    const filename='guides/'+slug+'.html',page=read(filename),url='https://zolaelectronicszone.com/'+filename;
    const title=page.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title && title.includes('Tamale'),filename);
    assert.ok(!titles.has(title));titles.add(title);
    assert.ok(page.includes('<link rel="canonical" href="'+url+'"'),filename);
    assert.ok(page.includes('Aliu Mahama Road') && page.includes('055 348 6788'),filename);
    assert.ok(page.includes('stock availability, price and warranty terms are confirmed'),filename);
    assert.ok(page.includes('mailto:')===false,'guide has no contact form or external submission');
    assert.ok(page.match(/<h2>/g)?.length>=6,'guide contains practical sections');
    assert.ok(home.includes('href="'+filename+'"'),'guide linked from homepage');
    assert.ok(sitemap.includes('<loc>'+url+'</loc>'),'guide listed in sitemap');
    for(const m of page.matchAll(/<a\s[^>]*href="([^"]+)"/g)){
      const href=m[1];
      if(href.startsWith('http')||href.startsWith('tel:')||href.startsWith('#'))continue;
      const target=path.resolve(root,path.dirname(filename),href.split('#')[0]||'.');
      assert.ok(fs.existsSync(target),href);
    }
    const raw=page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    assert.ok(raw,filename);assert.equal(JSON.parse(raw)['@type'],'WebPage');
  }
  assert.equal((home.match(/class="local-guide-card"/g)||[]).length,4);
  assert.equal((sitemap.match(/<url>/g)||[]).length,5);
});
test('guide internal fragments, canonical graph, contact destinations and metadata are consistent',()=>{
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(new Set(urls).size,5);assert.ok(urls.every(url=>url.startsWith('https://zolaelectronicszone.com/')));
 for(const slug of names){
  const filename='guides/'+slug+'.html',page=read(filename),canonical='https://zolaelectronicszone.com/'+filename;assert.equal((page.match(/<h1>/g)||[]).length,1);assert.ok(page.includes('content="'+canonical+'"'));assert.ok(page.includes('content="index,follow"'));assert.ok(page.includes('zez-logo-192.webp'));assert.ok(page.includes('Buy the right one.'));
  const schema=JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(schema.url,canonical);assert.equal(schema.about['@id'],'https://zolaelectronicszone.com/#store');assert.ok(!schema.offers&&!schema.aggregateRating);assert.equal((page.match(/<script\b/g)||[]).length,1);assert.ok(!/<form\b|<iframe\b/.test(page));
  for(const [,raw]of page.matchAll(/<a\s[^>]*href="([^"]+)"/g)){
   const href=raw.replace(/&amp;/g,'&');if(/^(?:https?:|tel:)/.test(href)){const url=new URL(href);if(url.protocol==='https:'){assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/233553486788');assert.ok(url.searchParams.get('text'));}else assert.equal(href,'tel:+233553486788');continue;}
   const [file,hash]=href.split('#');let target=path.resolve(root,'guides',file||path.basename(filename));if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');assert.ok(target.startsWith(root+path.sep));if(hash)assert.ok(read(path.relative(root,target)).includes('id="'+hash+'"'),filename+' '+href);
  }
 }
});
