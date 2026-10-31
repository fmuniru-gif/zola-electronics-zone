/* Browser-only quotation/invoice enquiry handoff; data never submitted to this website. */
(() => {
  'use strict';
  const form=document.getElementById('zezProcurementForm');
  if(!form)return;
  const status=document.getElementById('zezProcurementStatus');
  const fallback=document.getElementById('zezProcurementFallback');
  const preview=document.getElementById('zezProcurementPreview');
  const fields=['zezRequestType','zezOrgType','zezOrgName','zezRequester','zezContact','zezRequestDetails','zezTiming'];
  const value=id=>String(document.getElementById(id)?.value||'').trim();
  const text=()=>[
    'Hello Zola Electronics Zone,',
    '',
    'Document enquiry: '+value('zezRequestType'),
    'Organisation type: '+value('zezOrgType'),
    'Organisation/department: '+value('zezOrgName'),
    'Contact person: '+value('zezRequester'),
    'Reply contact: '+value('zezContact'),
    'Items, quantities and specifications:',value('zezRequestDetails'),
    'Required date or reference: '+(value('zezTiming')||'Not specified'),
    '',
    'Please confirm availability, prices, applicable documentation and next steps. A formal invoice should only be issued after order details are confirmed.'
  ].join('\n');
  document.querySelectorAll('[data-procurement-channel]').forEach(button=>button.addEventListener('click',()=>{
    if(!form.reportValidity())return;
    const body=text(),isEmail=button.dataset.procurementChannel==='email';
    const url=isEmail
      ?'mailto:zolaelectronicszone@gmail.com?subject='+encodeURIComponent('Zola '+value('zezRequestType')+' request')+'&body='+encodeURIComponent(body)
      :'https://wa.me/233553486788?text='+encodeURIComponent(body);
    fallback.href=url;
    fallback.textContent=isEmail?'Open your email draft':'Open your WhatsApp draft';
    preview.textContent=body;
    status.hidden=false;
    status.scrollIntoView({block:'nearest',behavior:'auto'});
    // Anchor click is synchronous to the real button event. Fallback remains visible if external apps do not launch.
    fallback.click();
  }));
})();
