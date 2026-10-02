/* Points the whole site at a custom domain (or back at github.io).
   Run: node tools/set-domain.js conventionalmemory.io        (writes CNAME, rewrites every public address, rebuilds the generated files)
        node tools/set-domain.js --github                     (back to conventionalmemory.github.io, removes CNAME)
   Do this only AFTER the DNS records point at GitHub (GitHub Pages custom domain setup), or the site will redirect in a circle. */
const fs=require("fs"),path=require("path"),cp=require("child_process");const root=path.join(__dirname,"..");
const arg=process.argv[2];if(!arg){console.log("usage: node tools/set-domain.js <domain> | --github");process.exit(1)}
const GH="conventionalmemory.github.io",host=arg==="--github"?GH:arg.replace(/^https?:\/\//,"").replace(/\/.*$/,"").toLowerCase();
if(!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)){console.log("that does not look like a domain:",arg);process.exit(1)}
const origin="https://"+host,rd=f=>fs.readFileSync(path.join(root,f),"utf8"),wr=(f,s)=>fs.writeFileSync(path.join(root,f),s);
if(host===GH)fs.rmSync(path.join(root,"CNAME"),{force:true});else wr("CNAME",host+"\n");
const OLD=/https:\/\/(conventionalmemory\.github\.io|[a-z0-9.-]+\.[a-z]{2,})\//;
let a=rd("app.js");a=a.replace(/var SITE_URL="[^"]*";[^\n]*/,'var SITE_URL="'+origin+'/"; // the one place the public address lives (tools/set-domain.js changes it)');wr("app.js",a);
let l=rd("labelprint.js");l=l.replace(/:"https:\/\/[^"]+"\}/,':"'+origin+'/"}');wr("labelprint.js",l);
let i=rd("index.html");
i=i.replace(/(<link rel="canonical" href=")[^"]*"/,'$1'+origin+'/"').replace(/(<meta property="og:url" content=")[^"]*"/,'$1'+origin+'/"').replace(/(<meta property="og:image" content=")[^"]*"/,'$1'+origin+'/og.png"').replace(/(<meta name="twitter:image" content=")[^"]*"/,'$1'+origin+'/og.png"')
 .replace(/(<script type="application\/ld\+json">)(.*?)(<\/script>)/,(m,x,j,z)=>x+j.replace(/https:\/\/[^"\/]+\//g,origin+"/")+z);
wr("index.html",i);
let s=rd("sw.js");s=s.replace(/var CACHE="cm-v(\d+)"/,(m,n)=>'var CACHE="cm-v'+(+n+1)+'"');wr("sw.js",s);
["tools/build-admin.js","tools/build-feed.js","tools/build-seo.js"].forEach(t=>console.log(cp.execSync("node "+t,{cwd:root,maxBuffer:1e9}).toString().trim().split("\n").pop()));
console.log("Site address is now",origin+"/");
