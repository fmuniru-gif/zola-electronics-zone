const {test}=require('node:test'),assert=require('node:assert/strict');
const {startServer}=require('./support.cjs');
test('local browser-test server delivers nested gallery assets without external requests',async()=>{
  const server=await startServer();
  try {
    for(const path of [
      'assets/gallery/manifest.json',
      'assets/gallery/gallery.js',
      'assets/gallery/lightbox.js',
      'assets/gallery/lightbox.css',
      'assets/gallery/c23a80c91db601.webp'
    ]) {
      const response=await fetch(server.origin+'/'+path);
      assert.equal(response.status,200,path+' must be served');
      assert.ok((await response.arrayBuffer()).byteLength>0,path+' must not be empty');
    }
    const denied=await fetch(server.origin+'/assets/gallery/nonexistent.js');
    assert.equal(denied.status,404,'Unknown local paths remain blocked');
  }finally{await server.close();}
});