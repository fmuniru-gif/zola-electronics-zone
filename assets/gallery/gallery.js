/* Zola public gallery: read-only manifest; no public upload endpoint or tracking. */
(() => {
  'use strict';
  const grid=document.getElementById('zezGalleryGrid');
  if(!grid)return;
  const status=document.getElementById('zezGalleryStatus');
  const filters=[...document.querySelectorAll('[data-gallery-filter]')];
  let items=[],selection='all';
  const safePath=path=>typeof path==='string'&&/^(?:assets\/storefront\.webp|assets\/shop-gallery\.webp|assets\/gallery\/[a-zA-Z0-9_-]+\.(?:webp|jpe?g|png|mp4|webm))$/.test(path)&&!path.includes('..');
  function draw(){
    grid.replaceChildren();
    const chosen=items.filter(item=>selection==='all'||item.type===selection);
    for(const item of chosen){
      const figure=document.createElement('figure');figure.className='zez-gallery-card';
      let media;
      if(item.type==='video'){
        media=document.createElement('video');media.controls=true;media.preload='metadata';media.playsInline=true;
        media.setAttribute('aria-label',item.caption||'Zola Electronics Zone video');
        if(safePath(item.poster))media.poster=item.poster;
      } else {
        media=document.createElement('img');media.loading='lazy';media.alt=item.alt||item.caption||'Shop photo';
      }
      media.src=item.src;
      figure.appendChild(media);
      const caption=document.createElement('figcaption');caption.textContent=item.caption||'Zola Electronics Zone';
      figure.appendChild(caption);grid.appendChild(figure);
    }
    status.textContent=chosen.length?`${chosen.length} ${selection==='video'?'video':selection==='photo'?'photo':'gallery'} item${chosen.length!==1?'s':''} shown.`:'No media in this category yet. Please check back.';
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryFilter===selection)));
  }
  filters.forEach(button=>button.addEventListener('click',()=>{selection=button.dataset.galleryFilter;draw();}));
  fetch('assets/gallery/manifest.json',{cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Gallery manifest unavailable');return response.json();})
    .then(data=>{
      items=(Array.isArray(data.items)?data.items:[]).filter(item=>
        item&&['photo','video'].includes(item.type)&&safePath(item.src)&&
        (item.type!=='video'||/\.(mp4|webm)$/i.test(item.src)));
      draw();
    })
    .catch(()=>{status.textContent='The gallery is temporarily unavailable. Contact the shop for current photos or videos.';});
})();
