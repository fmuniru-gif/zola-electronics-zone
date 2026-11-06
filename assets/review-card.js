'use strict';
const printButton=document.getElementById('print-card');
if(printButton){printButton.hidden=false;printButton.addEventListener('click',()=>window.print());}
