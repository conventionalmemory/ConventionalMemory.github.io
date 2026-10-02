/* Affiliate links (Amazon Associates and eBay Partner Network).
   Nothing shows until you fill in your own IDs below. Until then the site has no affiliate links at all.
     AFF.amazon : your Amazon Associates tracking ID, like  conventionalm-20
     AFF.ebay   : your eBay Partner Network campaign ID, a 10 digit number
   The links only search for the product by name; they never show or copy prices. Every box carries the
   disclosure that Amazon and eBay require, and every link is marked rel="sponsored". */
var AFF={amazon:"",ebay:"",ebayCustom:"cm"};
var AFF_NOTE="Affiliate links: if you buy through them, Conventional Memory earns a small commission at no cost to you. As an Amazon Associate I earn from qualifying purchases.";
function affId(k){var v=String(AFF[k]||"").trim();if(k==="amazon")return/^[a-z0-9][a-z0-9-]{1,38}-\d{2}$/i.test(v)?v:"";if(k==="ebay")return/^\d{8,12}$/.test(v)?v:"";return""}
function affOn(){return!!(affId("amazon")||affId("ebay"))}
function affQ(name,maker){var n=String(name||"").replace(/\s*\((Japan|North America|Europe|US|UK|NA|EU|JP|PAL|NTSC)\)\s*$/i,"").replace(/[^\w .&'+-]+/g," ").replace(/\s+/g," ").trim();if(maker){var m=String(maker).split(/[ ,]/)[0];if(m&&n.toLowerCase().indexOf(m.toLowerCase())<0)n=m+" "+n}return n}
function affUrl(k,q){var id=affId(k);if(!id||!q)return"";var e=encodeURIComponent(q);
 if(k==="amazon")return"https://www.amazon.com/s?k="+e+"&tag="+encodeURIComponent(id);
 return"https://www.ebay.com/sch/i.html?_nkw="+e+"&_sacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid="+id+"&customid="+encodeURIComponent(String(AFF.ebayCustom||"cm").replace(/[^\w-]/g,"").slice(0,30))+"&toolid=10001&mkevt=1"}
/* A small "Find one" box. Returns "" when no IDs are set. */
function affBox(name,maker,label){if(!affOn())return"";var q=affQ(name,maker),a=affUrl("amazon",q),e=affUrl("ebay",q);if(!q||!(a||e))return"";
 function ln(u,t){return u?'<li><a href="'+esc(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+'</a></li>':""}
 return'<div class="affb"><h4 class="sub">'+esc(label||"Want one of your own?")+'</h4><ul class="refs">'+ln(e,"Search eBay for "+esc(q))+ln(a,"Search Amazon for "+esc(q))+'</ul><p class="tn">'+esc(AFF_NOTE)+'</p></div>'}
/* Inline links for one line of text, such as a wanted accessory. */
function affInline(name,maker){if(!affOn())return"";var q=affQ(name,maker),a=affUrl("amazon",q),e=affUrl("ebay",q);if(!q)return"";
 return' <small class="affi">Find it: '+(e?'<a href="'+esc(e)+'" target="_blank" rel="sponsored noopener noreferrer">eBay</a>':"")+(e&&a?" &middot; ":"")+(a?'<a href="'+esc(a)+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>':"")+'</small>'}
function affFooter(){if(!affOn())return;var f=document.querySelector("footer");if(!f||f.querySelector(".affnote"))return;var p=document.createElement("p");p.className="affnote tn";p.textContent=AFF_NOTE;f.appendChild(p)}
document.addEventListener("DOMContentLoaded",affFooter);if(document.readyState!=="loading")affFooter();
