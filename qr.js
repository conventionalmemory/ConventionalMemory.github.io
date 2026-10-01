/* Barcode generators, no outside libraries: QR codes (byte mode, versions 1 to 10, error correction L or M)
   and Code 128 (set B, printable ASCII). Used by the label printer on #/labels.
   CMCode.qr(text, "M"|"L") returns an array of rows of 0/1 (1 = dark), without the quiet zone.
   CMCode.code128(text) returns an array of 0/1 bars, without the quiet zone. */
var CMCode=(function(){
 /* ---------- QR ---------- */
 var ECPB={L:[-1,7,10,15,20,26,18,20,24,30,18],M:[-1,10,16,26,18,24,16,18,22,22,26]};
 var NBLK={L:[-1,1,1,1,1,1,2,2,2,2,4],M:[-1,1,1,1,2,2,4,4,4,5,5]};
 var ALIGN=[[],[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
 var EXP=[],LOG=[];(function(){var x=1;for(var i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d}for(i=255;i<512;i++)EXP[i]=EXP[i-255]})();
 function gmul(a,b){return a&&b?EXP[LOG[a]+LOG[b]]:0}
 function rsGen(n){var g=[1];for(var i=0;i<n;i++){var h=[];for(var j=0;j<=g.length;j++)h[j]=(j<g.length?gmul(g[j],EXP[i]):0)^(j>0?g[j-1]:0);g=h}return g.reverse()}
 function rsRem(data,n){var g=rsGen(n),r=[],i,j;for(i=0;i<n;i++)r[i]=0;
  for(i=0;i<data.length;i++){var f=data[i]^r[0];r.shift();r.push(0);if(f)for(j=0;j<n;j++)r[j]^=gmul(g[j+1],f)}return r}
 function dataCap(v,e){var raw=rawBits(v);return Math.floor(raw/8)-ECPB[e][v]*NBLK[e][v]}
 function rawBits(v){var r=(16*v+128)*v+64;if(v>=2){var na=Math.floor(v/7)+2;r-=(25*na-10)*na-55;if(v>=7)r-=36}return r}
 function bytes(s){var u=unescape(encodeURIComponent(s)),o=[];for(var i=0;i<u.length;i++)o.push(u.charCodeAt(i));return o}
 function formatBits(e,mask){var d=({L:1,M:0})[e]<<3|mask,r=d<<10;for(var i=14;i>=10;i--)if((r>>i)&1)r^=0x537<<(i-10);return((d<<10)|r)^0x5412}
 function versionBits(v){var r=v<<12;for(var i=17;i>=12;i--)if((r>>i)&1)r^=0x1f25<<(i-12);return(v<<12)|r}
 function qr(text,ecc){ecc=ecc==="L"?"L":"M";var data=bytes(text),v;
  for(v=1;v<=10;v++){var need=4+(v<10?8:16)+data.length*8;if(need<=dataCap(v,ecc)*8)break}
  if(v>10)throw new Error("Text too long for the label code");
  var bits=[];function put(x,n){for(var i=n-1;i>=0;i--)bits.push((x>>>i)&1)}
  put(4,4);put(data.length,v<10?8:16);data.forEach(function(b){put(b,8)});
  var cap=dataCap(v,ecc)*8;put(0,Math.min(4,cap-bits.length));while(bits.length%8)bits.push(0);
  for(var pad=0xec;bits.length<cap;pad^=0xec^0x11)put(pad,8);
  var cw=[];for(var i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=b<<1|bits[i+j];cw.push(b)}
  var nb=NBLK[ecc][v],ec=ECPB[ecc][v],raw=Math.floor(rawBits(v)/8),short=nb-raw%nb,sl=Math.floor(raw/nb),blocks=[],k=0;
  for(i=0;i<nb;i++){var dl=sl-ec+(i<short?0:1),d=cw.slice(k,k+dl);k+=dl;blocks.push({d:d,e:rsRem(d,ec)})}
  var out=[];for(i=0;i<blocks[blocks.length-1].d.length;i++)blocks.forEach(function(b){if(i<b.d.length)out.push(b.d[i])});
  for(i=0;i<ec;i++)blocks.forEach(function(b){out.push(b.e[i])});
  var n=17+4*v,M=[],F=[],x,y;for(y=0;y<n;y++){M.push([]);F.push([]);for(x=0;x<n;x++){M[y].push(0);F[y].push(0)}}
  function set(x,y,d){M[y][x]=d?1:0;F[y][x]=1}
  function finder(cx,cy){for(var dy=-4;dy<=4;dy++)for(var dx=-4;dx<=4;dx++){var xx=cx+dx,yy=cy+dy;if(xx<0||yy<0||xx>=n||yy>=n)continue;var dist=Math.max(Math.abs(dx),Math.abs(dy));set(xx,yy,dist!==2&&dist!==4)}}
  finder(3,3);finder(n-4,3);finder(3,n-4);
  for(i=8;i<n-8;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  var al=ALIGN[v];al.forEach(function(ax,ia){al.forEach(function(ay,ib){if((ia===0&&ib===0)||(ia===0&&ib===al.length-1)||(ia===al.length-1&&ib===0))return;for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)set(ax+dx,ay+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)})});
  function formatDraw(mask){var f=formatBits(ecc,mask);
   for(var i=0;i<=5;i++)set(8,i,(f>>i)&1);set(8,7,(f>>6)&1);set(8,8,(f>>7)&1);set(7,8,(f>>8)&1);for(i=9;i<15;i++)set(14-i,8,(f>>i)&1);
   for(i=0;i<8;i++)set(n-1-i,8,(f>>i)&1);for(i=8;i<15;i++)set(8,n-15+i,(f>>i)&1);set(8,n-8,1)}
  formatDraw(0);
  if(v>=7){var vb=versionBits(v);for(i=0;i<18;i++){var bit=(vb>>i)&1,a=n-11+i%3,b=Math.floor(i/3);set(a,b,bit);set(b,a,bit)}}
  var allb=[];out.forEach(function(c){for(var i=7;i>=0;i--)allb.push((c>>i)&1)});
  var pos=0;for(var right=n-1;right>=1;right-=2){if(right===6)right=5;for(var vert=0;vert<n;vert++)for(var j=0;j<2;j++){var xx=right-j,up=((right+1)&2)===0,yy=up?n-1-vert:vert;if(!F[yy][xx]&&pos<allb.length){M[yy][xx]=allb[pos++]}}}
  function maskFn(m,x,y){switch(m){case 0:return(x+y)%2===0;case 1:return y%2===0;case 2:return x%3===0;case 3:return(x+y)%3===0;case 4:return(Math.floor(x/3)+Math.floor(y/2))%2===0;case 5:return x*y%2+x*y%3===0;case 6:return(x*y%2+x*y%3)%2===0;default:return((x+y)%2+x*y%3)%2===0}}
  function applyMask(m){for(var y=0;y<n;y++)for(var x=0;x<n;x++)if(!F[y][x]&&maskFn(m,x,y))M[y][x]^=1}
  function penalty(){var p=0,x,y,r,run,c;
   for(y=0;y<n;y++){run=1;for(x=1;x<n;x++){if(M[y][x]===M[y][x-1])run++;else{if(run>=5)p+=run-2;run=1}}if(run>=5)p+=run-2}
   for(x=0;x<n;x++){run=1;for(y=1;y<n;y++){if(M[y][x]===M[y-1][x])run++;else{if(run>=5)p+=run-2;run=1}}if(run>=5)p+=run-2}
   for(y=0;y<n-1;y++)for(x=0;x<n-1;x++){c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
   var pat=[1,0,1,1,1,0,1,0,0,0,0],pat2=[0,0,0,0,1,0,1,1,1,0,1];
   function m(a,get){for(var i=0;i<=n-11;i++){var f1=true,f2=true;for(var j=0;j<11;j++){var b=get(a,i+j);if(b!==pat[j])f1=false;if(b!==pat2[j])f2=false}if(f1)p+=40;if(f2)p+=40}}
   for(y=0;y<n;y++)m(y,function(a,i){return M[a][i]});for(x=0;x<n;x++)m(x,function(a,i){return M[i][a]});
   var dark=0;for(y=0;y<n;y++)for(x=0;x<n;x++)dark+=M[y][x];p+=Math.floor(Math.abs(dark*20-n*n*10)/(n*n))*10;
   return p}
  var best=-1,bp=1e9;for(var m=0;m<8;m++){applyMask(m);formatDraw(m);var pe=penalty();if(pe<bp){bp=pe;best=m}applyMask(m)}
  applyMask(best);formatDraw(best);return M}
 /* ---------- Code 128, set B ---------- */
 var P="212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");
 function code128(text){var v=[104],sum=104,i;for(i=0;i<text.length;i++){var c=text.charCodeAt(i)-32;if(c<0||c>94)throw new Error("Only printable ASCII in a Code 128 label");v.push(c);sum+=c*(i+1)}
  v.push(sum%103);v.push(106);var bars=[];v.forEach(function(s){var w=P[s],dark=1;for(var j=0;j<w.length;j++){for(var k=0;k<+w[j];k++)bars.push(dark);dark^=1}});return bars}
 return{qr:qr,code128:code128}
})();
