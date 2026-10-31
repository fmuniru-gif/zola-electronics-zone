/* ZEZ accessible gallery viewer; no network calls, data storage or image modification. */
(() => {
  'use strict';
  const grid = document.getElementById('zezGalleryGrid');
  if (!grid) return;

  const overlay = document.createElement('div');
  overlay.className = 'zez-lightbox';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="zez-lightbox-backdrop" data-zez-lightbox-close></div>
    <section class="zez-lightbox-panel" role="dialog" aria-modal="true" aria-label="Full-size gallery photograph">
      <div class="zez-lightbox-toolbar">
        <span class="zez-lightbox-counter" aria-live="polite"></span>
        <button class="zez-lightbox-close" type="button" aria-label="Close full-size photograph" data-zez-lightbox-close>Close ×</button>
      </div>
      <div class="zez-lightbox-stage">
        <button class="zez-lightbox-prev" type="button" aria-label="Previous photograph">‹</button>
        <!-- Full-size image is created only when a visitor opens a photograph. -->
        <button class="zez-lightbox-next" type="button" aria-label="Next photograph">›</button>
      </div>
      <div class="zez-lightbox-footer">
        <p class="zez-lightbox-caption"></p>
        <a class="zez-lightbox-original" target="_blank" rel="noopener noreferrer">Open original image ↗</a>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const picture = document.createElement('img');
  picture.className = 'zez-lightbox-image';
  picture.alt = '';
  const caption = overlay.querySelector('.zez-lightbox-caption');
  const counter = overlay.querySelector('.zez-lightbox-counter');
  const link = overlay.querySelector('.zez-lightbox-original');
  const close = overlay.querySelector('.zez-lightbox-close');
  const previous = overlay.querySelector('.zez-lightbox-prev');
  const next = overlay.querySelector('.zez-lightbox-next');
  let at = -1;
  let returnFocus = null;
  let previousOverflow = '';
  const buttons = () => [...grid.querySelectorAll('button.zez-gallery-open')];
  const safeLocalImage = src => typeof src === 'string' && /^(?:assets\/(?:storefront|shop-gallery)\.webp|assets\/gallery\/[A-Za-z0-9_-]+\.(?:webp|jpe?g|png))$/.test(src);

  function show(index) {
    const items = buttons();
    if (!items.length) { dismiss(); return; }
    at = (index + items.length) % items.length;
    const trigger = items[at];
    const source = trigger.querySelector('img');
    const path = source?.getAttribute('src');
    if (!safeLocalImage(path)) { dismiss(); return; }
    const description = trigger.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || 'Zola Electronics Zone photograph';
    picture.src = path;
    picture.alt = source.alt || description;
    if (!picture.isConnected) next.before(picture);
    caption.textContent = description;
    link.href = path;
    counter.textContent = `${at + 1} of ${items.length}`;
    previous.hidden = next.hidden = items.length < 2;
  }

  function present(trigger) {
    const index = buttons().indexOf(trigger);
    if (index < 0) return;
    returnFocus = trigger;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.hidden = false;
    show(index);
    close.focus();
  }

  function dismiss() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    picture.remove();
    picture.removeAttribute('src');
    document.body.style.overflow = previousOverflow;
    const focus = returnFocus;
    returnFocus = null;
    at = -1;
    if (focus?.isConnected) focus.focus();
  }

  grid.addEventListener('click', event => {
    const trigger = event.target instanceof Element ? event.target.closest('button.zez-gallery-open') : null;
    if (trigger && grid.contains(trigger)) present(trigger);
  });
  overlay.querySelectorAll('[data-zez-lightbox-close]').forEach(button => button.addEventListener('click', dismiss));
  previous.addEventListener('click', () => show(at - 1));
  next.addEventListener('click', () => show(at + 1));
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); show(at - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); show(at + 1); }
    else if (event.key === 'Tab') {
      const focusables = [close, ...(!previous.hidden ? [previous, next] : []), link];
      const active = focusables.indexOf(document.activeElement);
      if (event.shiftKey && active <= 0) { event.preventDefault(); focusables[focusables.length - 1].focus(); }
      else if (!event.shiftKey && (active < 0 || active === focusables.length - 1)) { event.preventDefault(); focusables[0].focus(); }
    }
  });
})();
