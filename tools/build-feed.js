// Builds feed.xml (RSS 2.0) from items.js: every changelog entry of every published item, newest first.
// Run: node tools/build-feed.js   (the feed workflow runs it whenever items.js changes)
const fs=require("fs"),path=require("path"),root=path.join(__dirname,"..");
let BASE="https://conventionalmemory.github.io/";try{const c=require("fs").readFileSync(require("path").join(__dirname,"..","CNAME"),"utf8").trim();if(c)BASE="https://"+c+"/"}catch(e){}
const s=fs.readFileSync(path.join(root,"items.js"),"utf8"),m=s.lastIndexOf("var ITEMS=");
const items=JSON.parse(s.slice(m+10,s.lastIndexOf(";"))).filter(i=>!i.draft);
const x=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
let rows=[];items.forEach(it=>(it.log||[]).forEach(l=>{if(/^\d{4}-\d\d-\d\d$/.test(l.d||""))rows.push({it,l})}));
rows.sort((a,b)=>a.l.d<b.l.d?1:a.l.d>b.l.d?-1:0);rows=rows.slice(0,40);
const last=rows.length?new Date(rows[0].l.d+"T12:00:00Z"):new Date();
const out=['<?xml version="1.0" encoding="UTF-8"?>','<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
 "<title>Conventional Memory: recent changes</title>","<link>"+BASE+"#/changes</link>",
 "<description>New items, repairs, upgrades and notes from the Conventional Memory museum.</description>","<language>en-us</language>",
 "<lastBuildDate>"+last.toUTCString()+"</lastBuildDate>",'<atom:link href="'+BASE+'feed.xml" rel="self" type="application/rss+xml"/>'];
rows.forEach(r=>{const link=BASE+"#/item/"+r.it.id;out.push("<item><title>"+x(r.it.name+": "+(r.l.t||"Note"))+"</title><link>"+x(link)+"</link><guid isPermaLink=\"false\">"+x(r.it.id+"|"+r.l.d+"|"+(r.l.t||"")+"|"+(r.l.n||"").slice(0,40))+"</guid><pubDate>"+new Date(r.l.d+"T12:00:00Z").toUTCString()+"</pubDate><description>"+x(r.l.n||"")+"</description></item>")});
out.push("</channel></rss>");fs.writeFileSync(path.join(root,"feed.xml"),out.join("\n")+"\n");console.log("feed.xml:",rows.length,"entries");
