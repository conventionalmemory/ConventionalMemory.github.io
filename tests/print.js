// Print check: the spec sheet must include the data tabs, skip the games/ad tabs, and not overflow the page.
const {chromium}=require("playwright");
const base=process.env.BASE||"http://localhost:8123/";
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1000,height:900}});let bad=0;
 const ids=await (async()=>{await p.goto(base);await p.waitForTimeout(400);return p.evaluate(()=>ITEMS.slice(0,3).map(i=>i.id))})();
 await p.emulateMedia({media:"print"});
 for(const id of ids){await p.goto(base+"#/item/"+id);await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const v=e=>e&&e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=="none";const o={};document.querySelectorAll(".pane").forEach(e=>o[e.dataset.pane]=v(e));o.sw=document.documentElement.scrollWidth;o.tabs=v(document.querySelector(".ftabs"));o.title=v(document.querySelector(".ihero h2"));return o});
  const ok=r.about&&r.specs!==false&&!r.era&&!r.ad&&!r.tabs&&r.title&&r.sw<=1000;
  if(!ok){bad++;console.log("FAIL print",id,JSON.stringify(r))}else console.log("ok   print",id)}
 const pdf=await p.pdf({format:"Letter"});if(pdf.length<2000){bad++;console.log("FAIL pdf too small")}
 await b.close();if(bad)process.exit(1)})();
