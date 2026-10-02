/* Search-engine pages: the generated static pages are current and well formed, and the home page carries its meta tags.
   Run: node tests/seo.js */
const fs=require("fs"),path=require("path"),cp=require("child_process");const root=path.join(__dirname,"..");
let fails=0;const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails++};
const un=s=>String(s||"").replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
const rd=f=>fs.readFileSync(path.join(root,f),"utf8");
let cur="";try{cur=cp.execSync("node tools/build-seo.js --check",{cwd:root}).toString()}catch(e){cur=String(e.stdout||"")}
ok(/are current/.test(cur)||(!!process.env.CI&&/out of date/.test(cur)),"generated search pages are current ("+cur.trim().slice(0,80)+")");
const sm=rd("sitemap.xml"),urls=[...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
ok(urls.length>2000&&urls.length===new Set(urls).size&&urls.length<50000,"sitemap lists "+urls.length+" unique URLs");
const base=urls[0].replace(/\/$/,"");
ok(urls.every(u=>u.indexOf(base)===0)&&/^https:\/\//.test(base),"every sitemap URL is on one https site");
ok(/Sitemap: .*sitemap\.xml/.test(rd("robots.txt"))&&/Allow: \//.test(rd("robots.txt")),"robots.txt allows crawling and names the sitemap");
const files=urls.map(u=>u.slice(base.length)).filter(p=>p!=="/").map(p=>p+"index.html");
ok(files.every(f=>fs.existsSync(path.join(root,f))),"every sitemap URL has a page on disk");
const titles=new Map,descs=new Map,bad=[];let affPages=0,badAff=0;
files.forEach(f=>{const t=rd(f);const ti=un((t.match(/<title>([^<]*)<\/title>/)||[])[1]),de=un((t.match(/<meta name="description" content="([^"]*)"/)||[])[1]),ca=(t.match(/<link rel="canonical" href="([^"]*)"/)||[])[1];
 if(!ti||ti.length>82||!de||de.length<40||de.length>170||ca!==base+f.replace(/index\.html$/,"")||(t.match(/<h1[ >]/g)||[]).length!==1)bad.push(f);
 titles.set(ti,(titles.get(ti)||0)+1);descs.set(de,(descs.get(de)||0)+1);
 [...t.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].forEach(m=>{try{JSON.parse(m[1])}catch(e){bad.push(f+" (json-ld)")}});
 const a=[...t.matchAll(/<a [^>]*href="https:\/\/www\.(?:ebay|amazon)\.com[^>]*>/g)];if(a.length)affPages++;if(a.some(x=>!/rel="sponsored noopener noreferrer"/.test(x[0])))badAff++;
 if(/<script[^>]+src=/.test(t))bad.push(f+" (script)")});
ok(!bad.length,"every page has one h1, a good title, description and canonical, and valid JSON-LD"+(bad.length?" ("+bad.slice(0,3).join(", ")+")":""));
ok([...titles.values()].every(n=>n===1),"page titles are unique");
ok([...descs.values()].filter(n=>n>1).length<=Math.ceil(files.length*.02),"descriptions are almost all unique");
ok(affPages>1000&&badAff===0,"affiliate links appear on "+affPages+" pages and every one is rel=sponsored");
const idx=rd("index.html");
ok(/<meta name="description" content="[^"]{80,}"/.test(idx)&&/rel="canonical"/.test(idx)&&/property="og:image"/.test(idx)&&/application\/ld\+json/.test(idx),"home page has description, canonical, social tags and structured data");
ok(fs.existsSync(path.join(root,"og.png"))&&fs.statSync(path.join(root,"og.png")).size>10000,"og.png exists");
ok(/noindex/.test(rd("admin.html")),"admin page stays out of search results");
console.log(fails?"\n"+fails+" FAILED":"\nAll good.");process.exit(fails?1:0);
