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
vm.runInContext(fs.readFileSync(path.join(root,"books.js"),"utf8"),ctx,{filename:"books.js"});const BOOKSHELF=get("BOOKSHELF");
const castCtx={window:{},console,localStorage:{getItem(){return null},setItem(){}},document:{addEventListener(){},readyState:"complete"},navigator:{}};vm.createContext(castCtx);vm.runInContext(fs.readFileSync(path.join(root,"cast.js"),"utf8"),castCtx,{filename:"cast.js"});const CAST=vm.runInContext("CMCast",castCtx);
const gearCtx=get("gearCtx"),gearFinds=get("gearFinds"),gearParts=get("gearParts"),gearBooks=get("gearBooks"),affUrl=get("affUrl"),affOn=get("affOn");

/* ---- helpers ---- */
const H=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=s=>String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70).replace(/-+$/,"");
const {GUIDES,TIERS,UPDATED:GUIDES_UPDATED}=require("./guides.js");
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
const dlabel=d=>{const p=String(d).split("-");return p.length===3?MON[+p[1]-1]+" "+(+p[2])+", "+p[0]:p.length===2?MON[+p[1]-1]+" "+p[0]:p[0]};
const yr=r=>+String(r[0]).slice(0,4);
const KIND={hw:"Computer or hardware",pe:"Peripheral",gt:"Game",gn:"Game",gc:"Game",m:"Movie",sw:"Software",bk:"Book",e:"Event",u:"Legal milestone",w:"World event"};
const KIND_PL={hw:"Computers and hardware",pe:"Peripherals",gt:"Games",gn:"Games",gc:"Games",m:"Movies",sw:"Software",bk:"Books",e:"Events",u:"Legal milestones",w:"World events"};
const KORDER=["hw","pe","sw","gt","gn","gc","bk","m","e","u","w"];
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
const LIBMAP=(()=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,"libmap-data.js"),"utf8")+";this.v=LIBMAP",c,{filename:"libmap-data.js"});return c.v})(),LIBD=(()=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,"library-data.js"),"utf8")+";this.v=LIB",c,{filename:"library-data.js"});return c.v})();
const LIBK={s:"Service manual",d:"Schematic",g:"Guide",o:"Operating guide",c:"Datasheet"},LIBO="sdgoc";
const libSecIds=ids=>{let h="";ids.forEach(id=>{const ds=LIBD.d.filter(r=>r[5]&&r[5].split(",").includes(id)).sort((a,b)=>LIBO.indexOf(a[1])-LIBO.indexOf(b[1])||(a[0].toLowerCase()<b[0].toLowerCase()?-1:1));if(!ds.length)return;
 h+=(ids.length>1?"<h3>"+H(LIBD.m[id]||id)+"</h3>":"")+"<ul>"+ds.slice(0,6).map(r=>'<li><a href="https://drive.google.com/file/d/'+H(r[3])+'/view" target="_blank" rel="noopener noreferrer"><b>'+H(r[0])+"</b></a> ("+H(LIBK[r[1]]||"")+")</li>").join("")+"</ul>"+'<p><a href="/#/library/'+H(id)+'">All '+ds.length+" documents for "+H(LIBD.m[id]||id)+" in the library</a></p>"});
 return h?"<h2>Manuals and technical documents</h2><p>Service manuals, schematics and datasheets for this machine, shared from our own Google Drive folder. Check your own board and part numbers against them.</p>"+h:""},libSec=name=>libSecIds(LIBMAP[name]||[]);
const link=e=>e.page?"/history/"+e.slug+"/":"";
const years=[...new Set(rows.map(e=>e.y))].sort((a,b)=>a-b);
const byYear=new Map(years.map(y=>[y,rows.filter(e=>e.y===y)]));
const decadeOf=y=>y<1950?"before-1950":Math.floor(y/10)*10+"s";
const decades=[...new Set(years.map(decadeOf))].sort();
const dlabelD=d=>d==="before-1950"?"Before 1950":d;
const sorted=rows.filter(e=>e.page).sort((a,b)=>String(a.r[0]).localeCompare(String(b.r[0]))||a.name.localeCompare(b.name));
const pos=new Map(sorted.map((e,i)=>[e,i]));

/* ---- page shell ---- */
const CSP="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; base-uri 'none'; form-action 'none'";
const secOf=p=>/^\/(history|year|decade)\//.test(p)?"timeline":/^\/museum\//.test(p)?"catalog":/^\/(recap|repairs)\//.test(p)?"repair":/^\/(guides|books)\//.test(p)?"read":/^\/cast\//.test(p)?"connie":"";
function shell(o){const url=abs(o.path),desc=clip(o.desc,158),title=o.title;
 const ld=(o.ld||[]).map(x=>'<script type="application/ld+json">'+JSON.stringify(x).replace(/</g,"\\u003c")+"</script>").join("\n");
 return'<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta http-equiv="Content-Security-Policy" content="'+CSP+'">\n'
 +"<title>"+H(title)+"</title>\n"+'<meta name="description" content="'+H(desc)+'">\n'+(o.noindex?'<meta name="robots" content="noindex">\n':'<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="canonical" href="'+H(url)+'">\n')
 +'<meta property="og:site_name" content="'+NAME+'">\n<meta property="og:type" content="'+(o.og||"article")+'">\n<meta property="og:title" content="'+H(title)+'">\n<meta property="og:description" content="'+H(desc)+'">\n<meta property="og:url" content="'+H(url)+'">\n<meta property="og:image" content="'+abs("/og.png")+'">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
 +'<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="'+H(title)+'">\n<meta name="twitter:description" content="'+H(desc)+'">\n<meta name="twitter:image" content="'+abs("/og.png")+'">\n'
 +'<meta name="theme-color" content="#000080">\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\n<link rel="alternate" type="application/rss+xml" title="'+NAME+': recent changes" href="/feed.xml">\n'
 +'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=VT323&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/style.css">\n'+ld+"\n</head>\n<body data-sec=\""+secOf(o.path)+"\">\n"
 +'<a class="skip" href="#main">Skip to the page</a>\n<div class="wrap sp">\n<header class="top"><a class="brand" href="/">C:\\&gt;ConventionalMemory.io</a><div class="utl"></div><nav aria-label="Main"><a data-s="catalog" href="/#/catalog">Catalog</a><a data-s="timeline" href="/#/timeline">Timeline</a><a data-s="repair" href="/#/hub/repair">Repair</a><a data-s="explore" href="/#/hub/explore">Explore</a><a data-s="read" href="/#/hub/read">Read</a><a data-s="stuff" href="/#/hub/stuff">My stuff</a><a data-s="play" href="/#/hub/play">Play</a><a data-s="connie" href="/#/hub/connie">Connie</a><a data-s="community" href="/#/hub/community">About us</a><a data-s="search" href="/#/search">Search</a></nav></header>\n'
 +(o.crumbs?'<nav class="sp-crumb" aria-label="Breadcrumb">'+o.crumbs.map((c,i)=>i<o.crumbs.length-1?'<a href="'+c[1]+'">'+H(c[0])+"</a>":"<span>"+H(c[0])+"</span>").join(" &rsaquo; ")+"</nav>\n":"")
 +'<main id="main" tabindex="-1">\n'+o.body+"\n</main>\n"
 +'<footer class="sp-foot"><p><a href="/#/">Open the interactive museum</a> &middot; <a href="/history/">Timeline pages</a> &middot; <a href="/museum/">Exhibits</a> &middot; <a href="/guides/">Guides</a> &middot; <a href="/books/">Books</a> &middot; <a href="/features/">All pages</a> &middot; <a href="/#/disclosure">Affiliate disclosure</a> &middot; <a href="/feed.xml">RSS</a></p><p class="tn">'+NAME+' is a museum of vintage computers, a timeline and retro games, by Matt and Tony. Dates and descriptions are summarized from public sources; check the source named on each page.</p></footer>\n</div>\n<script src="/pages.js" defer></script><script src="/icons.js" defer></script><script src="/menu.js" defer></script>\n</body>\n</html>\n'}
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
const put=(p,c)=>{out[p]=c};let FEAT=[];

/* ---- Connie and the family on the static pages: pictures are shared SVG files in /cast/, so no page carries its own copy ---- */
const castName=id=>id==="connie"?"Connie Ventional":(CAST.CAST[id]&&CAST.CAST[id].n)||(CAST.FAMILY.filter(f=>f.id===id)[0]||{}).n||id;
function castImg(id,o,size,cls){o=o||{};const nm=id+(o.mood?"-"+o.mood:"")+(o.outfit?"-"+o.outfit:"")+(o.holds?"-h-"+o.holds:"")+(o.acc?"-a-"+o.acc:"")+(o.flip?"-flip":""),p="/cast/"+nm+".svg";
 if(!out[p])out[p]=CAST.svg(id,64,Object.assign({tall:1},o)).replace(/ class="cc[^"]*"/,"").replace(/ style="--cd:[^"]*"/,"")+"\n";
 return'<img class="'+cls+'" src="'+p+'" width="'+size+'" height="'+Math.round(size*1.3)+'" alt="'+H(castName(id))+'">'}
/* Connie, with an optional family member beside her, saying one line. A family member can come with a prop and a layout (see cast.js). */
function cameoC(c,text){return CAST.cameoHtml(c,text,(id,o,sz,cls)=>castImg(id,o,sz,cls),"/#/connie","sp-cameo")}
function cameo(fam,text,o){o=o||{};
 if(!fam)return'<aside class="cm-cameo sp-cameo cm-L-box noprint" aria-label="A cameo from Connie\u2019s family">'+castImg("connie",{mood:o.mood||"wink"},o.big||72,"cm-cs")+'<div class="cm-ct"><p><b>Connie:</b> \u201c'+H(text)+'\u201d</p>'+(o.btn===false?"":'<a class="btn" href="/#/connie">Meet the family</a>')+"</div></aside>";
 const x=Object.assign({},fam[3]||{});if(o.mood&&!x.mood)x.mood=o.mood;return cameoC([fam[0],fam[1]||{},text,x],text)}
const hashS=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const ageLine=y=>y<1981?(1981-y===1?"That was a year before I was born.":"That was "+(1981-y)+" years before I was born."):y===1981?"That is the year I was born.":"I turned "+(y-1981)+" that year.";
const fromCameo=(key)=>{const c=CAST.CAMEO[key];return{fam:[c[0],c[1],c[2],c[3]],text:c[2]}};
const strip=n=>String(n).replace(/ \((book|novel|Boss Fight Books)\)$/,"");
/* one family member and one line for a timeline entry, by what kind of thing it is */
const KPOOL={
 hw:[["ram",{outfit:"garage",holds:"book"},n=>"Dad, Raymond, has read the manual for "+n+". Twice. He found a typo.",{lay:"bubble"}],["conrad",{outfit:"lab",holds:"iron"},n=>"Uncle Conrad wants the jumper settings for "+n+". He always wants the jumper settings.",{lay:"screen"}],["winnie",{holds:"laptop"},n=>"Grandma Winnie asks whether "+n+" has room to spare. She asks that about everything.",{lay:"peek"}],["emma",{holds:"magnifier"},n=>"Emma 386 has opinions about the memory map of "+n+". Please say no before she starts.",{lay:"note"}],["hiram",{holds:"laptop"},n=>"Hiram says "+n+" sounds like a fine place to live, somewhere above the one-megabyte line.",{lay:"peek"}]],
 pe:[["sandy",{holds:"walkman"},n=>"Sandy Blaster wants to know whether "+n+" shares her IRQ. There will be a discussion.",{lay:"bubble"}],["viv",{holds:"camera"},n=>"Viv G. Adapter says "+n+" would look better in 256 colors.",{lay:"box"}],["dot",{holds:"clipboard"},n=>"Dot Matrix would like to print the manual for "+n+", slowly, in triplicate.",{lay:"sign"}],["mat",{holds:"mouse"},n=>"Mat the Mouse has already clicked on "+n+". He takes no responsibility.",{lay:"bubble"}],["conrad",{holds:"iron"},n=>"Uncle Conrad says "+n+" needs a driver. Then another driver. Then a reboot.",{lay:"screen"}]],
 sw:[["winnie",{holds:"laptop"},n=>"Grandma Winnie says "+n+" would fit on her hard drive with room to spare. She says that about everything.",{lay:"peek"}],["floyd",{holds:"floppy"},n=>"Grandpa Floyd Dysk says "+n+" came on 14 disks. He does not remember where disk 7 went.",{lay:"peek"}],["conrad",{holds:"iron"},n=>"Uncle Conrad has already edited CONFIG.SYS to make room for "+n+". It did not work. He is editing it again.",{lay:"screen"}],["augusta",{holds:"clipboard"},n=>"Auntie Autoexec added "+n+" to her morning list. It runs first. Everything else waits.",{lay:"note"}]],
 g:[["zack",{holds:"controller"},n=>"Zack Zip says he finished "+n+". He did not. He folds up when you ask about the ending.",{lay:"bubble"}],["sandy",{holds:"stick"},n=>"Sandy Blaster says the music in "+n+" sounds best on her card. Nobody asked.",{lay:"bubble"}],["viv",{holds:"controller"},n=>"Viv G. Adapter says "+n+" looks best in 256 colors. She will tell you again.",{lay:"box"}],["nibble",{holds:"pizza"},n=>"Nibble has been playing "+n+" on the family computer. His high score is one seed.",{lay:"box"}],["emma",{holds:"magnifier"},n=>"Emma 386 knows exactly how much memory "+n+" needs. Please do not ask her.",{lay:"note"}]],
 bk:[["winnie",{holds:"book"},n=>"Grandma Winnie has read "+n+" twice. She keeps it next to her 40 megabytes.",{lay:"peek"}],["floyd",{holds:"book"},n=>"Grandpa Floyd Dysk says he was there for all of it. He was a floppy, in a shirt pocket.",{lay:"peek"}],["rhoda",{holds:"book"},n=>"My mom, Rhoda, says "+n+" is read-only. You can borrow it, but you cannot edit it.",{lay:"sign"}],["zack",{holds:"book"},n=>"Zack Zip has read "+n+" in the bookstore without buying it. Nobody has caught him.",{lay:"bubble"}],["emma",{holds:"book"},n=>"Emma 386 has read "+n+" and wants to explain the footnotes. Please say no.",{lay:"note"}]],
 m:[["viv",{holds:"pizza"},n=>"Viv G. Adapter watched "+n+" in sixteen colors and still cried.",{lay:"box"}],["nibble",{holds:"pizza"},n=>"Nibble watched "+n+" six times for the seeds scene. There is no seeds scene.",{lay:"box"}],["dot",{holds:"clipboard"},n=>"Dot Matrix wants to print the credits for "+n+". All of them. In triplicate.",{lay:"sign"}],["sandy",{holds:"walkman"},n=>"Sandy Blaster says the soundtrack of "+n+" would sound better on her card.",{lay:"bubble"}]],
 x:[["augusta",{holds:"clipboard"},n=>"Auntie Autoexec wrote this one down at boot, in order.",{lay:"note"}],["rhoda",{holds:"book"},n=>"Mom, Rhoda, says it is in the record now, and the record is read-only.",{lay:"sign"}],["floyd",{holds:"floppy"},n=>"Grandpa Floyd Dysk remembers this. Mostly he remembers the disk swapping.",{lay:"peek"}],["mo",{holds:"phone"},n=>"Mo Dem heard about this at 2400 baud. It took a while.",{lay:"screen"}]]};
const poolOf=k=>/^g[tnc]$/.test(k)?KPOOL.g:KPOOL[k]||KPOOL.x;
function entryCameo(e,slugKey){const pool=poolOf(e.k),p=pool[hashS(slugKey)%pool.length];return cameo([p[0],p[1],0,p[3]],ageLine(e.y)+" "+p[2](strip(e.name)))}
const eraKeys=["timeline","era","day","about","changes"];
function eraCameo(slugKey,y){const c=fromCameo(eraKeys[hashS(slugKey)%eraKeys.length]);return cameo(c.fam,(y?ageLine(y)+" ":"")+c.text)}

/* ---- one page per timeline entry ---- */
sorted.forEach((e,idx)=>{const r=e.r,x=e.x,y=e.y,kind=KIND[e.k]||"Entry",sub=x.sub&&x.sub!==kind?x.sub:"";
 const path_="/history/"+e.slug+"/",dstr=dlabel(r[0]);
 let title=e.name+" ("+y+"): "+(sub||kind)+" | "+NAME;if(title.length>64)title=e.name+" ("+y+") | "+NAME;if(title.length>64)title=clip(e.name,58)+" ("+y+")";
 let desc=lead(e.tx.t||e.tx.d,155);if(desc.length<90&&e.tx.all.length>desc.length)desc=clip(e.tx.all,155);
 const facts=[["Date",dstr],["Kind",kind+(sub?": "+sub:"")]];if(x.maker&&x.maker!=="n/a")facts.push(["Maker or publisher",x.maker]);if(x.dev&&x.dev!==x.maker)facts.push(["Developer",x.dev]);if(x.plat&&x.plat.length)facts.push(["Platforms",x.plat.join(", ")]);
 Object.keys(x.specs||{}).slice(0,10).forEach(k=>facts.push([k,x.specs[k]]));
 const rel=(x.links||[]).map(l=>{const t=byName.get(l[0]);return t&&t.page&&t!==e?'<li><a href="'+link(t)+'">'+H(t.name)+"</a> ("+H(l[1])+", "+t.y+")</li>":""}).filter(Boolean).slice(0,8);
 const same=byYear.get(y).filter(z=>z.page&&z!==e),start=same.length?same.indexOf(same.filter(z=>pos.get(z)>idx)[0]):0,more=[];for(let i=0;i<Math.min(10,same.length);i++)more.push(same[((start<0?0:start)+i)%same.length]);
 const mk=x.maker&&x.maker!=="n/a"?sorted.filter(z=>z.page&&z!==e&&z.x&&z.x.maker===x.maker).sort((p,q)=>Math.abs(p.y-y)-Math.abs(q.y-y)).slice(0,6):[];
 const nmk=String(e.name).replace(/\s*\(.*\)\s*$/,"").toLowerCase(),bks=nmk.length>=4&&e.k!=="bk"?sorted.filter(z=>z.page&&z.k==="bk"&&z!==e&&String(z.name).toLowerCase().indexOf(nmk)>-1).slice(0,3):[];
 const prev=sorted[idx-1],next=sorted[idx+1];
 const src=String(r[5]||"");const srcHtml=/^https?:\/\//.test(src)?'Source: <a href="'+H(src)+'" rel="nofollow noopener" target="_blank">'+H(src.replace(/^https?:\/\/(www\.)?/,"").split("/")[0])+"</a>":src?"Source: "+H(src):"";
 const crumbs=[["Home","/"],["Timeline","/history/"],[String(y),"/year/"+y+"/"],[e.name,path_]];
 const body='<article class="sp-art"><p class="sp-kicker">'+H(dstr)+" &middot; "+H(kind)+"</p><h1>"+H(e.name)+" ("+y+")</h1>"
  +"<p class=\"sp-lead\">"+H(e.tx.t||e.tx.d)+"</p>"+(e.tx.t&&e.tx.d?"<p>"+H(e.tx.d)+"</p>":"")
  +'<p><a class="btn pri" href="/#/timeline/'+y+'">See '+y+" in the interactive timeline</a></p>"
  +'<h2>Facts</h2><dl class="sp-facts">'+facts.map(f=>"<div><dt>"+H(f[0])+"</dt><dd>"+H(f[1])+"</dd></div>").join("")+"</dl>"
  +(srcHtml?'<p class="tn">'+srcHtml+"</p>":"")
  +libSec(e.name)+aff(e.name,x.maker,e.name)+guideLine(e.k)+entryCameo(e,e.slug)
  +(rel.length?"<h2>Related</h2><ul>"+rel.join("")+"</ul>":"")
  +(mk.length?"<h2>More from "+H(x.maker)+"</h2><ul class=\"sp-cols\">"+mk.map(z=>'<li><a href="'+link(z)+'">'+H(z.name)+"</a> <small>"+z.y+"</small></li>").join("")+"</ul>":"")
  +(bks.length?"<h2>Books about it</h2><ul>"+bks.map(z=>'<li><a href="'+link(z)+'">'+H(z.name)+"</a> <small>"+z.y+"</small></li>").join("")+"</ul>":"")
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
  +eraCameo("y"+y,y)
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
  +eraCameo("d"+d,0)
  +'<nav class="sp-pn" aria-label="Other decades">'+decades.map(z=>z===d?"<span>"+H(dlabelD(z))+"</span>":'<a href="/decade/'+z+'/">'+H(dlabelD(z))+"</a>").join(" ")+"</nav></article>";
 put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Computing and games in "+short,description:desc,url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))});

/* ---- the timeline front door ---- */
{const path_="/history/",crumbs=[["Home","/"],["Timeline","/history/"]];
 const title="Computer and game history timeline, "+years[0]+" to today | "+NAME;
 const desc="A browsable history of computers, software, games, movies and events from "+years[0]+" to "+years[years.length-1]+": "+rows.length.toLocaleString("en-US")+" entries, by decade and year.";
 const body='<article class="sp-art"><h1>Computer, game and technology history</h1><p class="sp-lead">'+rows.length.toLocaleString("en-US")+" milestones from "+years[0]+" to "+years[years.length-1]+": the machines, the software, the games, the movies and the court cases. Start with a decade, or jump to a year.</p><p><a class=\"btn pri\" href=\"/#/timeline\">Open the interactive timeline</a></p>"
  +decades.map(d=>{const ys=years.filter(y=>decadeOf(y)===d);return'<h2><a href="/decade/'+d+'/">'+H(dlabelD(d))+"</a></h2><ul class=\"sp-years\">"+ys.map(y=>'<li><a href="/year/'+y+'/">'+y+"</a></li>").join("")+"</ul>"}).join("")
  +eraCameo("front",0)
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
   +(()=>{const te=it.tl?byName.get(it.tl):null,sc=z=>(z.maker&&z.maker===it.maker?3:0)+(z.year&&it.year&&Math.abs(z.year-it.year)<=2?2:0)+(z.cat===it.cat?1:0),lk=ITEMS.filter(z=>z!==it&&sc(z)>0).sort((p,q)=>sc(q)-sc(p)).slice(0,4);
    return (te&&te.page?'<h2>On the timeline</h2><p><a href="'+link(te)+'">'+H(te.name)+" ("+te.y+")</a> &middot; <a href=\"/year/"+te.y+'/">Everything from '+te.y+"</a></p>":"")+(lk.length?"<h2>More like this</h2><ul>"+lk.map(z=>'<li><a href="/museum/'+H(z.id)+'/">'+H(z.name)+"</a></li>").join("")+"</ul>":"")})()
   +aff(it.name,it.maker,it.id)+guideLine("item")+(()=>{const pl=CAST.CAMEO.item.pool,p=pl[hashS(it.id)%pl.length];return cameo([p[0],p[1],0,p[3]],p[2])})()+"</article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,ld:[{"@context":"https://schema.org","@type":"Article",headline:it.name,description:desc,about:{"@type":"Thing",name:it.name},image:abs("/og.png"),author:ORG,publisher:ORG,mainEntityOfPage:abs(path_),inLanguage:"en"},crumbLD(crumbs)]}))});
 const path_="/museum/",crumbs=[["Home","/"],["Exhibits","/museum/"]];
 put("/museum/index.html",shell({path:path_,title:"Vintage computer exhibits and specifications | "+NAME,desc:"The exhibits in the "+NAME+" collection, with specifications and history.",crumbs,og:"website",
  body:'<article class="sp-art"><h1>The exhibits</h1><p class="sp-lead">Machines from the museum floor, with specifications and history.</p><ul class="sp-cols">'+ITEMS.map(it=>'<li><a href="/museum/'+H(it.id)+'/">'+H(it.name)+"</a> <small>"+H(it.year||"")+"</small></li>").join("")+'</ul><p><a class="btn pri" href="/#/catalog">Browse the whole catalog</a></p>'+cameo(["ram",{outfit:"desk"}],"Dad, Raymond, catalogs everything. He has a form for it. The form has a form.")+'</article>',
  ld:[crumbLD(crumbs)]}))}

/* ---- buyer guides ---- */
{const L=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const lk=p=>{const ls=[],am=p.a&&affUrl("amazon",p.a),eb=p.e&&affUrl("ebay",p.e);if(am)ls.push(L(am,"Check Amazon"));if(eb)ls.push(L(eb,p.a?"Check eBay":"Find one on eBay"));return ls.length&&affOn()?'<p class="sp-plinks">'+ls.join(" &middot; ")+"</p>":""};
 const pick=p=>{if(p.tier)p=TIERS[p.tier];
  if(p.tiers)return'<div class="sp-pick sp-tiered"><h3>'+H(p.n)+'</h3><p class="sp-ptag">'+H(p.t)+"</p><p>"+H(p.w)+'</p><div class="sp-tiers">'+p.tiers.map(x=>'<div class="sp-tier"><p class="sp-tl">'+H(x.l)+"</p><h4>"+H(x.n)+"</h4><p>"+H(x.w)+"</p>"+lk(x)+"</div>").join("")+"</div></div>";
  return'<div class="sp-pick"><h3>'+H(p.n)+'</h3><p class="sp-ptag">'+H(p.t)+"</p><p>"+H(p.w)+"</p>"+(p.s?'<p class="sp-pskip"><b>Watch out:</b> '+H(p.s)+"</p>":"")+lk(p)+(p.g?'<p class="sp-plinks"><a href="/guides/'+p.g+'/">Read the repair guide</a></p>':"")+"</div>"};
 GUIDES.forEach(g=>{const path_="/guides/"+g.slug+"/",crumbs=[["Home","/"],["Guides","/guides/"],[g.h1,path_]];
  const tl=(g.links||[]).map(n=>{const e=byName.get(n);if(!e||!e.page){console.log("guide link skipped (no page):",n);return""}return'<li><a href="'+link(e)+'">'+H(e.name)+"</a> <small>"+e.y+"</small></li>"}).filter(Boolean);
  const others=GUIDES.filter(o=>o!==g).map(o=>'<li><a href="/guides/'+o.slug+'/">'+H(o.h1)+"</a></li>").concat(['<li><a href="/books/">The Bookshelf: books on computer and game history</a></li>']);
  const body='<article class="sp-art sp-guide"><p class="sp-kicker">Guide &middot; Updated '+H(dlabel(GUIDES_UPDATED))+"</p><h1>"+H(g.h1)+"</h1><p class=\"sp-lead\">"+H(g.lead)+"</p>"
   +cameo(null,g.quip,{big:84})
   +'<p class="sp-how"><b>How we pick.</b> A product makes the list only when reviewers and long-time collectors keep recommending it, it does one job well and it will still work in five years. No filler, no mystery brands, and no paid placements. Not every item has been through our own bench, so we go by reputation. Prices change, so check the listing.</p>'
   +'<p class="tn sp-disc">Some links on this page are affiliate links. If you buy through one, Conventional Memory earns a small commission at no cost to you. '+H(AFF_SHORT)+' <a href="/#/disclosure">Disclosure</a></p>'
   +(g.paths?"<h2>Pick your path</h2><ol>"+g.paths.map(p=>"<li><b>"+H(p[0])+".</b> "+H(p[1])+"</li>").join("")+"</ol>":"")
   +(g.safety?'<p class="sp-safe"><b>'+H(g.safety.split(":")[0])+".</b>"+H(g.safety.slice(g.safety.indexOf(":")+1))+"</p>":"")
   +(g.steps?"<h2>Step by step</h2><ol class=\"sp-steps\">"+g.steps.map(t=>"<li><b>"+H(t[0])+".</b> "+H(t[1])+"</li>").join("")+"</ol>":"")
   +g.sections.map(sec=>"<h2>"+H(sec.h)+"</h2><p>"+H(sec.intro)+"</p>"+sec.picks.map(pick).join("")).join("")
   +"<h2>Skip these</h2><ul>"+g.skip.map(t=>"<li>"+H(t)+"</li>").join("")+"</ul>"+cameo([g.fam[0],g.fam[1],0,g.fam[3]],g.fam[2],{mood:"happy"})
   +(tl.length?"<h2>From the timeline</h2><ul class=\"sp-cols\">"+tl.join("")+"</ul>":"")
   +"<h2>More guides</h2><ul>"+others.join("")+'</ul><p><a class="btn pri" href="/#/">Visit the museum</a></p></article>';
  put(path_+"index.html",shell({path:path_,title:g.title+" | "+NAME,desc:g.desc,crumbs,body,ld:[{"@context":"https://schema.org","@type":"Article",headline:g.h1,description:g.desc,datePublished:GUIDES_UPDATED,dateModified:GUIDES_UPDATED,image:abs("/og.png"),author:ORG,publisher:ORG,mainEntityOfPage:abs(path_),inLanguage:"en"},crumbLD(crumbs)]}))});
 const path_="/guides/",crumbs=[["Home","/"],["Guides","/guides/"]];
 put("/guides/index.html",shell({path:path_,title:"Retro computing guides: buy, fix and play | "+NAME,desc:"Practical guides for vintage computers: the gear worth buying, how to fix a dead machine and how to play old PC games today.",crumbs,og:"website",
  body:'<article class="sp-art"><h1>Guides</h1><p class="sp-lead">Practical, funny and honest. What to buy, how to fix it and how to play on it.</p><ul class="sp-guidelist">'+GUIDES.map(g=>'<li><a href="/guides/'+g.slug+'/">'+H(g.h1)+"</a><br><span>"+H(g.desc)+"</span></li>").join("")+'<li><a href="/books/">The Bookshelf</a><br><span>Books on computer and game history, from Sierra and Doom to consoles and virtual worlds.</span></li>'+'</ul><p class="tn">'+H(AFF_SHORT)+' <a href="/#/disclosure">Disclosure</a></p>'+cameo(["ram",{outfit:"desk"}],"Dad, Raymond, wrote these guides down so you do not have to read the manual first. He still thinks you should.")+'</article>',
  ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Retro computing guides",description:"Guides for buying, fixing and playing on vintage computers.",url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))}

/* ---- the bookshelf ---- */
{const path_="/books/",crumbs=[["Home","/"],["Books","/books/"]];
 const ink=c=>{const n=parseInt(c.slice(1),16),f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)},L=.2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255);return L>.4?"#000":"#fff"};
 const L=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const info=t=>{const e=byName.get(t);if(!e)throw new Error("book not in the timeline: "+t);const sp=(e.x&&e.x.specs)||{};return{t,e,name:strip(t),au:sp.Author||"",pub:(sp.Publisher||"").replace(/ \(original\).*/,""),pg:+sp.Pages||0,y:String(e.r[0]).slice(0,4),why:e.r[4]}};
 const urls=b=>{if(!affOn())return{};const fs=gearFinds(gearCtx(b.t,b.pub,b.t),b.t,b.pub),f=fs[0],g=fs[1];return f?{amz:affUrl("amazon",f[1]),ebay:affUrl("ebay",f[1]),aud:g?affUrl("amazon",g[1]):""}:{}};
 const bkCard=get("bkCard"),bkSpine=get("bkSpine"),bkIcon=get("bkIcon"),SHELF_OF={};BOOKSHELF.forEach(sh=>sh.books.forEach(t=>{SHELF_OF[t]=SHELF_OF[t]||sh.id}));
 const seen=new Set(),spines=[];BOOKSHELF.forEach(sh=>sh.books.forEach(t=>{if(seen.has(t))return;seen.add(t);const b=info(t);
  spines.push(bkSpine({shelf:SHELF_OF[t],name:b.name,au:b.au,y:b.y,href:"#bk-"+hashS(t),h:130+Math.round(Math.min(b.pg||320,800)/800*130),w:46+(hashS(t)%3)*6}))}));
 const card=t=>{const b=info(t),u=urls(b);return bkCard({id:hashS(t),shelf:SHELF_OF[t],name:b.name,au:b.au,y:b.y,pub:b.pub,pg:b.pg,why:b.why,href:b.e.page?link(b.e):"",amz:u.amz,ebay:u.ebay,aud:u.aud})};
 const total=seen.size;
 const body='<article class="sp-art sp-books"><p class="sp-kicker">The Bookshelf</p><h1>Books on computer and game history</h1><p class="sp-lead">'+total+' books on computer history, game history and how it all gets made, from Sierra and Doom to consoles, virtual worlds and one very violent cat. Each spine is a book, and taller means more pages.</p>'
  +cameo(get("LISTEN"),get("LISTEN")[2])
  +cameo(null,"Welcome to the library. Everything here is also a timeline entry, so you can read about the book and then about the thing it is about. No shushing.",{mood:"happy",big:84})
  +'<p class="tn sp-disc">Some links on this page are affiliate links. If you buy through one, Conventional Memory earns a small commission at no cost to you. '+H(AFF_SHORT)+' <a href="/#/disclosure">Disclosure</a></p>'
  +'<div class="shelfw bks-shelfw"><div class="bks-shelf">'+spines.join("")+"</div></div>"
  +BOOKSHELF.map(sh=>'<h2 class="bks-h k-'+H(sh.id)+'" id="sh-'+H(sh.id)+'">'+bkIcon(sh.id,28)+H(sh.h)+"</h2><p>"+H(sh.intro)+"</p>"+cameo([sh.reader[0],sh.reader[1],0,sh.reader[3]],sh.reader[2],{mood:"happy",btn:false})+'<div class="bkgrid">'+sh.books.map(card).join("")+"</div>").join("")
  +cameo(["winnie",{}],"Grandma Winnie says the best book is the next one. She has forty megabytes of room for it.",{mood:"wink"})
  +'<h2>More</h2><ul><li><a href="/guides/">Guides: what to buy, how to fix it and how to play on it</a></li><li><a href="/history/">The timeline, with every book on it</a></li><li><a href="/#/books">The interactive Bookshelf</a></li></ul></article>';
 put("/books/index.html",shell({path:path_,title:"Books on computer and game history | "+NAME,desc:"A bookshelf of the best books on computer history, game history and game development, from Sierra and Doom to consoles and virtual worlds.",crumbs,og:"website",body,
  ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Books on computer and game history",description:"Books on computer history, game history and game development.",url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")},mainEntity:{"@type":"ItemList",itemListElement:[...seen].map((t,i)=>{const b=info(t);return{"@type":"ListItem",position:i+1,item:{"@type":"Book",name:b.name,author:{"@type":"Person",name:b.au},datePublished:b.y}}})}},crumbLD(crumbs)]}))}

/* ---- 404, robots, sitemap ---- */
put("/404.html",shell({path:"/404.html",title:"Page not found | "+NAME,desc:"That page is not in the museum. Try the timeline or the catalog.",noindex:1,og:"website",
 body:'<article class="sp-art"><h1>Page not found</h1><p class="sp-lead">That page is not in the museum, or it moved.</p><p><a class="btn pri" href="/#/">Go to the museum</a> <a class="btn" href="/history/">Browse the timeline</a> <a class="btn" href="/#/search">Search</a></p>'+(()=>{const c=fromCameo("nf");return cameo(c.fam,c.text,{mood:"wow",big:84})})()+'</article>'}));

/* ---- /features/: the whole site, by section, as plain pages (built from pages.js, so new pages appear here by themselves) ---- */
{const pc={window:{},console};vm.createContext(pc);vm.runInContext(fs.readFileSync(path.join(root,"pages.js"),"utf8"),pc,{filename:"pages.js"});
 const SG=vm.runInContext("SITE",pc),XT=vm.runInContext("PAGE_EXTRA",pc);
 const hrefOf=h=>/^#\//.test(h)?"/"+h:h;                       /* app pages open in the museum; /guides/ and friends are plain pages */
 const li=x=>'<li><a href="'+H(hrefOf(x[0]))+'"><b>'+H(x[1])+"</b></a> &mdash; "+H(x[2])+"</li>";
 const groupsOf=g=>{const o=[];let cur=null;g.i.forEach(x=>{if(x[0]==="--"){cur={h:x[1],a:[]};o.push(cur)}else{if(!cur){cur={h:"",a:[]};o.push(cur)}cur.a.push(x)}});return o};
 const total=SG.reduce((n,g)=>n+g.i.filter(x=>x[0]!=="--").length,0);
 SG.forEach(g=>{const path_="/features/"+g.id+"/",crumbs=[["Home","/"],["All pages","/features/"],[g.t,path_]],n=g.i.filter(x=>x[0]!=="--").length;
  const title=g.t+": pages and features | "+NAME,desc=clip(g.d+" "+n+" pages and features in the "+NAME+" museum: "+g.i.filter(x=>x[0]!=="--").slice(0,4).map(x=>x[1]).join(", ")+" and more.",158);
  const body='<article class="sp-art"><p class="sp-kicker">'+H(NAME)+'</p><h1>'+H(g.t)+'</h1><p class="sp-lead">'+H(g.d)+"</p>"
   +'<p><a class="btn pri" href="/#/hub/'+H(g.id)+'">Open '+H(g.t)+" in the interactive museum</a></p>"
   +groupsOf(g).map(gr=>(gr.h?"<h2>"+H(gr.h)+"</h2>":"")+"<ul>"+gr.a.map(li).join("")+"</ul>").join("")
   +'<h2>Other sections</h2><ul class="sp-cols">'+SG.filter(o=>o!==g).map(o=>'<li><a href="/features/'+o.id+'/">'+H(o.t)+"</a></li>").join("")+'<li><a href="/features/">All pages</a></li></ul>'
   +eraCameo("features-"+g.id,0)+"</article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:g.t,description:desc,url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))});
 {const path_="/features/",crumbs=[["Home","/"],["All pages",path_]],title="All pages and features: the site map | "+NAME,
  desc="Every page and feature in the "+NAME+" museum, by section: "+SG.map(g=>g.t).join(", ")+". "+total+" pages, from the catalog and timeline to games, Connie and the kiosk.";
  const body='<article class="sp-art"><p class="sp-kicker">Site map</p><h1>All pages and features</h1><p class="sp-lead">'+total+" pages and features in "+SG.length+" sections. The <b>catalog</b> lists every item in the collection, an <b>exhibit</b> is one item&rsquo;s page, and the <b>timeline</b> is the history of everything, including things the museum does not own.</p>"
   +'<p><a class="btn pri" href="/#/more">Open the finder in the museum</a></p>'
   +"<h2>The collection</h2><ul>"+XT.filter(x=>x[0].indexOf("?")<0).map(li).join("")+'<li><a href="/museum/"><b>Exhibit pages</b></a> &mdash; every item as its own web page.</li><li><a href="/history/"><b>Timeline pages</b></a> &mdash; every timeline entry as its own page.</li></ul>'
   +SG.map(g=>'<h2><a href="/features/'+H(g.id)+'/">'+H(g.t)+"</a></h2><p>"+H(g.d)+"</p><ul>"+g.i.filter(x=>x[0]!=="--").map(li).join("")+"</ul>").join("")
   +eraCameo("features-index",0)+"</article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"All pages and features",description:desc,url:abs(path_),isPartOf:{"@type":"WebSite",name:NAME,url:abs("/")}},crumbLD(crumbs)]}))}
 FEAT=["/features/"].concat(SG.map(g=>"/features/"+g.id+"/"))}

/* ---- /recap/: the Recap Bench as plain pages (built from recap-data.js; the interactive checklist lives in the museum) ---- */
const RECAP_URLS=[];
{const rc={window:{},console};vm.createContext(rc);vm.runInContext(fs.readFileSync(path.join(root,"recap-data.js"),"utf8"),rc,{filename:"recap-data.js"});
 const RC=vm.runInContext("RECAP",rc),RG=vm.runInContext("RECAP_GENERIC",rc),fmt=n=>String(+n),UF="µF";
 const KITS=(()=>{const kc={};vm.createContext(kc);vm.runInContext(fs.readFileSync(path.join(root,"kits-data.js"),"utf8")+";this.K=KITS",kc,{filename:"kits-data.js"});return kc.K||{}})();
 const kitLi=m=>(KITS[m.id]||[]).filter(k=>/^[a-z0-9-]{3,160}$/.test(k[1])).map(k=>'<li><a href="https://console5.com/store/'+k[1]+'.html" target="_blank" rel="noopener noreferrer"><b>'+H(k[0])+"</b></a></li>").join("");
 const L=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const two=q=>[L(affUrl("amazon",q),"Amazon"),L(affUrl("ebay",q),"eBay")].filter(Boolean).join(" &middot; ");
 const tyW=t=>t==="smd"?"surface mount":t==="ax"?"axial":t==="th"?"through-hole":"check your board";
 const qOf=(uf,v,t)=>["Panasonic",fmt(uf)+"uF",fmt(v)+"V",t==="smd"?"SMD":t==="ax"?"axial":t==="th"?"radial":"","electrolytic capacitor"].filter(Boolean).join(" ");
 const rows=m=>{const o=[];m.boards.forEach(b=>b.rows.forEach(r=>o.push(Object.assign({b:b.n},r))));return o};
 const guideLi=g=>'<li><a href="'+H(g.u)+'" target="_blank" rel="noopener noreferrer"><b>'+H(g.t)+"</b></a> ("+H(g.kind)+") by "+H(g.by)+(g.lic?", "+H(g.lic):"")+". "+H(g.note||"")+"</li>";
 const howTo=()=>"<h2>Step by step</h2><ol>"+RG.steps.map(x=>"<li><b>"+H(x.t)+"</b> "+H(x.tip)+"</li>").join("")+"</ol>"
   +"<h2>Tools</h2><ul>"+RG.tools.map(t=>"<li><b>"+H(t.n)+"</b>. "+H(t.why)+(affOn()?" "+t.t.map(x=>L(affUrl("amazon",x[2])||affUrl("ebay",x[2]),H((x[0]?x[0]+": ":"")+x[1]))).join(" &middot; "):"")+"</li>").join("")+"</ul>"
   +"<h2>Safety</h2><ul>"+RG.safety.map(x=>"<li>"+H(x.t)+"</li>").join("")+"</ul>";
 const hintsLi=m=>m.hints&&m.hints.length?"<h2>Where to start</h2><p>Clues from write-ups and forum threads, not a diagnosis. Low confidence means one thread or one repair; high means several write-ups agree.</p><ul>"+m.hints.map(x=>"<li><b>"+H(x.sym)+"</b> ("+H(x.conf)+" confidence). "+H(x.say)+' <a href="'+H(x.src)+'" target="_blank" rel="noopener noreferrer">Source</a></li>').join("")+"</ul>":"<h2>Where to start</h2><p>We did not find a clear list of what fails first on this machine, so we are not guessing. Read the guides below, check the board for leaks, and replace what you can see.</p>";
 const KL={tip:"Tip",anecdote:"Story",maybe:"Maybe",warning:"Watch out"};
 const revsLi=m=>m.revs&&m.revs.length?"<h2>Which board do I have?</h2><p>Boards changed during production. These notes come from the linked sources, and many are only partly documented, so check the board in front of you.</p><ul>"+m.revs.map(r=>"<li><b>"+H(r.n)+"</b> ("+H(r.f)+" confidence). How to tell: "+H(r.i)+" Capacitors: "+H(r.c)+" Capacitor list differs from other revisions: "+(r.d===true?"yes":r.d===false?"no":"not known")+'. <a href="'+H(r.s)+'" target="_blank" rel="noopener noreferrer">Source</a></li>').join("")+"</ul>":"";
 const tipsLiS=m=>m.tips&&m.tips.length?"<h2>Tips, tales and maybes</h2><p>Found in write-ups and forum threads. These are other people's reports, not tested by us. Check part references and values against your own board.</p><ul>"+m.tips.map(t=>"<li><b>"+H(KL[t.k]||"Tip")+": "+H(t.sym)+"</b> ("+H(t.conf)+" confidence). "+H(t.t)+(t.src?' <a href="'+H(t.src)+'" target="_blank" rel="noopener noreferrer">Source</a>':"")+"</li>").join("")+"</ul>":"";
 const WTH={yes:"Worth a recap. Reports say it is a common and useful fix on this machine.",maybe:"Check first. A recap is not always the answer here, so look at the guides before you order parts."};
 const disc='<p class="tn">'+H(AFF_SHORT)+' These links only search by name. <a href="/#/disclosure">Disclosure</a></p>';
 RC.forEach(m=>{const path_="/recap/"+m.id+"/",crumbs=[["Home","/"],["Recap guides","/recap/"],[m.n,path_]],rs=rows(m),total=rs.reduce((n,r)=>n+(r.n||1),0);
  const grp={};rs.forEach(r=>{const k=r.uf+"|"+r.v+"|"+(r.ty||"");grp[k]=grp[k]||{uf:r.uf,v:r.v,ty:r.ty||"",n:0};grp[k].n+=(r.n||1)});
  const parts=Object.keys(grp).map(k=>grp[k]).sort((a,b)=>b.n-a.n||a.uf-b.uf);
  const title=(t=>t.length>80?"Recap the "+m.n+" | "+NAME:t)("Recap the "+m.n+": capacitor list and checklist | "+NAME),
   desc=clip("Replacing the old capacitors in a "+m.n+(m.yr?" ("+m.yr+")":"")+". "+(total?total+" capacitors listed with values, a shopping list, ":"Guides, ")+"steps, tools and safety, plus a checklist that saves.",158);
  const body='<article class="sp-art"><p class="sp-kicker">Recap guide</p><h1>Recap the '+H(m.n)+'</h1><p class="sp-lead">'+H(m.blurb)+"</p>"
   +'<p><a class="btn pri" href="/#/recap/'+H(m.id)+'">Open the interactive checklist</a> <small>Tick off each capacitor as you replace it. It saves in your browser.</small></p>'
   +'<p class="tn">'+(m.worth?H(WTH[m.worth]):"Difficulty: "+H(m.lvl))+"</p>"
   +cameo(m.cam,m.cam[2])
   +revsLi(m)+hintsLi(m)+tipsLiS(m)+'<h2>Before you start</h2><ul>'+m.warn.map(w=>"<li>"+H(w)+"</li>").join("")+"</ul>"
   +libSecIds([m.id])
   +(m.guides.length?"<h2>Guides we used</h2><p>This page and the interactive bench are built from these. They have the photos and the full detail, so please read them and support their authors.</p><ul>"+m.guides.map(guideLi).join("")+"</ul>"+m.guides.filter(g=>g.credit).map(g=>'<p class="tn">'+H(g.credit)+"</p>").join(""):"")
   +(m.boards.length?m.boards.map(b=>"<h2>"+H(b.n)+"</h2><p>"+H(b.tip||"")+"</p>"+'<table class="rc-t"><thead><tr><th scope="col">Part</th><th scope="col">Value</th><th scope="col">Volts</th><th scope="col">Type</th></tr></thead><tbody>'+b.rows.map(r=>"<tr><th scope=\"row\">"+H(r.ref||(fmt(r.uf)+" "+UF+" x "+(r.n||1)))+(r.note?"<small> "+H(r.note)+"</small>":"")+"</th><td>"+fmt(r.uf)+" "+UF+"</td><td>"+fmt(r.v)+" V</td><td>"+H(tyW(r.ty))+"</td></tr>").join("")+"</tbody></table>").join("")
    :"<h2>The capacitor list</h2><p>We have not checked a capacitor list for this machine yet, so none is shown. Follow the guide above for your board, then add the capacitors in the interactive checklist and it builds a shopping list for you.</p>")
   +(parts.length?"<h2>Shopping list</h2><p>"+total+" capacitors in all, grouped by value. Buy a few spares.</p><ul>"+parts.map(p=>"<li><b>"+p.n+" x "+fmt(p.uf)+" "+UF+", "+fmt(p.v)+" V</b> ("+H(tyW(p.ty))+")"+(affOn()?": "+two(qOf(p.uf,p.v,p.ty)):"")+"</li>").join("")+"</ul>":"")
   +(kitLi(m)?"<h2>Console5 capacitor kits for this machine</h2><p>Console5 sells ready-made capacitor kits. Kits come in different versions, so match the board number in the kit name to yours and check the listing before you buy.</p><ul>"+kitLi(m)+"</ul>":"")
   +(affOn()?"<h2>Skip the sourcing</h2><ul><li>Ready-made kit: "+two(m.kit)+"</li><li>Already recapped: "+two(m.n+" recapped")+"</li></ul><h2>While you are in there</h2><ul>"+m.extras.map(x=>"<li>"+H(x[2])+": "+two(x[1])+"</li>").join("")+"</ul>"+disc:"")
   +(m.boards.length?howTo():'<h2>Steps, tools and safety</h2><p>The steps, the tools in top, middle and budget picks, and the safety list are the same for every machine, so they live on one page: <a href="/recap/how-to/">How to recap, step by step</a>.</p>')
   +'<p class="tn">Values are shown as published in the guides above, and boards changed during production. Check the board in front of you. A recap involves hot tools and, on some machines, dangerous voltages. You do it at your own risk.</p>'
   +'<h2>More</h2><ul><li><a href="/recap/">All recap guides</a></li><li><a href="/#/recap">The interactive Recap Bench</a></li><li><a href="/guides/fix-a-dead-vintage-computer/">Fix a dead vintage computer</a></li>'+m.tl.filter(n=>TL.some(r=>r[2]===n)).map(n=>{const e=sorted.filter(z=>z.name===n)[0];return e?'<li><a href="/history/'+e.slug+'/">'+H(n)+" on the timeline</a></li>":""}).join("")+"</ul></article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"article",ld:(m.boards.length?[{"@context":"https://schema.org","@type":"HowTo",name:"Recap the "+m.n,description:desc,step:RG.steps.map((x,i)=>({"@type":"HowToStep",position:i+1,name:x.t,text:x.tip})),url:abs(path_)}]:[]).concat([crumbLD(crumbs)])}));RECAP_URLS.push(path_)});
 {const path_="/recap/how-to/",crumbs=[["Home","/"],["Recap guides","/recap/"],["How to recap",path_]],title="How to recap a vintage computer or console, step by step | "+NAME,
   desc=clip("The steps, tools and safety list for replacing old electrolytic capacitors in vintage computers and consoles, in order, with top, middle and budget tool picks.",158);
  const body='<article class="sp-art"><p class="sp-kicker">Recap guide</p><h1>How to recap, step by step</h1><p class="sp-lead">The same steps work for every machine. Find your machine for its capacitor list and guides, then come back here for the order of work, the tools and the safety rules.</p>'+cameo(null,"Photograph the board first. Mark the polarity. Smallest part first.")+howTo()+(affOn()?disc:"")+'<p class="tn">A recap involves hot tools and, on some machines, dangerous voltages. You do it at your own risk.</p><h2>More</h2><ul><li><a href="/recap/">All recap guides</a></li><li><a href="/#/recap">The interactive Recap Bench</a></li></ul></article>';
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"article",ld:[{"@context":"https://schema.org","@type":"HowTo",name:"How to recap a vintage computer or console",description:desc,step:RG.steps.map((x,i)=>({"@type":"HowToStep",position:i+1,name:x.t,text:x.tip})),url:abs(path_)},crumbLD(crumbs)]}));RECAP_URLS.push(path_)}
 {const path_="/recap/",crumbs=[["Home","/"],["Recap guides",path_]],title="Recap guides: old capacitors in vintage gear | "+NAME,
   desc=clip("Capacitor recap guides for "+RC.map(m=>m.n).slice(0,5).join(", ")+" and more: values, shopping lists, steps, tools and a checklist that saves.",158);
  const body='<article class="sp-art"><p class="sp-kicker">Recap Bench</p><h1>Recap guides</h1><p class="sp-lead">Old electrolytic capacitors dry out and leak, and the leak eats the board. A recap replaces them before that happens. Pick a machine for its capacitor list, a shopping list, the steps and a checklist that saves.</p>'
   +'<p><a class="btn pri" href="/#/recap">Open the interactive Recap Bench</a></p>'+["Consoles and handhelds","Computers","Audio and other gear"].map(c=>"<h2>"+H(c)+"</h2><ul>"+RC.filter(m=>m.cat===c).map(m=>'<li><a href="/recap/'+H(m.id)+'/"><b>'+H(m.n)+"</b></a>"+(m.yr?" ("+m.yr+")":"")+". "+H(m.blurb)+"</li>").join("")+"</ul>").join("")+'<p><a href="/recap/how-to/">How to recap, step by step</a></p>'+cameo(null,"Look for the leak, mark the polarity, and take your time.")+"</article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Recap guides",description:desc,url:abs(path_)},crumbLD(crumbs)]}));RECAP_URLS.unshift(path_)}}

/* ---- /repairs/: the Repair Bench as plain pages (built from repairs-data.js; the interactive checklist lives in the museum) ---- */
const REPAIR_URLS=[];
{const rc={window:{}};vm.createContext(rc);vm.runInContext(fs.readFileSync(path.join(root,"repairs-data.js"),"utf8"),rc,{filename:"repairs-data.js"});
 const RP=vm.runInContext("REPAIRS",rc);
 const rc2={window:{}};vm.createContext(rc2);vm.runInContext(fs.readFileSync(path.join(root,"recap-data.js"),"utf8"),rc2,{filename:"recap-data.js"});const RC=vm.runInContext("RECAP",rc2);
 const L2=(u,t)=>u?'<a href="'+H(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+"</a>":"";
 const two2=q=>[L2(affUrl("amazon",q),"Amazon"),L2(affUrl("ebay",q),"eBay")].filter(Boolean).join(" &middot; ");
 const KL2={tip:"Tip",anecdote:"Story",maybe:"Maybe",warning:"Watch out"};
 const WT2={yes:"Worth doing. Reports say this fix helps on many machines.",maybe:"Try it, but check first. This will not fix every machine, so read the sources first."};
 const disc2='<p class="tn">'+H(AFF_SHORT)+' These links only search by name. <a href="/#/disclosure">Disclosure</a></p>';
 RP.forEach(g=>{const path_="/repairs/"+g.id+"/",crumbs=[["Home","/"],["Repair guides","/repairs/"],[g.title,path_]];
  const title=(g.title.length+3+NAME.length<=82?g.title:clip(g.title,82-NAME.length-3))+" | "+NAME,desc=clip(g.blurb+" Steps, parts, tools, cautions and a checklist that saves.",158);
  const tlN=g.machines.map(n=>{const e=sorted.filter(z=>z.name===n)[0];return e?'<li><a href="/history/'+e.slug+'/">'+H(n)+" on the timeline</a></li>":""}).join("");
  const rcl=RC.filter(m=>m.tl.some(n=>g.machines.indexOf(n)>=0)).slice(0,6).map(m=>'<li><a href="/recap/'+H(m.id)+'/">Recap the '+H(m.n)+" (capacitor checklist)</a></li>").join("");
  const body='<article class="sp-art"><p class="sp-kicker">Repair guide</p><h1>'+H(g.title)+'</h1><p class="sp-lead">'+H(g.blurb)+"</p>"
   +'<p><a class="btn pri" href="/#/repairs/'+H(g.id)+'">Open the interactive checklist</a> <small>Tick off each step as you go. It saves in your browser.</small></p>'
   +'<p class="tn">'+H(g.kind)+" &middot; "+H(g.level)+" &middot; about "+g.minutes+" minutes. "+H(WT2[g.worth]||"")+"</p>"
   +"<p><b>You are in the right place if:</b> "+H(g.symptom)+"</p>"
   +(g.cautions.length?"<h2>Before you start</h2><ul>"+g.cautions.map(c=>"<li>"+H(c)+"</li>").join("")+"</ul>":"")
   +(g.revisions?"<h2>Board revisions and models</h2><p>"+H(g.revisions)+"</p>":"")
   +(g.parts.length?"<h2>Parts you may need</h2><ul>"+g.parts.map(p=>"<li><b>"+H(p.n)+"</b>. "+H(p.why||"")+(affOn()&&p.q?" "+two2(p.q):"")+"</li>").join("")+"</ul>":"")
   +(g.tools.length?"<h2>Tools</h2><ul>"+g.tools.map(p=>"<li><b>"+H(p.n)+"</b>. "+H(p.why||"")+(affOn()&&p.q?" "+two2(p.q):"")+"</li>").join("")+"</ul>":"")
   +(affOn()&&(g.parts.length||g.tools.length)?disc2:"")
   +"<h2>Step by step</h2><ol>"+g.steps.map(x=>"<li><b>"+H(x.t)+"</b> "+H(x.d)+"</li>").join("")+"</ol>"
   +(g.tips.length?"<h2>Tips, tales and maybes</h2><p>Found in write-ups and forum threads. These are other people's reports, not tested by us.</p><ul>"+g.tips.map(t=>"<li><b>"+H(KL2[t.k]||"Tip")+"</b> ("+H(t.conf)+" confidence). "+H(t.t)+(t.src?' <a href="'+H(t.src)+'" target="_blank" rel="noopener noreferrer">Source</a>':" General technique, no source.")+"</li>").join("")+"</ul>":"")
   +libSecIds([...new Set(g.machines.flatMap(n=>LIBMAP[n]||[]))])
   +(g.sources.length?"<h2>Guides we used</h2><p>We wrote the steps in our own words from these. They have the photos and the full detail, so please read them and support their authors.</p><ul>"+g.sources.map(s=>'<li><a href="'+H(s.u)+'" target="_blank" rel="noopener noreferrer"><b>'+H(s.t)+"</b></a> ("+H(s.kind)+") by "+H(s.by)+". "+H(s.note)+"</li>").join("")+"</ul>":"<h2>Sources</h2><p>We wrote this one from general technique and have no source to credit for it yet. Treat it as a starting point, and read or watch a guide for your exact model before you begin.</p>")
   +'<p class="tn">Boards and models vary, so check what is in front of you. A repair can involve hot tools, chemicals and, on some machines, dangerous voltages. You do it at your own risk.</p>'
   +'<h2>More</h2><ul><li><a href="/repairs/">All repair guides</a></li><li><a href="/#/repairs">The interactive Repair Bench</a></li>'+rcl+tlN+"</ul></article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"article",ld:[{"@context":"https://schema.org","@type":"HowTo",name:g.title,description:desc,step:g.steps.map((x,i)=>({"@type":"HowToStep",position:i+1,name:x.t,text:x.d})),url:abs(path_)},crumbLD(crumbs)]}));REPAIR_URLS.push(path_)});
 {const path_="/repairs/",crumbs=[["Home","/"],["Repair guides",path_]],title="Repair guides for vintage computers and consoles | "+NAME,
   desc=clip("Step-by-step repair guides for old computers and consoles: clock batteries, belts, lasers, cartridge slots, drives, keyboards and more, with parts, tools and a checklist that saves.",158);
  const kinds=[...new Set(RP.map(g=>g.kind))];
  const body='<article class="sp-art"><p class="sp-kicker">Repair Bench</p><h1>Repair guides</h1><p class="sp-lead">Not every old machine needs new capacitors. Some need a fresh battery, a new belt, a clean cartridge slot or a laser that has been adjusted. Pick a repair for the steps, parts, tools and cautions, plus a checklist that saves.</p>'
   +'<p><a class="btn pri" href="/#/repairs">Open the interactive Repair Bench</a> <a class="btn" href="/recap/">Capacitor recap guides</a></p>'
   +["Computers and gear","Consoles and handhelds"].map(c=>"<h2>"+H(c)+"</h2>"+kinds.map(k=>{const gs=RP.filter(g=>g.cat===c&&g.kind===k);return gs.length?"<h3>"+H(k)+"</h3><ul>"+gs.map(g=>'<li><a href="/repairs/'+H(g.id)+'/"><b>'+H(g.title)+"</b></a> ("+H(g.level)+", about "+g.minutes+" minutes). "+H(g.blurb)+"</li>").join("")+"</ul>":""}).join("")).join("")
   +cameo(null,"Read the cautions first, then take your time.")+"</article>";
  put(path_+"index.html",shell({path:path_,title,desc,crumbs,body,og:"website",ld:[{"@context":"https://schema.org","@type":"CollectionPage",name:"Repair guides",description:desc,url:abs(path_)},crumbLD(crumbs)]}));REPAIR_URLS.unshift(path_)}}
put("/robots.txt","User-agent: *\nAllow: /\n\nSitemap: "+abs("/sitemap.xml")+"\n");
{const urls=["/","/history/","/museum/","/guides/","/books/"].concat(FEAT,RECAP_URLS,REPAIR_URLS,GUIDES.map(g=>"/guides/"+g.slug+"/"),[]).concat(decades.map(d=>"/decade/"+d+"/"),years.map(y=>"/year/"+y+"/"),ITEMS.map(i=>"/museum/"+i.id+"/"),sorted.map(e=>"/history/"+e.slug+"/"));
 put("/sitemap.xml",'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>"<url><loc>"+H(abs(u))+"</loc>"+(u==="/"?"<changefreq>weekly</changefreq><priority>1.0</priority>":/^\/(guides|books|recap|repairs)\//.test(u)?"<priority>0.8</priority>":/^\/(history|museum|decade|features)\/$|^\/decade\/|^\/features\//.test(u)?"<priority>0.7</priority>":"")+"</url>").join("\n")+"\n</urlset>\n")}

/* ---- write or check ---- */
const GEN=["history","year","decade","museum","guides","books","cast","features","recap","repairs"],FILES=["sitemap.xml","robots.txt","404.html"];
function walk(d){const o=[];if(!fs.existsSync(d))return o;fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const p=path.join(d,e.name);if(e.isDirectory())o.push(...walk(p));else o.push(p)});return o}
if(CHECK){const want=Object.keys(out),have=new Set([].concat(...GEN.map(g=>walk(path.join(root,g))),FILES.map(f=>path.join(root,f)).filter(f=>fs.existsSync(f))).map(f=>"/"+path.relative(root,f).split(path.sep).join("/")));
 const miss=want.filter(p=>!have.has(p)),extra=[...have].filter(p=>!out[p]),diff=want.filter(p=>have.has(p)&&fs.readFileSync(path.join(root,p),"utf8")!==out[p]);
 if(miss.length||extra.length||diff.length){console.log("SEO pages are out of date:",miss.length,"missing,",extra.length,"extra,",diff.length,"changed. Run: node tools/build-seo.js");process.exit(1)}
 console.log("SEO pages are current:",want.length,"files");process.exit(0)}
GEN.forEach(g=>fs.rmSync(path.join(root,g),{recursive:true,force:true}));
Object.keys(out).forEach(p=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,out[p])});
console.log("entry pages:",sorted.length,"of",rows.length,"| year hubs:",years.length,"| decade hubs:",decades.length,"| exhibits:",ITEMS.length,"| files:",Object.keys(out).length,"| site:",SITE);
