// The YouTube feed builder: parses a channel feed, merges with older videos, newest first, and the theater lists them.
const fs=require("fs"),path=require("path"),cp=require("child_process"),os=require("os");const root=path.join(__dirname,"..");let fails=0;
function ok(c,m){console.log((c?"ok   ":"FAIL ")+m);if(!c)fails++}
const xml='<feed xmlns:yt="x"><entry><yt:videoId>AAAAAAAAAAA</yt:videoId><title>Old &amp; gold: a DOS tour</title><published>2026-01-02T10:00:00+00:00</published></entry><entry><yt:videoId>BBBBBBBBBBB</yt:videoId><title>Newest upload</title><published>2026-09-30T10:00:00+00:00</published></entry></feed>';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"yt-"));fs.mkdirSync(path.join(tmp,"tools"));fs.copyFileSync(path.join(root,"tools/build-youtube.js"),path.join(tmp,"tools/build-youtube.js"));
fs.writeFileSync(path.join(tmp,"youtube-data.js"),'var YT_CHANNEL={"handle":"X","id":""};\nvar YT_VIDEOS=[{"id":"CCCCCCCCCCC","t":"Middle video","d":"2026-05-05"}];\n');fs.writeFileSync(path.join(tmp,"feed.xml"),xml);
cp.execFileSync("node",[path.join(tmp,"tools/build-youtube.js")],{env:{...process.env,YT_FEED_FILE:path.join(tmp,"feed.xml"),YT_CHANNEL_ID:"UC"+"a".repeat(22)}});
const out=fs.readFileSync(path.join(tmp,"youtube-data.js"),"utf8"),list=JSON.parse(out.match(/^var YT_VIDEOS=(\[.*\]);$/m)[1]);
ok(list.length===3&&list[0].id==="BBBBBBBBBBB"&&list[1].id==="CCCCCCCCCCC"&&list[2].t==="Old & gold: a DOS tour","feed entries merge with older videos, newest first, entities decoded");
ok(fs.readFileSync(path.join(root,"youtube-data.js"),"utf8").indexOf("var YT_VIDEOS=")>=0&&fs.existsSync(path.join(root,".github/workflows/youtube.yml")),"data file and schedule exist");
fs.rmSync(tmp,{recursive:true});if(fails){process.exit(1)}console.log("OK youtube");
