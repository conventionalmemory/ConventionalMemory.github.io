/* Tells Bing, Yandex and other IndexNow search engines about new or changed pages (Google does not use IndexNow).
   Run: node tools/indexnow.js --all        every URL in sitemap.xml
        node tools/indexnow.js              only the pages changed in the last commit
        node tools/indexnow.js --dry        print what would be sent
   The key file in the repo root (<key>.txt) proves the site is ours. It is meant to be public. */
const fs=require("fs"),path=require("path"),cp=require("child_process");const root=path.join(__dirname,"..");
const key=fs.readdirSync(root).filter(f=>/^[0-9a-f]{32}\.txt$/.test(f)).map(f=>f.slice(0,-4))[0];
if(!key){console.log("no IndexNow key file found");process.exit(1)}
let host="conventionalmemory.github.io";try{host=fs.readFileSync(path.join(root,"CNAME"),"utf8").trim()||host}catch(e){}
let urls;
if(process.argv.indexOf("--all")>=0)urls=[...fs.readFileSync(path.join(root,"sitemap.xml"),"utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
else{const f=cp.execSync("git diff --name-only HEAD~1 HEAD",{cwd:root,maxBuffer:1e8}).toString().split("\n").filter(Boolean);
 urls=f.filter(x=>/(^|\/)index\.html$/.test(x)&&/^(history|year|decade|museum|guides|books)\//.test(x)||x==="index.html").map(x=>"https://"+host+"/"+x.replace(/index\.html$/,""));
 if(f.indexOf("sitemap.xml")>=0)urls.push("https://"+host+"/sitemap.xml")}
urls=[...new Set(urls)].slice(0,9000);
console.log("IndexNow:",urls.length,"URLs for",host);
if(!urls.length||process.argv.indexOf("--dry")>=0){process.exit(0)}
fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"content-type":"application/json; charset=utf-8"},body:JSON.stringify({host,key,keyLocation:"https://"+host+"/"+key+".txt",urlList:urls})}).then(r=>{console.log("IndexNow answered",r.status);process.exit(r.status<300?0:1)}).catch(e=>{console.log("IndexNow failed:",e.message);process.exit(1)});
