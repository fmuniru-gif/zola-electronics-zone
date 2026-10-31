const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),js=read('assets/zez-procurement.js');
test('email chooser contains distinct Gmail, email app, and copy controls',()=>{
  for(const id of ['zezEmailOptions','zezGmailLink','zezEmailAppLink','zezCopyDraft','zezCopyStatus','zezProcurementPrompt'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(js.includes('https://mail.google.com/mail/?view=cm&fs=1&to='));
  assert.ok(js.includes('mailto:'));assert.ok(js.includes('navigator.clipboard.writeText'));
  assert.ok(js.includes('fallback.hidden = true'));
});
test('website privacy, gallery and contact preservation',()=>{
  for(const keep of ['id="gallery"','id="zezGalleryGrid"','id="zezProcurementForm"','id="enquiryForm"','id="productGrid"','assets/storefront.webp','assets/shop-gallery.webp','055 348 6788','020 351 4300'])assert.ok(html.includes(keep),keep);
  for(const forbidden of ['localStorage','sessionStorage','indexedDB','supabase','fetch(','XMLHttpRequest','sendBeacon('])assert.ok(!js.includes(forbidden),forbidden);
  assert.ok(!html.includes('type="file"'));assert.ok(read('Manage-Zola-Gallery.ps1').includes('tools/add_gallery.py'));
});
