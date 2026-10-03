/* Every catalog item and every timeline entry must offer both an Amazon and an eBay link (searches, never single listings).
   Run: node tests/affiliate.js */
const fs=require("fs"),path=require("path"),vm=require("vm");const root=path.join(__dirname,"..");
const ctx={window:{},document:{addEventListener(){},readyState:"complete",getElementById(){return null}},esc:s=>String(s),console};vm.createContext(ctx);
["timeline-data.js","timeline-extra.js","items.js","affiliate.js","gear.js"].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f}));
const get=n=>vm.runInContext(n,ctx);const ITEMS=get("ITEMS"),TL=get("TL"),TLX=get("typeof TLX!=='undefined'?TLX:{}");
const shelf=vm.runInContext("affShelf",ctx);let bad=[],n=0;
function chk(label,h){n++;if(!/ebay\.com\/sch\/i\.html\?_nkw=[^"]+campid=5339217307/.test(h)||!/amazon\.com\/s\?k=[^"]+tag=conventionalm-20/.test(h)||/undefined|NaN|_nkw=&|k=&/.test(h))bad.push(label)}
ITEMS.forEach(it=>chk("item "+it.id,shelf(it.name,it.maker,it.id)));
TL.forEach(r=>chk("timeline "+r[0]+" "+r[1]+" "+r[2],shelf(r[2],(TLX[r[2]]||{}).maker,r[2])));
if(bad.length){console.error("FAIL: "+bad.length+" of "+n+" without both links or with a bad query, e.g. "+bad.slice(0,8).join(" | "));process.exit(1)}
// search words must read like what a person would type
{const gf=get("gearFinds"),gc=get("gearCtx"),aq=get("affQ");let odd=[];
 const find=(nm,k)=>gf(gc(nm,(TLX[nm]||{}).maker,nm),nm,(TLX[nm]||{}).maker);
 TL.forEach(r=>{const mk=(TLX[r[1]]||{}).maker||(TLX[r[2]]||{}).maker,f=gf(gc(r[2],mk,r[2]),r[2],mk);
  f.forEach(x=>{const q=String(x[1]).replace(/^\u00a7b\u00a7/,"");
   if(/\s{2}|^\s|\s$/.test(q))odd.push("spacing: "+q);
   if(r[1]!=="bk"&&q.length>100)odd.push("too long: "+q);
   if(/^(gt|gn|gc|sw)$/.test(r[1])&&mk&&aq(r[2],"")&&q.toLowerCase().indexOf(aq(r[2],"").toLowerCase())!==0&&/^Find (a copy|a boxed copy)$/.test(x[0]))odd.push("maker in front of a game or program: "+q);
   if(/^(gt|gn|gc)$/.test(r[1])&&(parseInt(r[0],10)||0)<1993&&/soundtrack/i.test(q))odd.push("soundtrack search for an early game: "+q)})});
 const zz=find("ZZT").map(x=>x[1]).join("|");if(/Potomac/.test(zz)||zz.indexOf("ZZT game")<0)odd.push("ZZT: "+zz);
 const cp=find("CP/M").map(x=>x[1]).join("|");if(cp.indexOf("CP/M")<0)odd.push("CP/M lost its slash: "+cp);
 if(odd.length){console.error("FAIL: "+odd.length+" odd search phrases, e.g. "+odd.slice(0,6).join(" | "));process.exit(1)}
 console.log("ok   search phrases read naturally: no maker stuck in front of games, no soundtrack for early games, slashes kept")}
console.log("ok   "+n+" catalog items and timeline entries all have Amazon and eBay links");console.log("OK affiliate");
