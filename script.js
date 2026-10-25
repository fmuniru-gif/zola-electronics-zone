(function () {
  'use strict';
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    const closeNav = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation menu'); nav.classList.remove('is-open'); };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNav(); });
    document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNav(); });
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const form = document.getElementById('enquiryForm');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const category = document.getElementById('enquiryCategory').value;
    const message = document.getElementById('enquiryMessage').value.trim();
    const text = `Hello Zola Electronics Zone. I would like to enquire about ${category}.` + (message ? `\n\n${message}` : '');
    const href = 'https://wa.me/233553486788?text=' + encodeURIComponent(text);
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})();
