const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const playwright=require(process.env.PLAYWRIGHT_CORE_PATH||'playwright-core');
const {startServer,chromeOptions,isolate,root}=require('../tests/support.cjs');
const baseline='812a139808b85f0fad650208d18b5883bbfe7300';
const output=process.env.WEBSITE_EVIDENCE_DIR||path.resolve(root,'test-results/website-review');
const sectionStyle='.mobile-contact,.floating-whatsapp{visibility:hidden!important}';
(async()=>{
  fs.mkdirSync(output,{recursive:true});const browser=await playwright.chromium.launch(chromeOptions()),records=[];
  try{for(const [version,ref] of [['before',baseline],['after',null]]){
    const server=await startServer(ref);
    try{for(const [profile,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
      const context=await browser.newContext({viewport,reducedMotion:'reduce'});await isolate(context,server.origin);const page=await context.newPage();
      try{
        await page.goto(server.origin,{waitUntil:'networkidle'});await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));});
        for(const [name,selector] of [['overview',null],['products','#products'],['customer-care','#services'],['enquiry','.enquiry-panel']]){
          const file=version+'-'+profile+'-'+name+'.png';
          if(selector)await page.locator(selector).screenshot({path:path.join(output,file),animations:'disabled',style:sectionStyle});
          else{await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,file),animations:'disabled'});}
          records.push({version,profile,viewport,view:name,file,fixedContactControlsHidden:!!selector});
        }
        if(version==='after'){
          await page.locator('[data-enquiry="a possible TV trade-in"]').click();
          const file='after-'+profile+'-trade-in-enquiry.png';await page.locator('.enquiry-panel').screenshot({path:path.join(output,file),animations:'disabled',style:sectionStyle});records.push({version,profile,viewport,view:'trade-in enquiry',file,fixedContactControlsHidden:true});
          const offer='after-'+profile+'-offers.png';await page.locator('#offers').screenshot({path:path.join(output,offer),animations:'disabled',style:sectionStyle});records.push({version,profile,viewport,view:'offers',file:offer,fixedContactControlsHidden:true});
        }
      }finally{await context.close();}
    }}finally{await server.close();}
  }}finally{await browser.close();}
  const evidence={baseline,candidate:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),workingTreeDirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),browser:browser.version(),records};
  fs.writeFileSync(path.join(output,'visual-evidence.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify({baseline:evidence.baseline,candidate:evidence.candidate,screenshots:records.length,output}));
})().catch(error=>{console.error(error);process.exitCode=1;});
