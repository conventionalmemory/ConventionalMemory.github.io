/* bubble.js: every character talks in a text box of their own.
   Connie has a round speech bubble, Emma an index card, Hiram a pixel box, Dad a work tag, Mom a clipboard, Grandpa Floyd a scroll,
   Grandma Winnie a stitched square, Aunt Gussie a ticket, Uncle Conrad a hex nut, Dot a receipt, Viv a capacitor can, Sandy ripples,
   Mo a multimeter screen, Zack a zipper, Tessie and Toner thought clouds, Nibble a tiny box and Mat a blueprint.
   Any of them can switch to a thought cloud (a question or "...") or a shout burst (a short line ending in "!").
   Several in a row overlap and take turns left and right. CMBub.html(id,name,line,avatarSvg,opts) builds one; CMBub.stack(list) builds a layered group. */
window.CMBub=(function(){
"use strict";
var SHAPE={connie:"speech",emma:"card",hiram:"pixel",ram:"tag",rhoda:"clip",floyd:"scroll",winnie:"stitch",augusta:"ticket",conrad:"nut",dot:"receipt",viv:"pill",sandy:"wave",mo:"lcd",zack:"zip",tess:"cloud",nibble:"mini",mat:"grid",toner:"cloud"};
var HUE={connie:"#3fae6b",emma:"#5b8def",hiram:"#f2a33a",ram:"#d9602e",rhoda:"#c04a8a",floyd:"#8a6d3b",winnie:"#e58fb0",augusta:"#7a5bd0",conrad:"#3c8f9c",dot:"#9aa3ad",viv:"#e04e6d",sandy:"#2fb5b0",mo:"#55c26a",zack:"#c9a227",tess:"#a67cc5",nibble:"#6ab04c",mat:"#4f7cac",toner:"#8d8d8d"};
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function shapeFor(id,line){var base=SHAPE[id]||"speech",t=String(line||"");
 if(/!\s*$/.test(t)&&t.length<=58&&base!=="mini"&&base!=="lcd")return"burst";
 if((/\?\s*$/.test(t)||/(\.\.\.|…)\s*$/.test(t))&&base!=="cloud"&&base!=="mini"&&base!=="lcd")return"cloud";
 return base}
function html(id,name,line,av,o){o=o||{};var s=shapeFor(id,line);
 return'<div class="cb cb-'+E(id)+(o.cls?" "+E(o.cls):"")+'" style="--h:'+(HUE[id]||"#3fae6b")+'"><span class="cb-av" aria-hidden="true">'+(av||"")+'</span><div class="cb-t cb-s-'+s+'"><p><b>'+E(name)+':</b> '+E(line)+'</p></div></div>'}
/* list: [[id,name,line,avatarSvg],...] */
function stack(list){return'<div class="cb-stack">'+list.map(function(x,i){return html(x[0],x[1],x[2],x[3],{cls:i%2?"cb-fl":""})}).join("")+'</div>'}
return{html:html,stack:stack,shape:shapeFor,shapes:SHAPE,hue:HUE}})();
