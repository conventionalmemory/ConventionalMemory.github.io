/* Builds the search-engine pages: real, crawlable URLs for what the single-page app only shows behind a # address.
   Run after the timeline or catalog data changes:   node tools/build-seo.js
   Check that the files on disk are current:        node tools/build-seo.js --check
   Writes:
     history/<slug>/index.html   one page per timeline entry that has real text (title, description, facts, related entries,
                                  "find one of your own" affiliate links, structured data)
     year/<yyyy>/index.html      every entry for a year, grouped by kind
     decade/<yyyy>s/index.html   a decade hub with the years and a shopping box
     history/index.html          the front door to all of the above
     museum/<id>/index.html      the published catalog exhibits, museum/index.html lists them
     sitemap.xml, robots.txt, 404.html
   The pages use no script at all. They link to style.css and send people on to the interactive museum.
   Affiliate links come from affiliate.js and gear.js, so they stay in step with the app (every one is rel="sponsored"). */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const CHECK=process.argv.indexOf("--check")>=0;
let SITE="https://conventionalmemory.github.io";
try{const c=fs.readFileSync(path.join(root,"CNAME"),"utf8").trim();if(c)SITE="https://"+c}catch(e){}
const NAME="Conventional Memory";

/* ---- load the same data the app uses ---- */
const ctx={window:{},document:{addEventListener(){},readyState:"complete",getElementById(){return null}},esc:s=>String(s),console};vm.createContext(ctx);
["timeline-data.js","timeline-extra.js","timeline-edits.js","items.js","draftfilter.js","affiliate.js","gear.js"].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f}));
const get=n=>vm.runInContext(n,ctx);
const TL=get("TL"),TLX=get("typeof TLX!=='undefined'?TLX:{}"),ITEMS=get("ITEMS"),AFF_SHORT=get("AFF_SHORT");
const gearCtx=get("gearCtx"),gearFinds=get("gearFinds"),gearParts=get("gearParts"),gearBooks=get("gearBooks"),affUrl=get("affUrl"),affOn=get("affOn");

/* ---- helpers ---- */
const H=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=s=>String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70).replace(/-+$/,"");
const {GUIDES,TIERS,UPDATED:GUIDES_UPDATED}=require("./guides.js");
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
const dlabel=d=>{const p=String(d).split("-");return p.length===3?MON[+p[1]-1]+" "+(+p[2])+", "+p[0]:p.length===2?MON[+p[1]-1]+" "+p[0]:p[0]};
const yr=r=>+String(r[0]).slice(0,4);
const KIND={hw:"Computer or hardware",pe:"Peripheral",gt:"Game",gn:"Game",gc:"Game",m:"Movie",sw:"Software",e:"Event",u:"Legal milestone",w:"World event"};
const KIND_PL={hw:"Computers and hardware",pe:"Peripherals",gt:"Games",gn:"Games",gc:"Games",m:"Movies",sw:"Software",e:"Events",u:"Legal milestones",w:"World events"};
const KORDER=["hw","pe","sw","gt","gn","gc","m","e","u","w"];
const clip=(s,n)=>{s=String(s||"").replace(/\s+/g," ").trim();if(s.length<=n)return s;s=s.slice(0,n-1);return s.replace(/\s+\S*$/,"")+"\u2026"};
const lead=(s,n)=>{s=String(s||"").replace(/\s+/g," ").trim();const m=s.match(/^(.*?[.!?])(\s|$)/);let o=m?m[1]:s;if(o.length<90&&m){const m2=s.slice(o.length).trim().match(/^(.*?[.!?])(\s|$)/);if(m2&&(o+" "+m2[1]).length<=n)o+=" "+m2[1]}return clip(o,n)};
const abs=p=>SITE+p;
const TODAY=new Date().toISOString().slice(0,10);

/* ---- the entries that get their own page ---- */
const rows=TL.map((r,i)=>({r,i,name:r[2],y:yr(r),k:r[1],x:TLX[r[2]]||{}}));
function textOf(e){const t=String(e.r[4]||"").trim(),d=String(e.x.detail||"").trim();return{t,d:d&&t.indexOf(d)<0&&d.indexOf(t)<0?d:"",all:(t+" "+d).trim()}}
rows.forEach(e=>{e.tx=textOf(e);e.page=e.tx.all.length>=80});
const used=new Set();rows.forEach(e=>{if(!e.page)return;let s=slug(e.name)||"entry";if(!/\d{4}/.test(s))s+="-"+e.y;let u=s,n=2;while(used.has(u))u=s+"-"+n++;used.add(u);e.slug=u});
const byName=new Map(rows.map(e=>[e.name,e]));
const link=e=>e.page?"/history/"+e.slug+"/":"";
const years=[...new Set(rows.map(e=>e.y))].sort((a,b)=>a-b);
const byYear=new Map(years.map(y=>[y,rows.filter(e=>e.y===y)]));
const decadeOf=y=>y<1950?"before-1950":Math.floor(y/10)*10+"s";
const decades=[...new Set(years.map(decadeOf))].sort();
const dlabelD=d=>d==="before-1950"?"Before 1950":d;
const sorted=rows.filter(e=>e.page).sort((a,b)=>String(a.r[0]).localeCompare(String(b.r[0]))||a.name.localeCompare(b.name));
const pos=new Map(sorted.map((e,i)=>[e,i]));

/* ---- page shell ---- */
const CSP="default-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; base-uri 'none'; form-action 'none'";
function shell(o){const url=abs(o.path),desc=clip(o.desc,158),title=o.title;
 const ld=(o.ld||[]).map(x=>'<script type="application/ld+json">'+JSON.stringify(x).replace(/</g,"\\u003c")+"</script>").join("\n");
 return'<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta http-equiv="Content-Security-Policy" content="'+CSP+'">\n'
 +"<title>"+H(title)+"</title>\n"+'<meta name="description" content="'+H(desc)+'">\n'+(o.noindex?'<meta name="robots" content="noindex">\n':'<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="canonical" href="'+H(url)+'">\n')
 +'<meta property="og:site_name" content="'+NAME+'">\n<meta property="og:type" content="'+(o.og||"article")+'">\n<meta property="og:title" content="'+H(title)+'">\n<meta property="og:description" content="'+H(desc)+'">\n<meta property="og:url" content="'+H(url)+'">\n<meta property="og:image" content="'+abs("/og.png")+'">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
 +'<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="'+H(title)+'">\n<meta name="twitter:description" content="'+H(desc)+'">\n<meta name="twitter:image" content="'+abs("/og.png")+'">\n'
 +'<meta name="theme-color" content="#000080">\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\n<link rel="alternate" type="application/rss+xml" title="'+NAME+': recent changes" href="/feed.xml">\n'
 +'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=VT323&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/style.css">\n'+ld+"\n</head>\n<body>\n"
 +'<div class="wrap sp">\n<header class="top"><a class="brand" href="/">C:\\&gt;ConventionalMemory.io</a><nav class="sp-nav" aria-label="Main"><a href="/#/">Museum</a> <a href="/history/">Timeline pages</a> <a href="/guides/">Guides</a> <a href="/#/catalog">Catalog</a> <a href="/#/play">Games</a> <a href="/#/connie">Connie</a></nav></header>\n'
 +(o.crumbs?'<nav class="sp-crumb" aria-label="Breadcrumb">'+o.crumbs.map((c,i)=>i<o.crumbs.length-1?'<a href="'+c[1]+'">'+H(c[0])+"</a>":"<span>"+H(c[0])+"</span>").join(" &rsaquo; ")+"</nav>\n":"")
 +"<main>\n"+o.body+"\n</main>\n"
 +'<footer class="sp-foot"><p><a href="/#/">Open the interactive museum</a> &middot; <a href="/history/">Timeline pages</a> &middot; <a href="/museum/">Exhibits</a> &middot; <a href="/guides/">Guides</a> &middot; <a href="/#/disclosure">Affiliate disclosure</a> &middot; <a href="/feed.xml">RSS</a></p><p class="tn">'+NAME+' is a museum of vintage computers, a timeline and retro games, by Matt and Tony. Dates and descriptions are summarized from public sources; check the source named on each page.</p></footer>\n</div>\n</body>\n</html>\n'}
const crumbLD=c=>({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:c.map((x,i)=>({"@type":"ListItem",position:i+1,name:x[0],item:abs(x[1])}))});
const ORG={"@type":"Organization",name:NAME,url:abs("/"),logo:abs("/icon.svg")};

/* ---- affiliate block ---- */
function aff(name,maker,key,heading){if(!affOn())return"";
 const c=gearCtx(name,maker,key),finds=gearFinds(c,name,maker),parts=gearParts(c,name,maker),books=gearBooks(c);
 const L=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const row=(label,q)=>{const e=affUrl("ebay",q),a=affUrl("amazon",q);return e||a?"<li>"+H(label)+": "+[L(e,"eBay"),L(a,"Amazon")].filter(Boolean).join(" &middot; ")+"</li>":""};
 const items=finds.slice(0,2).map(f=>row(f[0],f[1])).concat(parts.slice(0,1).map(p=>row(p[0],p[1])),books.slice(0,1).map(b=>row("Further reading: "+b[0],b[1]))).filter(Boolean);
 if(!items.length)return"";
 return'<section class="sp-find"><h2>'+H(heading||"Find one of your own")+"</h2><ul>"+items.join("")+'</ul><p class="tn">'+H(AFF_SHORT)+' These links only search for the item by name. <a href="/#/disclosure">Disclosure</a></p></section>'}
function shopBox(title,qs){if(!affOn())return"";const L=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const li=qs.map(q=>"<li>"+H(q[0])+": "+[L(affUrl("ebay",q[1]),"eBay"),L(affUrl("amazon",q[1]),"Amazon")].filter(Boolean).join(" &middot; ")+"</li>").join("");
 return'<section class="sp-find"><h2>'+H(title)+"</h2><ul>"+li+'</ul><p class="tn">'+H(AFF_SHORT)+' <a href="/#/disclosure">Disclosure</a></p></section>'}

const GUIDE_BY=Object.fromEntries(GUIDES.map(g=>[g.slug,g]));
function guideLine(kind){const a=kind==="hw"||kind==="pe"||kind==="item"?["fix-a-dead-vintage-computer","retro-pc-starter-kit"]:/^g[tnc]$/.test(kind)||kind==="sw"?["play-old-pc-games-on-modern-gear"]:[];
 return a.length?'<p class="sp-guides"><b>Guides:</b> '+a.map(k=>'<a href="/guides/'+k+'/">'+H(GUIDE_BY[k].h1)+"</a>").join(" &middot; ")+"</p>":""}
const out={};
const put=(p,c)=>{out[p]=c};

/* ---- one page per timeline entry ---- */
sorted.forEach((e,idx)=>{const r=e.r,x=e.x,y=e.y,kind=KIND[e.k]||"Entry",sub=x.sub&&x.sub!==kind?x.sub:"";
 const path_="/history/"+e.slug+"/",dstr=dlabel(r[0]);
 let title=e.name+" ("+y+"): "+(sub||kind)+" | "+NAME;if(title.length>64)title=e.name+" ("+y+") | "+NAME;if(title.length>64)title=clip(e.name,58)+" ("+y+")";
 let desc=lead(e.tx.t||e.tx.d,155);if(desc.length<90&&e.tx.all.length>desc.length)desc=clip(e.tx.all,155);
 const facts=[["Date",dstr],["Kind",kind+(sub?": "+sub:"")]];if(x.maker&&x.maker!=="n/a")facts.push(["Maker or publisher",x.maker]);if(x.dev&&x.dev!==x.maker)facts.push(["Developer",x.dev]);if(x.plat&&x.plat.length)facts.push(["Platforms",x.plat.join(", ")]);
 Object.keys(x.specs||{}).slice(0,10).forEach(k=>facts.push([k,x.specs[k]]));
 const rel=(x.links||[]).map(l=>{const t=byName.get(l[0]);return t&&t.page&&t!==e?'<li><a href="'+link(t)+'">'+H(t.name)+"</a> ("+H(l[1])+", "+t.y+")</li>":""}).filter(Boolean).slice(0,8);
 const same=byYear.get(y).filter(z=>z.page&&z!==e),start=same.length?same.indexOf(same.filter(z=>pos.get(z)>idx)[0]):0,more=[];for(let i=0;i<Math.min(10,same.length);i++)more.push(same[((start<0?0:start)+i)%same.length]);
 const prev=sorted[idx-1],next=sorted[idx+1];
 const src=String(r[5]||"");const srcHtml=/^https?:\/\//.test(src)?'Source: <a href="'+H(src)+'" rel="nofollow noopener" target="_blank">'+H(src.replace(/^https?:\/\/(www\.)?/,"").split("/")[0])+"</a>":src?"Source: "+H(src):"";
 const crumbs=[["Home","/"],["Timeline","/history/"],[String(y),"/year/"+y+"/"],[e.name,path_]];
 const body='<article class="sp-art"><p class="sp-kicker">'+H(dstr)+" &middot; "+H(kind)+"</p><h1>"+H(e.name)+" ("+y+")</h1>"
  +"<p class=\"sp-lead\">"+H(e.tx.t||e.tx.d)+"</p>"+(e.tx.t&&e.tx.d?"<p>"+H(e.tx.d)+"</p>":"")
  +'<p><a class="btn pri" href="/#/timeline/'+y+'">See '+y+" in the interactive timeline</a></p>"
  +'<h2>Facts</h2><dl class="sp-facts">'+facts.map(f=>"<div><dt>"+H(f[0])+"</dt><dd>"+H(f[1])+"</dd></div>").join("")+"</dl>"
  +(srcHtml?'<p class="tn">'+srcHtml+"</p>":"")
  +aff(e.name,x.maker,e.name)+guideLine(e.k)
  +(rel.length?"<h2>Related</h2><ul>"+rel.join("")+"</ul>":"")
  +(more.length?'<h2>Also in '+y+"</h2><ul class=\"sp-cols\">"+more.map(z=>'<li><a href="'+link(z)+'">'+H(z.name)+"</a> <small>"+H(KIND[z.k]||"")+"</small></li>").join("")+'</ul><p><a href="/year/'+y+'/">Everything from '+y+"</a></p>":"")
  +'<nav class="sp-pn" aria-label="Previous and next">'+(prev?'<a href="'+link(prev)+'">&larr; '+H(prev.name)+" ("+prev.y+")</a>":"<span></span>")+(next?'<a href="'+link(next)+'">'+H(next.name)+" ("+next.y+") &rarr;</a>":"")+"</nav></article>";
 put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,ld:[{"@context":"https://schema.org","@type":"Article",headline:e.name+" ("+y+")",description:desc,about:{"@type":"Thing",name:e.name},image:abs("/og.png"),author:ORG,publisher:ORG,mainEntityOfPage:abs(path_),inLanguage:"en"},crumbLD(crumbs)]}))});

/* ---- year hubs ---- */
years.forEach(y=>{const list=byYear.get(y),path_="/year/"+y+"/",pages=list.filter(e=>e.page).length;
 const kinds=KORDER.map(k=>[k,list.filter(e=>e.k===k)]).filter(a=>a[1].length);
 const title=y+" in computing and games: "+list.length+" milestones | "+NAME;
 const names=list.filter(e=>e.page).slice(0,3).map(e=>e.name);
 const desc=y+" in computing, games and technology: "+list.length+" milestones"+(names.length?", including "+names.join(", ")+".":".");
 const crumbs=[["Home","/"],["Timeline","/history/"],[String(y),path_]];const dec=decadeOf(y);
 const py=years[years.indexOf(y)-1],ny=years[years.indexOf(y)+1];
 const body='<article class="sp-art"><h1>'+y+" in computing, games and technology</h1><p class=\"sp-lead\">"+list.length+" milestones from "+y+": "+kinds.map(a=>a[1].length+" "+(KIND_PL[a[0]]||"").toLowerCase()).join(", ")+'.</p><p><a class="btn pri" href="/#/timeline/'+y+'">Open '+y+' in the interactive timeline</a> <a class="btn" href="/decade/'+dec+'/">The '+H(dlabelD(dec))+"</a></p>"
  +kinds.map(a=>"<h2>"+H(KIND_PL[a[0]])+"</h2><ul class=\"sp-cols\">"+a[1].map(e=>"<li>"+(e.page?'<a href="'+link(e)+'">'+H(e.name)+"</a>":H(e.name))+"</li>").join("")+"</ul>").join("")
  +'<nav class="sp-pn" aria-label="Previous and next year">'+(py?'<a href="/year/'+py+'/">&larr; '+py+"</a>":"<span></span>")+(ny?'<a href="/year/'+ny+'/">'+ny+" &rarr;</a>":"")+"</nav></article>";
 put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:y+" in computing and games",description:desc,url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))});

/* ---- decade hubs ---- */
const SHOP={
 "before-1950":[["Computer history books","history of early computing book"],["Vintage slide rules and calculators","vintage slide rule"]],
 "1950s":[["Computer history books","history of computers 1950s book"],["Vintage electronics","vintage vacuum tube electronics"]],
 "1960s":[["Computer history books","history of computers 1960s book"],["Vintage electronics","vintage 1960s computer"]]};
decades.forEach(d=>{const ys=years.filter(y=>decadeOf(y)===d),path_="/decade/"+d+"/",total=ys.reduce((n,y)=>n+byYear.get(y).length,0),label=dlabelD(d),short=d==="before-1950"?"before 1950":"the "+d;
 const title="Computing and games in "+short+": "+total+" milestones | "+NAME;
 const picks=rows.filter(e=>e.page&&ys.indexOf(e.y)>=0&&(e.k==="hw"||e.k==="sw")).slice(0,12);
 const desc="A tour of "+short+" in computers, software, games and technology: "+total+" milestones, year by year.";
 const crumbs=[["Home","/"],["Timeline","/history/"],[label,path_]];
 const shop=SHOP[d]||[["Vintage computers","vintage "+d+" computer"],["Retro game consoles","retro "+d+" video game console"],["Computer books and manuals","vintage "+d+" computer manual"],["Computer history books","history of computers "+d+" book"]];
 const body='<article class="sp-art"><h1>Computing and games in '+H(short)+'</h1><p class="sp-lead">'+total+" milestones across "+ys.length+' years. Pick a year to see everything that happened.</p><p><a class="btn pri" href="/#/timeline/'+ys[0]+'">Open the interactive timeline</a></p>'
  +'<h2>Years</h2><ul class="sp-years">'+ys.map(y=>'<li><a href="/year/'+y+'/">'+y+"</a> <small>"+byYear.get(y).length+"</small></li>").join("")+"</ul>"
  +(picks.length?"<h2>Computers and software to know</h2><ul class=\"sp-cols\">"+picks.map(e=>'<li><a href="'+link(e)+'">'+H(e.name)+"</a> <small>"+e.y+"</small></li>").join("")+"</ul>":"")
  +shopBox("Collect "+(d==="before-1950"?"early computing":"the "+d),shop)
  +'<nav class="sp-pn" aria-label="Other decades">'+decades.map(z=>z===d?"<span>"+H(dlabelD(z))+"</span>":'<a href="/decade/'+z+'/">'+H(dlabelD(z))+"</a>").join(" ")+"</nav></article>";
 put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Computing and games in "+short,description:desc,url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))});

/* ---- the timeline front door ---- */
{const path_="/history/",crumbs=[["Home","/"],["Timeline","/history/"]];
 const title="Computer and game history timeline, "+years[0]+" to today | "+NAME;
 const desc="A browsable history of computers, software, games, movies and events from "+years[0]+" to "+years[years.length-1]+": "+rows.length.toLocaleString("en-US")+" entries, by decade and year.";
 const body='<article class="sp-art"><h1>Computer, game and technology history</h1><p class="sp-lead">'+rows.length.toLocaleString("en-US")+" milestones from "+years[0]+" to "+years[years.length-1]+": the machines, the software, the games, the movies and the court cases. Start with a decade, or jump to a year.</p><p><a class=\"btn pri\" href=\"/#/timeline\">Open the interactive timeline</a></p>"
  +decades.map(d=>{const ys=years.filter(y=>decadeOf(y)===d);return'<h2><a href="/decade/'+d+'/">'+H(dlabelD(d))+"</a></h2><ul class=\"sp-years\">"+ys.map(y=>'<li><a href="/year/'+y+'/">'+y+"</a></li>").join("")+"</ul>"}).join("")
  +'<h2>Exhibits</h2><p><a href="/museum/">See the exhibits in the museum collection</a></p></article>';
 put("/history/index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Computer, game and technology history",description:desc,url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))}

/* ---- catalog exhibits ---- */
{const clean=s=>String(s||"").trim();
 ITEMS.forEach(it=>{const path_="/museum/"+it.id+"/",specs=it.specs||{},desc=lead(it.text,155);
  const title=it.name+(it.year?" ("+it.year+")":"")+": specs and history | "+NAME,crumbs=[["Home","/"],["Exhibits","/museum/"],[it.name,path_]];
  const facts=[["Maker",it.maker],["Model",it.model],["Year",it.year],["Category",it.cat]].filter(f=>f[1]).concat(Object.keys(specs).slice(0,16).map(k=>[k,specs[k]]));
  const refs=(it.refs||[]).filter(r=>/^https?:\/\//.test(r.u||"")).slice(0,6);
  const body='<article class="sp-art"><p class="sp-kicker">'+H(it.cat||"Exhibit")+"</p><h1>"+H(it.name)+"</h1><p class=\"sp-lead\">"+H(clean(it.text))+'</p><p><a class="btn pri" href="/#/item/'+H(it.id)+'">See this exhibit in the museum</a></p>'
   +'<h2>Specifications</h2><dl class="sp-facts">'+facts.map(f=>"<div><dt>"+H(f[0])+"</dt><dd>"+H(f[1])+"</dd></div>").join("")+"</dl>"
   +(refs.length?"<h2>References</h2><ul>"+refs.map(r=>'<li><a href="'+H(r.u)+'" rel="nofollow noopener" target="_blank">'+H(r.t||r.u)+"</a></li>").join("")+"</ul>":"")
   +aff(it.name,it.maker,it.id)+guideLine("item")+"</article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,ld:[{"@context":"https://schema.org","@type":"Article",headline:it.name,description:desc,about:{"@type":"Thing",name:it.name},image:abs("/og.png"),author:ORG,publisher:ORG,mainEntityOfPage:abs(path_),inLanguage:"en"},crumbLD(crumbs)]}))});
 const path_="/museum/",crumbs=[["Home","/"],["Exhibits","/museum/"]];
 put("/museum/index.html",shell({path:path_,title:"Vintage computer exhibits and specifications | "+NAME,desc:"The exhibits in the "+NAME+" collection, with specifications and history.",crumbs,og:"website",
  body:'<article class="sp-art"><h1>The exhibits</h1><p class="sp-lead">Machines from the museum floor, with specifications and history.</p><ul class="sp-cols">'+ITEMS.map(it=>'<li><a href="/museum/'+H(it.id)+'/">'+H(it.name)+"</a> <small>"+H(it.year||"")+"</small></li>").join("")+'</ul><p><a class="btn pri" href="/#/catalog">Browse the whole catalog</a></p></article>',
  ld:[crumbLD(crumbs)]}))}

/* ---- buyer guides ---- */
{const L=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const lk=p=>{const ls=[],am=p.a&&affUrl("amazon",p.a),eb=p.e&&affUrl("ebay",p.e);if(am)ls.push(L(am,"Check Amazon"));if(eb)ls.push(L(eb,p.a?"Check eBay":"Find one on eBay"));return ls.length&&affOn()?'<p class="sp-plinks">'+ls.join(" &middot; ")+"</p>":""};
 const pick=p=>{if(p.tier)p=TIERS[p.tier];
  if(p.tiers)return'<div class="sp-pick sp-tiered"><h3>'+H(p.n)+'</h3><p class="sp-ptag">'+H(p.t)+"</p><p>"+H(p.w)+'</p><div class="sp-tiers">'+p.tiers.map(x=>'<div class="sp-tier"><p class="sp-tl">'+H(x.l)+"</p><h4>"+H(x.n)+"</h4><p>"+H(x.w)+"</p>"+lk(x)+"</div>").join("")+"</div></div>";
  return'<div class="sp-pick"><h3>'+H(p.n)+'</h3><p class="sp-ptag">'+H(p.t)+"</p><p>"+H(p.w)+"</p>"+(p.s?'<p class="sp-pskip"><b>Watch out:</b> '+H(p.s)+"</p>":"")+lk(p)+(p.g?'<p class="sp-plinks"><a href="/guides/'+p.g+'/">Read the repair guide</a></p>':"")+"</div>"};
 GUIDES.forEach(g=>{const path_="/guides/"+g.slug+"/",crumbs=[["Home","/"],["Guides","/guides/"],[g.h1,path_]];
  const tl=(g.links||[]).map(n=>{const e=byName.get(n);if(!e||!e.page){console.log("guide link skipped (no page):",n);return""}return'<li><a href="'+link(e)+'">'+H(e.name)+"</a> <small>"+e.y+"</small></li>"}).filter(Boolean);
  const others=GUIDES.filter(o=>o!==g).map(o=>'<li><a href="/guides/'+o.slug+'/">'+H(o.h1)+"</a></li>");
  const body='<article class="sp-art sp-guide"><p class="sp-kicker">Guide &middot; Updated '+H(dlabel(GUIDES_UPDATED))+"</p><h1>"+H(g.h1)+"</h1><p class=\"sp-lead\">"+H(g.lead)+"</p>"
   +'<p class="sp-connie"><b>Connie says:</b> '+H(g.quip)+"</p>"
   +'<p class="sp-how"><b>How we pick.</b> A product makes the list only when reviewers and long-time collectors keep recommending it, it does one job well and it will still work in five years. No filler, no mystery brands, and no paid placements. Not every item has been through our own bench, so we go by reputation. Prices change, so check the listing.</p>'
   +'<p class="tn sp-disc">Some links on this page are affiliate links. If you buy through one, Conventional Memory earns a small commission at no cost to you. '+H(AFF_SHORT)+' <a href="/#/disclosure">Disclosure</a></p>'
   +(g.paths?"<h2>Pick your path</h2><ol>"+g.paths.map(p=>"<li><b>"+H(p[0])+".</b> "+H(p[1])+"</li>").join("")+"</ol>":"")
   +(g.safety?'<p class="sp-safe"><b>'+H(g.safety.split(":")[0])+".</b>"+H(g.safety.slice(g.safety.indexOf(":")+1))+"</p>":"")
   +(g.steps?"<h2>Step by step</h2><ol class=\"sp-steps\">"+g.steps.map(t=>"<li><b>"+H(t[0])+".</b> "+H(t[1])+"</li>").join("")+"</ol>":"")
   +g.sections.map(sec=>"<h2>"+H(sec.h)+"</h2><p>"+H(sec.intro)+"</p>"+sec.picks.map(pick).join("")).join("")
   +"<h2>Skip these</h2><ul>"+g.skip.map(t=>"<li>"+H(t)+"</li>").join("")+"</ul>"
   +(tl.length?"<h2>From the timeline</h2><ul class=\"sp-cols\">"+tl.join("")+"</ul>":"")
   +"<h2>More guides</h2><ul>"+others.join("")+'</ul><p><a class="btn pri" href="/#/">Visit the museum</a></p></article>';
  put(path_+"index.html",shell({path:path_,title:g.title+" | "+NAME,desc:g.desc,crumbs,body,ld:[{"@context":"https://schema.org","@type":"Article",headline:g.h1,description:g.desc,datePublished:GUIDES_UPDATED,dateModified:GUIDES_UPDATED,image:abs("/og.png"),author:ORG,publisher:ORG,mainEntityOfPage:abs(path_),inLanguage:"en"},crumbLD(crumbs)]}))});
 const path_="/guides/",crumbs=[["Home","/"],["Guides","/guides/"]];
 put("/guides/index.html",shell({path:path_,title:"Retro computing guides: buy, fix and play | "+NAME,desc:"Practical guides for vintage computers: the gear worth buying, how to fix a dead machine and how to play old PC games today.",crumbs,og:"website",
  body:'<article class="sp-art"><h1>Guides</h1><p class="sp-lead">Practical, funny and honest. What to buy, how to fix it and how to play on it.</p><ul class="sp-guidelist">'+GUIDES.map(g=>'<li><a href="/guides/'+g.slug+'/">'+H(g.h1)+"</a><br><span>"+H(g.desc)+"</span></li>").join("")+'</ul><p class="tn">'+H(AFF_SHORT)+' <a href="/#/disclosure">Disclosure</a></p></article>',
  ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Retro computing guides",description:"Guides for buying, fixing and playing on vintage computers.",url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))}

/* ---- 404, robots, sitemap ---- */
put("/404.html",shell({path:"/404.html",title:"Page not found | "+NAME,desc:"That page is not in the museum. Try the timeline or the catalog.",noindex:1,og:"website",
 body:'<article class="sp-art"><h1>Page not found</h1><p class="sp-lead">That page is not in the museum, or it moved.</p><p><a class="btn pri" href="/#/">Go to the museum</a> <a class="btn" href="/history/">Browse the timeline</a> <a class="btn" href="/#/search">Search</a></p></article>'}));
put("/robots.txt","User-agent: *\nAllow: /\n\nSitemap: "+abs("/sitemap.xml")+"\n");
{const urls=["/","/history/","/museum/","/guides/"].concat(GUIDES.map(g=>"/guides/"+g.slug+"/"),[]).concat(decades.map(d=>"/decade/"+d+"/"),years.map(y=>"/year/"+y+"/"),ITEMS.map(i=>"/museum/"+i.id+"/"),sorted.map(e=>"/history/"+e.slug+"/"));
 put("/sitemap.xml",'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>"<url><loc>"+H(abs(u))+"</loc>"+(u==="/"?"<changefreq>weekly</changefreq><priority>1.0</priority>":/^\/guides\//.test(u)?"<priority>0.8</priority>":/^\/(history|museum|decade)\/$|^\/decade\//.test(u)?"<priority>0.7</priority>":"")+"</url>").join("\n")+"\n</urlset>\n")}

/* ---- write or check ---- */
const GEN=["history","year","decade","museum","guides"],FILES=["sitemap.xml","robots.txt","404.html"];
function walk(d){const o=[];if(!fs.existsSync(d))return o;fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const p=path.join(d,e.name);if(e.isDirectory())o.push(...walk(p));else o.push(p)});return o}
if(CHECK){const want=Object.keys(out),have=new Set([].concat(...GEN.map(g=>walk(path.join(root,g))),FILES.map(f=>path.join(root,f)).filter(f=>fs.existsSync(f))).map(f=>"/"+path.relative(root,f).split(path.sep).join("/")));
 const miss=want.filter(p=>!have.has(p)),extra=[...have].filter(p=>!out[p]),diff=want.filter(p=>have.has(p)&&fs.readFileSync(path.join(root,p),"utf8")!==out[p]);
 if(miss.length||extra.length||diff.length){console.log("SEO pages are out of date:",miss.length,"missing,",extra.length,"extra,",diff.length,"changed. Run: node tools/build-seo.js");process.exit(1)}
 console.log("SEO pages are current:",want.length,"files");process.exit(0)}
GEN.forEach(g=>fs.rmSync(path.join(root,g),{recursive:true,force:true}));
Object.keys(out).forEach(p=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,out[p])});
console.log("entry pages:",sorted.length,"of",rows.length,"| year hubs:",years.length,"| decade hubs:",decades.length,"| exhibits:",ITEMS.length,"| files:",Object.keys(out).length,"| site:",SITE);
