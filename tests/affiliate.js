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
console.log("ok   "+n+" catalog items and timeline entries all have Amazon and eBay links");console.log("OK affiliate");
