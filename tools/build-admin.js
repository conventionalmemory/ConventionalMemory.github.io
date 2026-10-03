// Builds admin.html from index.html.
// The public page (index.html) can only talk to its own origin. The admin page is the same app with a
// Content-Security-Policy that also allows GitHub (to save changes) and Wikipedia and Wikimedia Commons (for lookups).
// Run after any change to index.html:   node tools/build-admin.js
const fs=require("fs"),path=require("path");const root=path.join(__dirname,"..");
const src=fs.readFileSync(path.join(root,"index.html"),"utf8");
const base="connect-src 'self';";
if(src.indexOf(base)<0)throw new Error("index.html connect-src is not the expected 'self' only value");
let out=src.replace(base,"connect-src 'self' https://api.github.com https://en.wikipedia.org https://commons.wikimedia.org;");
out=out.replace("<title>","<title>Admin | ");
out=out.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta name="robots" content="noindex">');
fs.writeFileSync(path.join(root,"admin.html"),out);console.log("wrote admin.html");
