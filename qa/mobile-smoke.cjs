/* Automated browser smoke test for the 24/38 GitHub Pages source.
   Uses Chromium with touch and iPhone-like viewports. No production mutations. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const pages=['index.html','services.html','shop.html','projects.html','video.html','contacts.html','privacy.html'];
const viewports=[320,375,390,430,768,1024,1440];
const base='http://127.0.0.1:8765/';
const errors=[];
const ok=[];
function assert(condition,label){if(!condition){errors.push(label);console.log('FAIL',label)}else{ok.push(label);console.log('PASS',label)}}
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
fs.mkdirSync('qa-results',{recursive:true});
for(const width of viewports){
  const height=width<=430?844:(width<=768?1024:900);
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:width<=430?2:1,isMobile:width<=430,hasTouch:width<=430,ignoreHTTPSErrors:true});
  const p=await context.newPage();
  const jsErrors=[];
  p.on('pageerror',e=>jsErrors.push(e.message));
  for(const path of pages){
    let response;
    try {response=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:20000})}
    catch(e){errors.push(width+' '+path+' navigation '+e.message);continue}
    assert(response?.status()===200,width+' '+path+' HTTP 200');
    const metrics=await p.evaluate(()=>{
      const d=document.documentElement;
      const seen=document.querySelector('main')?.getBoundingClientRect();
      return {viewport:innerWidth,scroll:d.scrollWidth,mainVisible:!!seen&&seen.width>0,
       btns:[...document.querySelectorAll('main .btn')].filter(x=>x.getBoundingClientRect().width>0).length}
    });
    assert(metrics.scroll<=width+2,width+' '+path+' no horizontal overflow '+metrics.scroll+'/'+width);
    assert(metrics.mainVisible,width+' '+path+' main visible');
    if(path==='index.html'){
      const v=await p.evaluate(()=>{
       const hero=document.querySelector('.hero'),vid=document.querySelector('#hero-background-video'),frame=vid?.getBoundingClientRect(),container=hero?.getBoundingClientRect();
       return {fit:getComputedStyle(vid).objectFit,videoWidth:Math.round(frame?.width||0),heroWidth:Math.round(container?.width||0),muted:vid?.muted,loop:vid?.loop,autoplay:vid?.autoplay,playsInline:vid?.playsInline};
      });
      assert(v.fit==='cover',width+' hero video full bleed CSS '+v.fit);
      assert(Math.abs(v.videoWidth-v.heroWidth)<=2,width+' hero video spans whole frame '+v.videoWidth+'/'+v.heroWidth);
      assert(v.muted&&v.loop&&v.autoplay&&v.playsInline,width+' hero autoplay attrs');
      if(width===390||width===1440)await p.screenshot({path:'qa-results/home-'+width+'.png',fullPage:false});
      if(width<=430){
       await p.locator('.menu-toggle').click();
       assert(await p.locator('#primary-nav').evaluate(n=>getComputedStyle(n).display!=='none'),width+' mobile menu opens');
       await p.locator('.menu-toggle').click();
      }
    }
    if(path==='services.html')assert(await p.locator('.service-item').count()===14,width+' services 14 items');
    if(path==='projects.html'){
      assert(await p.locator('.works-card').count()===9,width+' portfolio 9 items');
      await p.evaluate(()=>document.querySelectorAll('.works-card img').forEach(i=>i.loading='eager'));
      await p.waitForTimeout(400);
      const images=await p.locator('.works-card img').evaluateAll(async a=>{
       await Promise.all(a.map(i=>i.decode().catch(()=>{})));
       return a.map(i=>({ok:i.naturalWidth>0,url:i.currentSrc}))
      });
      assert(images.every(i=>i.ok),width+' portfolio images load '+images.filter(i=>!i.ok).length+' missing');
      await p.locator('[data-work-filter="styling"]').click();
      const visible=await p.locator('.works-card:visible').count();
      assert(visible===2,width+' styling filter shows 2');
      await p.locator('[data-work-filter="all"]').click();
      await p.locator('[data-work-open]').first().click();
      assert(await p.locator('.works-lightbox').isVisible(),width+' lightbox opens');
      await p.keyboard.press('Escape');
      assert(await p.locator('.works-lightbox').isHidden(),width+' lightbox closes via Escape');
      if(width===390||width===1440)await p.screenshot({path:'qa-results/portfolio-'+width+'.png',fullPage:false});
    }
    if(path==='shop.html'){
      assert(await p.locator('#shop-grid .film').count()===12,width+' shop 12 cards');
      const search=p.locator('#shop-search');
      await search.fill('НЕСУЩЕСТВУЮЩИЙ');
      assert(await p.locator('#shop-grid .film:visible').count()===0,width+' search empty state');
      await search.fill('');
      assert(await p.locator('#shop-grid .film:visible').count()===12,width+' search restore 12');
    }
    if(path==='contacts.html'){
      const tabs=p.locator('[data-map-location]');
      assert(await tabs.count()===2,width+' map 2 branches');
      await tabs.nth(1).click();
      const phone=await p.locator('[data-map-phone]').getAttribute('href');
      assert(phone==='tel:+79130302224',width+' map switches phone to branch 2');
    }
    assert(jsErrors.length===0,width+' '+path+' no JS errors '+jsErrors.join(' | '));
    jsErrors.length=0;
  }
  await context.close();
}
await browser.close();
const report={ok:ok.length,failed:errors.length,errors,generatedAt:new Date().toISOString()};
fs.writeFileSync('qa-results/report.json',JSON.stringify(report,null,2));
console.log('QA_SUMMARY '+JSON.stringify(report));
if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
