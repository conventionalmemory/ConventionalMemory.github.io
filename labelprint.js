/* Label maker: draws a museum label (QR code, label number, name, optional Code 128 bars) on a canvas at 203 dpi,
   turns it into the 1-bit raster a Phomemo M-series printer wants, and sends it over Web Bluetooth.
   Everything runs in the browser. Needs qr.js (CMCode). Loaded on demand from #/labels and #/scan.

   Printer protocol (Phomemo M110 family, reverse engineered by others: github.com/vivier/phomemo-tools and
   github.com/mkuhlmann/pyphomemo): BLE service 0xFF00, write characteristic 0xFF02, ESC/POS style raster.
   The M221 has not been confirmed against this code, so the page marks direct printing as experimental and
   always offers PNG download and the browser print dialog as fallbacks. */
var CMLabel=(function(){
 var DPMM=8,KEY="cm-labelset";
 var SIZES=[["40x30","40 x 30 mm (the common roll)"],["50x30","50 x 30 mm"],["30x20","30 x 20 mm (small)"],["40x20","40 x 20 mm"],["30x30","30 x 30 mm"],["50x50","50 x 50 mm"],["50x80","50 x 80 mm (tall)"],["custom","Custom size"]];
 var DEF={size:"40x30",w:40,h:30,style:"qr",base:"",dens:8,speed:3,media:"0a",shift:0,slow:false,copies:1,ecc:"L"};
 function load(){var s={},k;try{s=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}var o={};for(k in DEF)o[k]=s[k]!=null?s[k]:DEF[k];
  if(!o.base)o.base=defBase();return fix(o)}
 function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
 function defBase(){return typeof SITE_URL==="string"?SITE_URL:"https://conventionalmemory.io/"}
 function num(v,lo,hi,d){v=+v;return isFinite(v)?Math.min(hi,Math.max(lo,v)):d}
 function fix(s){if(s.size!=="custom"){var m=String(s.size).match(/^(\d+)x(\d+)$/);if(m){s.w=+m[1];s.h=+m[2]}else{s.size="40x30";s.w=40;s.h=30}}
  s.w=num(s.w,15,80,40);s.h=num(s.h,10,100,30);s.dens=Math.round(num(s.dens,1,15,8));s.speed=Math.round(num(s.speed,1,5,3));s.shift=num(s.shift,-10,10,0);s.copies=Math.round(num(s.copies,1,20,1));
  if(!/^(qr|both|c128)$/.test(s.style))s.style="qr";if(!/^(0a|0b|26)$/.test(s.media))s.media="0a";s.ecc=s.ecc==="M"?"M":"L";s.slow=!!s.slow;
  s.base=String(s.base||"").trim();if(!/^https?:\/\//i.test(s.base))s.base=defBase();if(!/\/$/.test(s.base))s.base+="/";return s}
 function urlFor(it,S){return S.base+"#/t/"+it.cm}
 function tagNo(n){return"CM-"+("0000"+n).slice(-4)}
 function info(it,S){return{tag:tagNo(it.cm),name:it.name||"",sub:[it.maker&&it.maker!=="Unknown"?it.maker:"",it.year||""].filter(Boolean).join(" · "),url:urlFor(it,S)}}

 /* ---------- drawing ---------- */
 function fit(x,text,maxW,weight,size,min){var s=size;while(s>min){x.font=weight+" "+s+"px Arial, Helvetica, sans-serif";if(x.measureText(text).width<=maxW)break;s-=2}x.font=weight+" "+s+"px Arial, Helvetica, sans-serif";return s}
 function wrap(x,text,maxW,maxLines){var words=String(text).split(/\s+/),lines=[],cur="";
  words.forEach(function(w){var t=cur?cur+" "+w:w;if(x.measureText(t).width<=maxW||!cur)cur=t;else{lines.push(cur);cur=w}});if(cur)lines.push(cur);
  if(lines.length>maxLines){lines=lines.slice(0,maxLines);var l=lines[maxLines-1];while(l.length>1&&x.measureText(l+"…").width>maxW)l=l.slice(0,-1);lines[maxLines-1]=l+"…"}
  lines=lines.map(function(l){while(l.length>1&&x.measureText(l).width>maxW)l=l.slice(0,-1);return l});return lines}
 function render(L,S){var W=Math.round(S.w*DPMM),H=Math.round(S.h*DPMM),c=document.createElement("canvas");c.width=W;c.height=H;
  var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,W,H);x.fillStyle="#000";x.textBaseline="top";
  var pad=Math.round(1.5*DPMM),top=pad,bot=H-pad,left=pad,right=W-pad;
  if(S.style!=="qr"){var bars=CMCode.code128(L.tag),unit=Math.max(1,Math.floor((right-left)/bars.length)),bw=bars.length*unit,bx=left+Math.floor((right-left-bw)/2),bh=Math.min(7*DPMM,Math.floor((bot-top)*0.34)),txt=12;
   var by=bot-bh;for(var i=0;i<bars.length;i++)if(bars[i])x.fillRect(bx+i*unit,by,unit,bh-txt);
   x.font="700 "+txt+"px Arial, Helvetica, sans-serif";x.textAlign="center";x.fillText(L.tag,left+(right-left)/2,bot-txt+1);x.textAlign="left";bot=by-Math.round(DPMM*0.6)}
  var tx=left,tw=right-left,ty0=null;
  if(S.style!=="c128"){var m=CMCode.qr(L.url,S.ecc),n=m.length,stack=H>=W*1.3,avail=stack?Math.min(right-left,Math.floor((bot-top)*0.6)):Math.min(bot-top,Math.floor((right-left)*0.58)),sc=Math.max(1,Math.floor(avail/n)),qs=sc*n,qy=stack?top:top+Math.floor((bot-top-qs)/2),qx=stack?left+Math.floor((right-left-qs)/2):left;
   for(var yy=0;yy<n;yy++)for(var xx=0;xx<n;xx++)if(m[yy][xx])x.fillRect(qx+xx*sc,qy+yy*sc,sc,sc);
   if(stack){ty0=top+qs+Math.round(2*DPMM)}else{tx=left+qs+Math.round(1.5*DPMM);tw=right-tx}}
  var ty=ty0!==null?ty0:top;
  if(tw>=Math.round(8*DPMM)){var ts=fit(x,L.tag,tw,"700",Math.min(30,Math.round((bot-top)/2.2)),14);x.fillText(L.tag,tx,ty);ty+=ts+4;
   var room=bot-ty;if(room>=20){var ns=room>=70?22:18;x.font="700 "+ns+"px Arial, Helvetica, sans-serif";var sub=room>=ns*2+22,lines=wrap(x,L.name,tw,Math.max(1,Math.min(4,Math.floor((room-(sub?20:0))/(ns+2)))));
    lines.forEach(function(l){x.fillText(l,tx,ty);ty+=ns+2});
    if(sub&&L.sub&&bot-ty>=18){x.font="400 16px Arial, Helvetica, sans-serif";x.fillText(wrap(x,L.sub,tw,1)[0],tx,ty+2)}}}
  return c}
 function testCanvas(S){var W=Math.round(S.w*DPMM),H=Math.round(S.h*DPMM),c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,W,H);x.fillStyle="#000";
  x.fillRect(0,0,W,3);x.fillRect(0,H-3,W,3);x.fillRect(0,0,3,H);x.fillRect(W-3,0,3,H);x.fillRect(Math.floor(W/2)-1,0,2,H);x.fillRect(0,Math.floor(H/2)-1,W,2);
  x.textBaseline="top";x.font="700 22px Arial, Helvetica, sans-serif";x.fillText("TEST",10,8);x.font="400 16px Arial, Helvetica, sans-serif";x.fillText(S.w+" x "+S.h+" mm",10,H-26);return c}

 /* ---------- raster and printer commands ---------- */
 function bits(c,shiftMm){var sh=Math.round((shiftMm||0)*DPMM),W=c.width,H=c.height,wd=Math.max(8,W+sh),bpl=Math.ceil(wd/8),d=c.getContext("2d").getImageData(0,0,W,H).data,out=new Uint8Array(bpl*H);
  for(var y=0;y<H;y++)for(var x=0;x<W;x++){var o=(y*W+x)*4,lum=d[o]*0.3+d[o+1]*0.59+d[o+2]*0.11;if(d[o+3]>0&&lum<140){var xx=x+sh;if(xx>=0&&xx<bpl*8)out[y*bpl+(xx>>3)]|=0x80>>(xx&7)}}
  return{bpl:bpl,lines:H,data:out}}
 function job(b,S){var a=[0x1b,0x4e,0x0d,S.speed,0x1b,0x4e,0x04,S.dens,0x1f,0x11,parseInt(S.media,16)],y,i;
  for(y=0;y<b.lines;y+=240){var h=Math.min(240,b.lines-y);a.push(0x1d,0x76,0x30,0x00,b.bpl&255,b.bpl>>8,h&255,h>>8);for(i=y*b.bpl;i<(y+h)*b.bpl;i++)a.push(b.data[i])}
  a.push(0x1f,0xf0,0x05,0x00,0x1f,0xf0,0x03,0x00);return Uint8Array.from(a)}

 /* ---------- Bluetooth ---------- */
 var BT={dev:null,ch:null,name:"",busy:false};
 var SERVICES=[0xff00,0xffe0,0xfff0,"49535343-fe7d-4ae5-8fa9-9fafd205e455"];
 function supported(){return!!(navigator.bluetooth&&navigator.bluetooth.requestDevice)}
 function connected(){return!!(BT.dev&&BT.dev.gatt&&BT.dev.gatt.connected&&BT.ch)}
 function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
 function findChar(srv){var i=0;function next(){if(i>=SERVICES.length)return Promise.reject(new Error("Connected, but this printer does not offer a service I know how to talk to."));
   var u=SERVICES[i++];return srv.getPrimaryService(u).then(function(svc){return svc.getCharacteristic(0xff02).catch(function(){return svc.getCharacteristics().then(function(cs){var w=cs.filter(function(c){return c.properties&&(c.properties.writeWithoutResponse||c.properties.write)})[0];if(!w)throw new Error("no writable characteristic");return w})})}).catch(function(){return next()})}
  return next()}
 function open(){return BT.dev.gatt.connect().then(findChar).then(function(ch){BT.ch=ch;return BT.name})}
 function connect(all){if(!supported())return Promise.reject(new Error("This browser cannot talk to Bluetooth devices. Use Chrome on a computer or an Android phone, or download the label image instead."));
  var o={optionalServices:SERVICES};if(all)o.acceptAllDevices=true;else o.filters=[{namePrefix:"M1"},{namePrefix:"M2"},{namePrefix:"Phomemo"},{namePrefix:"PM"},{services:[0xff00]}];
  return navigator.bluetooth.requestDevice(o).then(function(d){BT.dev=d;BT.name=d.name||"printer";BT.ch=null;d.addEventListener("gattserverdisconnected",function(){BT.ch=null});return open()})}
 function disconnect(){try{if(BT.dev&&BT.dev.gatt.connected)BT.dev.gatt.disconnect()}catch(e){}BT.ch=null}
 function ensure(){return connected()?Promise.resolve():(BT.dev?open():Promise.reject(new Error("Not connected. Press Connect printer first.")))}
 function send(bytes,S){var size=S.slow?20:128,gap=S.slow?30:10,i=0;
  function step(){if(i>=bytes.length)return Promise.resolve();var part=bytes.slice(i,i+size);i+=size,ch=BT.ch;
   var p=ch.properties&&ch.properties.writeWithoutResponse&&ch.writeValueWithoutResponse?ch.writeValueWithoutResponse(part):ch.writeValue(part);
   return Promise.resolve(p).then(function(){return sleep(gap)}).then(step)}
  var ch;return step()}
 function printCanvas(c,S){if(BT.busy)return Promise.reject(new Error("Still printing the last one."));BT.busy=true;
  return ensure().then(function(){var bytes=job(bits(c,S.shift),S);return send(bytes,S)}).then(function(){BT.busy=false;return sleep(S.slow?900:500)},function(e){BT.busy=false;throw e})}
 function printMany(list,S,progress,cancelled){var i=0,total=list.length*S.copies;var done=0;
  function nxt(){if(cancelled&&cancelled())return Promise.resolve(done);if(i>=list.length)return Promise.resolve(done);var item=list[i],copy=0;
   function cp(){if(cancelled&&cancelled())return Promise.resolve();if(copy>=S.copies){i++;return Promise.resolve()}copy++;if(progress)progress(done+1,total,item);
    return printCanvas(render(item,S),S).then(function(){done++;return cp()})}
   return cp().then(nxt)}
  return nxt()}
 function download(c,name){c.toBlob(function(b){if(!b)return;var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000)},"image/png")}
 return{SIZES:SIZES,DEF:DEF,load:load,save:save,fix:fix,info:info,tagNo:tagNo,urlFor:urlFor,render:render,testCanvas:testCanvas,bits:bits,job:job,
  supported:supported,connected:connected,connect:connect,disconnect:disconnect,printCanvas:printCanvas,printMany:printMany,download:download,deviceName:function(){return BT.name},busy:function(){return BT.busy}}
})();
