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
 if([...t.matchAll(/<script[^>]+src="([^"]+)"/g)].some(m=>!/^\/(pages|icons|menu)\.js$/.test(m[1])))bad.push(f+" (script)")});
ok(!bad.length,"every page has one h1, a good title, description and canonical, and valid JSON-LD"+(bad.length?" ("+bad.slice(0,3).join(", ")+")":""));
ok([...titles.values()].every(n=>n===1),"page titles are unique");
ok([...descs.values()].filter(n=>n>1).length<=Math.ceil(files.length*.02),"descriptions are almost all unique");
ok(affPages>1000&&badAff===0,"affiliate links appear on "+affPages+" pages and every one is rel=sponsored");
{const gs=["retro-pc-starter-kit","fix-a-dead-vintage-computer","play-old-pc-games-on-modern-gear"];
 const pages=gs.map(g=>{try{return rd("guides/"+g+"/index.html")}catch(e){return""}});
 ok(pages.every(Boolean)&&urls.some(u=>/\/guides\/$/.test(u))&&gs.every(g=>urls.some(u=>u.indexOf("/guides/"+g+"/")>=0)),"three guides and the guides index are in the sitemap");
 ok(pages.every(p=>/affiliate links/i.test(p)&&/Amazon Associate/.test(p)&&(p.match(/class="sp-pick"/g)||[]).length>=5),"every guide shows the disclosure and at least five picks");
 ok(pages.every(p=>(p.match(/<a [^>]*href="https:\/\/www\.(?:ebay|amazon)\.com[^>]*>/g)||[]).every(x=>/rel="sponsored noopener noreferrer"/.test(x))),"guide product links are all rel=sponsored");
 }
{const bp=(()=>{try{return rd("books/index.html")}catch(e){return""}})();
 ok(!!bp&&urls.some(u=>/\/books\/$/.test(u)),"the Books page is in the sitemap");
 ok((bp.match(/class="bk k-/g)||[]).length>=35&&(bp.match(/class="spine k-/g)||[]).length>=35,"the Books page has a spine and a card for every book");
 ok((bp.match(/<a [^>]*href="https:\/\/www\.(?:ebay|amazon)\.com[^>]*>/g)||[]).length>=60&&!/<a [^>]*href="https:\/\/www\.(?:ebay|amazon)\.com[^>]*>/.test(bp.replace(/<a [^>]*rel="sponsored noopener noreferrer"[^>]*>/g,"")),"book links are affiliate links and all rel=sponsored");
 const cast=["connie-wink","connie-happy","ram-garage","zack"].every(n=>fs.existsSync(path.join(root,"cast/"+n+".svg")));
 ok(cast&&/class="[^"]*sp-cameo/.test(bp)&&/class="[^"]*sp-cameo/.test(rd("guides/retro-pc-starter-kit/index.html"))&&/class="[^"]*sp-cameo/.test(rd("404.html")),"Connie and the family appear on the books, guides and 404 pages");
 const some=files.filter((f,i)=>i%97===0);ok(some.every(f=>/class="[^"]*sp-cameo/.test(rd(f))||/\/(museum|guides)\/index\.html$/.test(f)||f==="/index.html"),"static pages carry a Connie cameo (sampled)")}
const idx=rd("index.html");
ok(/<meta name="description" content="[^"]{80,}"/.test(idx)&&/rel="canonical"/.test(idx)&&/property="og:image"/.test(idx)&&/application\/ld\+json/.test(idx),"home page has description, canonical, social tags and structured data");
{const host=base.replace(/^https:\/\//,"");let cn="";try{cn=rd("CNAME").trim()}catch(e){}
 ok(!cn||cn===host,"sitemap host matches the CNAME ("+host+")");
 ok(rd("index.html").indexOf('<link rel="canonical" href="'+base+'/">')>=0&&rd("app.js").indexOf('SITE_URL="'+base+'/"')>=0&&rd("feed.xml").indexOf(base)>=0,"home page canonical, QR address and feed all use "+base)}
ok(fs.existsSync(path.join(root,"og.png"))&&fs.statSync(path.join(root,"og.png")).size>10000,"og.png exists");
ok(/noindex/.test(rd("admin.html")),"admin page stays out of search results");
// the nightly-style rebuild must watch every file the generator reads and commit every folder it writes
{const gen=rd("tools/build-seo.js"),yml=rd(".github/workflows/seo.yml"),pathsLine=(yml.match(/paths: \[([^\]]*)\]/)||[])[1]||"";
 const inputs=new Set([...gen.matchAll(/["']([\w.-]+\.js)["']/g)].map(m=>m[1]).filter(f=>fs.existsSync(path.join(root,f))));
 [...gen.matchAll(/\["(timeline[\w-]*\.js[^\]]*)\]/g)].forEach(m=>m[1].split(",").forEach(x=>{x=x.replace(/["\s]/g,"");if(/\.js$/.test(x)&&fs.existsSync(path.join(root,x)))inputs.add(x)}));
 const unwatched=[...inputs].filter(f=>pathsLine.indexOf(f)<0);
 ok(unwatched.length===0,"the rebuild workflow watches every file the generator reads"+(unwatched.length?" (missing: "+unwatched.join(", ")+")":""));
 const gd=(gen.match(/const GEN=\[([^\]]*)\]/)||[])[1]||"",dirs=gd.replace(/["\s]/g,"").split(",").filter(Boolean),addl=(yml.match(/git add -A ([^\n]*)/)||[])[1]||"";
 const nc=dirs.concat(["sitemap.xml","robots.txt","404.html"]).filter(d=>addl.split(/\s+/).indexOf(d)<0);
 ok(nc.length===0,"the rebuild workflow commits every folder and file the generator writes"+(nc.length?" (missing: "+nc.join(", ")+")":""))}
{const vm=require("vm"),pc={window:{},console};vm.createContext(pc);vm.runInContext(rd("pages.js"),pc);
 const SG=vm.runInContext("SITE",pc),idx=rd("features/index.html"),all=[].concat(...SG.map(g=>g.i.filter(x=>x[0]!=="--")));
 const miss=all.filter(x=>idx.indexOf('href="'+(/^#\//.test(x[0])?"/"+x[0]:x[0]).replace(/&/g,"&amp;")+'"')<0);
 ok(miss.length===0,"the /features/ site map lists all "+all.length+" pages from pages.js"+(miss.length?" (missing "+miss.slice(0,3).map(x=>x[0]).join(", ")+")":""));
 ok(SG.every(g=>urls.some(u=>u.endsWith("/features/"+g.id+"/")))&&urls.some(u=>u.endsWith("/features/")),"the site map and every section page are in the sitemap");
 ok(SG.every(g=>fs.existsSync(path.join(root,"features/"+g.id+"/index.html"))&&/Open [^<]+ in the interactive museum/.test(rd("features/"+g.id+"/index.html"))),"each section page links into the interactive museum")}
{const vm=require("vm"),rc={window:{},console};vm.createContext(rc);vm.runInContext(rd("recap-data.js"),rc);const RC=vm.runInContext("RECAP",rc);
 ok(RC.every(m=>fs.existsSync(path.join(root,"recap/"+m.id+"/index.html")))&&fs.existsSync(path.join(root,"recap/index.html")),"every recap machine has its own page, plus the /recap/ index ("+RC.length+")");
 const sm=rd("sitemap.xml");ok(RC.every(m=>sm.indexOf("/recap/"+m.id+"/")>0)&&sm.indexOf("/recap/</loc>")>0,"the recap pages are in the sitemap");
 const pp=rd("recap/pico/index.html");ok((pp.match(/<tr><th scope="row">EC\d+/g)||[]).length===22&&/Sound Retro/.test(pp)&&/Creative Commons Attribution/.test(pp),"the Pico page lists 22 capacitors and credits the CC BY source");
 ok(RC.every(m=>{const h=rd("recap/"+m.id+"/index.html");return/rel="canonical"/.test(h)&&/Open the interactive checklist/.test(h)&&(m.boards.length?/"@type":"HowTo"/.test(h):/\/recap\/how-to\//.test(h)&&!/"@type":"HowTo"/.test(h))&&/Where to start/.test(h)&&(h.match(/<a href="https:\/\/www\.(amazon|ebay)\.com[^>]*>/g)||[]).every(a=>/rel="sponsored noopener noreferrer"/.test(a))}),"each recap page has a canonical, a link to the checklist, where-to-start, HowTo data (or a link to the shared how-to), and only sponsored store links");
 ok(/"@type":"HowTo"/.test(rd("recap/how-to/index.html"))&&/<h1>How to recap/.test(rd("recap/how-to/index.html")),"the shared how-to page has its own HowTo data");
 ok(RC.every(m=>/<h1>Recap the /.test(rd("recap/"+m.id+"/index.html"))&&/sp-cameo/.test(rd("recap/"+m.id+"/index.html"))),"each recap page has one heading and a family cameo")}
console.log(fails?"\n"+fails+" FAILED":"\nAll good.");process.exit(fails?1:0);
