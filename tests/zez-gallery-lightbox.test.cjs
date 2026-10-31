const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),gallery=read('assets/gallery/gallery.js'),viewer=read('assets/gallery/lightbox.js');
test('existing gallery and captions remain, full-view viewer is installed separately',()=>{
 assert.ok(html.includes('id="zezGalleryGrid"'));
 assert.ok(html.includes('assets/gallery/gallery.js'));
 assert.ok(html.includes('assets/gallery/lightbox.js'));
 assert.ok(html.includes('assets/gallery/lightbox.css'));
 assert.ok(gallery.includes('trigger.className=\'zez-gallery-open\''));
 assert.ok(viewer.includes("const picture = document.createElement('img');"));
 assert.ok(viewer.includes('picture.remove();')) ;
 assert.ok(!viewer.includes('<img class="zez-lightbox-image" alt="" />'));
 for(const s of ['aria-modal','aria-label="Close full-size photograph"','ArrowLeft','ArrowRight','Escape','safeLocalImage']) assert.ok(viewer.includes(s),s);
});
test('viewer only opens local photo paths; captions inserted as text, not HTML',()=>{
 assert.ok(viewer.includes('safeLocalImage'));
 assert.ok(viewer.includes('caption.textContent = description'));
 assert.ok(viewer.includes('source?.getAttribute(\'src\')'));
 for(const s of ['fetch(','localStorage','indexedDB','supabase','XMLHttpRequest','sendBeacon','https://'])assert.ok(!viewer.includes(s),s);
});
