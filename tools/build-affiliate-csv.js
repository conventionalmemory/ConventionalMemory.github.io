/* Builds the eBay bulk-link files: one search for every catalog item (drafts too, so they are ready when published) and every timeline entry (several where they apply).
   Run: node tools/build-affiliate-csv.js
   Writes to affiliate/:
     ebay-bulk-upload-NNN.csv   one plain eBay search link per line, no header, 1500 per file (the EPN bulk tool accepts at most 1500 lines), to upload to the eBay Partner Network bulk link tool
     ebay-search-map.csv        every search with the entry it belongs to, the plain eBay link, the tracked eBay link and the Amazon link
   These are searches, never single listings, so they keep working after any one listing ends. The site itself builds the same tracked
   links on the fly (affiliate.js and gear.js), so uploading is optional. */
const fs=require("fs"),path=require("path"),vm=require("vm");const root=path.join(__dirname,"..");
const ctx={window:{},document:{addEventListener(){},readyState:"complete",getElementById(){return null}},esc:s=>String(s),console};vm.createContext(ctx);
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f});
["timeline-data.js","timeline-extra.js","items.js","affiliate.js","gear.js"].forEach(load);
vm.runInContext('AFF.ebay=AFF.ebay||"0000000000"',ctx);
const get=n=>vm.runInContext(n,ctx);
const ITEMS=get("ITEMS"),TL=get("TL"),TLX=get("typeof TLX!=='undefined'?TLX:{}");
const KIND={hw:"Hardware",pe:"Peripheral",gt:"Game",gn:"Game",gc:"Game",m:"Movie",sw:"Software",e:"Event",u:"Legal",w:"World event"};
const rows=[],seen=new Map();
function add(entry,type,label,q,key){if(!q)return;const k=q.toLowerCase();if(!seen.has(k))seen.set(k,{q,entries:[]});const s=seen.get(k);if(s.entries.length<3)s.entries.push(entry);rows.push([entry,type,label,q])}
function collect(name,maker,key,entry,type){const c=vm.runInContext("gearCtx",ctx)(name,maker,key);
 const parts=vm.runInContext("gearParts",ctx)(c,name,maker),books=vm.runInContext("gearBooks",ctx)(c),finds=vm.runInContext("gearFinds",ctx)(c,name,maker);
 finds.forEach(f=>add(entry,type,f[0],f[1]));parts.forEach(p=>add(entry,type,p[0],p[1]));books.forEach(b=>add(entry,type,"Further reading: "+b[0],b[1]))}
let n=0;
ITEMS.forEach(it=>{collect(it.name,it.maker,it.id,"Catalog: "+it.name,it.type||"Item");n++});
const nItems=n;
TL.forEach(r=>{const tk=r[2];collect(tk,(TLX[tk]||{}).maker,tk,"Timeline "+String(r[0]).slice(0,4)+": "+tk,KIND[r[1]]||r[1]);n++});
const plain=q=>"https://www.ebay.com/sch/i.html?_nkw="+encodeURIComponent(q)+"&_sacat=0";
const tracked=q=>vm.runInContext("affUrl",ctx)("ebay",q),amazon=q=>vm.runInContext("affUrl",ctx)("amazon",q);
const csv=a=>a.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",");
const out=path.join(root,"affiliate");fs.mkdirSync(out,{recursive:true});fs.readdirSync(out).filter(f=>/^ebay-/.test(f)).forEach(f=>fs.unlinkSync(path.join(out,f)));
const list=[...seen.values()];
for(let i=0;i<list.length;i+=1500)fs.writeFileSync(path.join(out,"ebay-bulk-upload-"+String(i/1500+1).padStart(3,"0")+".csv"),list.slice(i,i+1500).map(s=>plain(s.q)).join("\n")+"\n");
fs.writeFileSync(path.join(out,"ebay-search-map.csv"),csv(["Entry","Kind","Link label","Search","eBay plain link","eBay tracked link","Amazon tracked link"])+"\n"+rows.map(r=>csv([r[0],r[1],r[2],r[3],plain(r[3]),tracked(r[3]),amazon(r[3])])).join("\n")+"\n");
console.log("catalog items:",nItems,"timeline entries:",n-nItems,"link rows:",rows.length,"unique searches:",list.length,"files:",Math.ceil(list.length/1500));
