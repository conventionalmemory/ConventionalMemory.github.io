/* keys.js: small accessibility helpers for moving around the site.
   1. After you move to a new page, the page name is announced to screen readers and keyboard focus moves to the page heading.
   2. Press ? (or use the footer link) for a list of the keyboard shortcuts. */
(function(){
"use strict";
var live=document.createElement("div");live.id="cm-live";live.className="sr";live.setAttribute("role","status");live.setAttribute("aria-live","polite");document.body.appendChild(live);
var app=document.getElementById("app"),lastKey=null,tm=0;
function E(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function keyOf(){var p=location.hash.replace(/^#\/?/,"").split("?")[0].split("/");return p.slice(0,2).join("/")}
function typing(el){return!!el&&el!==document.body&&el.isConnected&&/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)||!!el&&el.isContentEditable}
function moved(){
 var k=keyOf();if(k===lastKey)return;lastKey=k;
 clearTimeout(tm);tm=setTimeout(function(){
  var h=app&&app.querySelector("h1,h2");var name=(h?h.textContent:document.title).replace(/\s+/g," ").replace(/^\s+|\s+$/g,"");
  live.textContent="";setTimeout(function(){live.textContent=name?"Now showing "+name:""},50);
  var a=document.activeElement;
  if(h&&!typing(a)&&(!a||a===document.body||!a.isConnected||!app.contains(a)||a.tagName==="A"||a.tagName==="BUTTON")){
   if(!h.hasAttribute("tabindex"))h.setAttribute("tabindex","-1");
   try{h.focus({preventScroll:true})}catch(e){}}},350)}
if(app){window.addEventListener("hashchange",moved);lastKey=keyOf()}

var ROWS=[["/","Search everything"],["Ctrl+K or Cmd+K","Search everything"],["?","Show this list"],["Esc","Close a window, leave kiosk mode"],["Tab","Move to the next link (the first one skips to the page)"],["Arrow Down","Open a menu drop-down when a menu tab has the focus"],["C:\\> prompt","At the bottom of every page: type help"]],box=null,back=null;
function build(){
 box=document.createElement("div");box.id="kb";box.className="kb";box.hidden=true;
 box.innerHTML='<div class="kb-bg"></div><div class="kb-box" role="dialog" aria-modal="true" aria-labelledby="kb-t"><div class="kb-top"><b id="kb-t">Keyboard shortcuts</b><button class="kb-x" type="button">Close</button></div><dl>'+ROWS.map(function(r){return'<div><dt><kbd>'+E(r[0])+'</kbd></dt><dd>'+E(r[1])+'</dd></div>'}).join("")+'</dl><p class="tn">Shortcuts that type a letter stay off while you are typing in a box.</p></div>';
 document.body.appendChild(box);
 box.querySelector(".kb-bg").onclick=close;box.querySelector(".kb-x").onclick=close}
function open(){if(!box)build();back=document.activeElement;box.hidden=false;var x=box.querySelector(".kb-x");x.focus()}
function close(){if(!box||box.hidden)return;box.hidden=true;try{if(back&&back.isConnected)back.focus()}catch(e){}}
document.addEventListener("keydown",function(e){
 if(box&&!box.hidden){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close()}else if(e.key==="Tab"){e.preventDefault();box.querySelector(".kb-x").focus()}return}
 if(e.key==="?"&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!typing(e.target)){var kiosk=/^#\/(kiosk|demo)/.test(location.hash);if(kiosk)return;e.preventDefault();open()}},true);
var f=document.querySelector("footer .cp");
if(f){var b=document.createElement("button");b.type="button";b.className="btn lnk";b.id="kbbtn";b.textContent="Keyboard shortcuts";b.onclick=open;f.appendChild(document.createTextNode(" "));f.appendChild(b)}
window.CMKeys={open:open,close:close,announce:function(t){live.textContent="";setTimeout(function(){live.textContent=t},50)}};
})();
