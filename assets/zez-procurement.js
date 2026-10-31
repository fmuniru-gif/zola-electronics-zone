/* Browser-only quotation/invoice enquiry; no website-side storage or transmission. */
(() => {
  'use strict';
  const form = document.getElementById('zezProcurementForm');
  if (!form) return;
  const status = document.getElementById('zezProcurementStatus');
  const fallback = document.getElementById('zezProcurementFallback');
  const preview = document.getElementById('zezProcurementPreview');
  const emailOptions = document.getElementById('zezEmailOptions');
  const gmailLink = document.getElementById('zezGmailLink');
  const emailAppLink = document.getElementById('zezEmailAppLink');
  const copyButton = document.getElementById('zezCopyDraft');
  const copyStatus = document.getElementById('zezCopyStatus');
  const prompt = document.getElementById('zezProcurementPrompt');
  const address = 'zolaelectronicszone@gmail.com';
  const value = id => String(document.getElementById(id)?.value || '').trim();
  const makeText = () => [
    'Hello Zola Electronics Zone,', '',
    'Document enquiry: ' + value('zezRequestType'),
    'Organisation type: ' + value('zezOrgType'),
    'Organisation/department: ' + value('zezOrgName'),
    'Contact person: ' + value('zezRequester'),
    'Reply contact: ' + value('zezContact'),
    'Items, quantities and specifications:', value('zezRequestDetails'),
    'Required date or reference: ' + (value('zezTiming') || 'Not specified'), '',
    'Please confirm availability, prices, applicable documentation and next steps. A formal invoice should only be issued after order details are confirmed.'
  ].join('\n');
  let prepared = null;
  document.querySelectorAll('[data-procurement-channel]').forEach(button => button.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const body = makeText();
    const subject = 'Zola ' + value('zezRequestType') + ' request';
    const isEmail = button.dataset.procurementChannel === 'email';
    prepared = {subject, body};
    preview.textContent = body;
    status.hidden = false;
    emailOptions.hidden = !isEmail;
    copyStatus.textContent = '';
    if (isEmail) {
      // Do not open mailto: automatically: Chrome may display a blank page without a configured mail handler.
      const mailto = 'mailto:zolaelectronicszone@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      const gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(address) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      gmailLink.href = gmail;
      emailAppLink.href = mailto;
      fallback.hidden = true;
      prompt.textContent = 'Your email draft is ready. Choose how to open it, or copy the details into any email service. Nothing has been sent.';
    } else {
      const whatsapp = 'https://wa.me/233553486788?text=' + encodeURIComponent(body);
      fallback.href = whatsapp;
      fallback.textContent = 'Open your WhatsApp draft';
      fallback.hidden = false;
      prompt.textContent = 'Your WhatsApp draft is ready. If it did not open, use the link below.';
      fallback.click();
    }
    status.scrollIntoView({block:'nearest',behavior:'auto'});
  }));
  copyButton?.addEventListener('click', async () => {
    if (!prepared) return;
    const content = 'To: ' + address + '\nSubject: ' + prepared.subject + '\n\n' + prepared.body;
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(content);
      copyStatus.textContent = 'Copied. Paste into your preferred email service and send when ready.';
    } catch (_) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(preview);
      selection?.addRange(range);
      copyStatus.textContent = 'Copy was blocked by the browser. The message is selected; press Ctrl+C to copy it. Send to ' + address + '.';
    }
  });
})();
