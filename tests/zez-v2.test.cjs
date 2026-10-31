const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html'),manifest=JSON.parse(read('assets/gallery/manifest.json'));
test('requested contacts, two real photos, and institutional document enquiry are present',()=>{
  for(const marker of ['zolaelectronicszone@gmail.com','+233203514300','+233553486788','id="gallery"','id="institutions"','id="zezProcurementForm"','data-procurement-channel="email"','data-procurement-channel="whatsapp"','Universities','Colleges','Senior High Schools','Metropolitan, Municipal','Hospitals'])assert.ok(html.includes(marker),marker);
  assert.equal((html.match(/class="brand-logo"/g)||[]).length,2);
  assert.ok(html.includes('assets/storefront.webp')&&html.includes('assets/shop-gallery.webp'));
  assert.ok(html.includes('id="enquiryForm"')&&html.includes('id="productGrid"'));
});
test('gallery is local-only, manifest paths cannot reach external domains',()=>{
  assert.equal(manifest.version,1);assert.ok(manifest.items.length>=2);
  for(const item of manifest.items){
    assert.ok(['photo','video'].includes(item.type));
    assert.ok(/^(?:assets\/(?:storefront|shop-gallery)\.webp|assets\/gallery\/[a-zA-Z0-9_-]+\.(?:webp|jpe?g|png|mp4|webm))$/.test(item.src));
    assert.ok(fs.existsSync(path.join(root,item.src)),item.src);
  }
});
test('enquiries draft locally without posting requests or storing personal data',()=>{
  const js=read('assets/zez-procurement.js');
  for(const value of ['mailto:zolaelectronicszone@gmail.com','https://wa.me/233553486788?text=','encodeURIComponent(body)','form.reportValidity()'])assert.ok(js.includes(value));
  for(const blocked of ['localStorage','indexedDB','supabase','sendBeacon','XMLHttpRequest','fetch('])assert.ok(!js.includes(blocked),blocked);
});
test('no public upload endpoint or credentials are introduced',()=>{
  const js=read('assets/gallery/gallery.js');assert.ok(js.includes('assets/gallery/manifest.json'));
  assert.ok(!html.includes('type="file"'));assert.ok(!html.includes('api.github.com'));
  for(const blocked of ['Authorization:','Bearer ','api_key','secret_key'])assert.ok(!js.includes(blocked));
});
