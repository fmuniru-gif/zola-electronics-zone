(function () {
  'use strict';
  const categories = new Set(['a television or smart TV', 'a refrigerator', 'a freezer', 'a washing machine', 'an air conditioner', 'another home appliance', 'warranty information', 'after-sales help', 'a possible TV trade-in']);
  function buildEnquiryText(values) {
    const category = categories.has(values.category) ? values.category : 'an electronic product';
    const lines = [`Hello Zola Electronics Zone. I would like to enquire about ${category}.`];
    if (category === 'a possible TV trade-in') {
      for (const [key, label] of [['model', 'TV brand/model'], ['size', 'Screen size'], ['condition', 'Age and condition']]) {
        const value = String(values[key] || '').trim();
        if (value) lines.push(`${label}: ${value}`);
      }
      lines.push('Please advise whether an assessment is available and explain any terms. I understand acceptance and value are not guaranteed.');
    }
    const message = String(values.message || '').trim();
    if (message) lines.push('', message);
    return lines.join('\n');
  }
  function enquiryURL(values) {
    const url = new URL('https://wa.me/233553486788');
    url.searchParams.set('text', buildEnquiryText(values));
    return url.href;
  }
  function matchesCategory(terms, query) {
    const words = query.toLocaleLowerCase('en').trim().split(/\s+/).filter(Boolean);
    return words.every(word => terms.toLocaleLowerCase('en').includes(word));
  }
  if (typeof document === 'undefined') {
    module.exports = {buildEnquiryText, enquiryURL, matchesCategory};
    return;
  }
  document.documentElement.classList.add('js');
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
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeNav(); toggle.focus(); } });
    document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNav(); });
    window.matchMedia('(min-width:821px)').addEventListener('change', closeNav);
  }
  const search = document.getElementById('productSearch');
  const clear = document.getElementById('clearSearch');
  if (search && clear) {
    const cards = [...document.querySelectorAll('.product-card')];
    function filterProducts() {
      let count = 0;
      for (const card of cards) { card.hidden = !matchesCategory(card.dataset.search, search.value); if (!card.hidden) count++; }
      const status = document.getElementById('productCount');
      status.hidden = false;
      status.textContent = `${count} of ${cards.length} categories shown`;
      document.getElementById('noProducts').hidden = count !== 0;
      clear.hidden = !search.value;
    }
    search.disabled = false;
    search.addEventListener('input', filterProducts);
    clear.addEventListener('click', () => { search.value = ''; filterProducts(); search.focus(); });
    filterProducts();
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const form = document.getElementById('enquiryForm');
  if (form) {
    const category = document.getElementById('enquiryCategory');
    const tradeIn = document.getElementById('tradeInFields');
    const help = document.getElementById('categoryHelp');
    function updateCategory() {
      const isTradeIn = category.value === 'a possible TV trade-in';
      tradeIn.hidden = !isTradeIn;
      tradeIn.disabled = !isTradeIn;
      help.textContent = isTradeIn ? 'Add any TV details below. The shop will confirm whether an assessment is possible.' : category.value === 'warranty information' ? 'Include the product model and ask for its specific coverage, exclusions and support process.' : category.value === 'after-sales help' ? 'Include the product model and issue. Have purchase details available if you can.' : 'Tell us your needs, preferred model or budget. Availability and prices are confirmed by the shop.';
      document.getElementById('enquiryReady').hidden = true;
    }
    category.addEventListener('change', updateCategory);
    document.querySelectorAll('[data-enquiry]').forEach(link => link.addEventListener('click', () => { category.value = link.dataset.enquiry; updateCategory(); }));
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = {category:category.value, message:document.getElementById('enquiryMessage').value, model:document.getElementById('tvModel').value, size:document.getElementById('tvSize').value, condition:document.getElementById('tvCondition').value};
      const href = enquiryURL(values);
      const link = document.getElementById('enquiryDraftLink');
      link.href = href;
      document.getElementById('enquiryPreview').textContent = buildEnquiryText(values);
      document.getElementById('enquiryReady').hidden = false;
      link.click();
    });
    document.getElementById('enquiryFields').disabled = false;
    updateCategory();
  }
})();
