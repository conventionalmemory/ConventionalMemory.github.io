/* Affiliate links (Amazon Associates and eBay Partner Network).
   Links appear only for a network whose ID below is set and well formed.
     AFF.amazon : Amazon Associates tracking ID
     AFF.ebay   : eBay Partner Network campaign ID, a 10 digit number
   The links only search for the product by name; they never show or copy prices. The required disclosure sits
   in each shelf box (one short line) and on the Disclosure page linked from the footer. Every link is rel="sponsored". */
var AFF={amazon:"conventionalm-20",ebay:"5339217307",ebayCustom:"cm"};
var AFF_SHORT="Affiliate links. As an Amazon Associate I earn from qualifying purchases.";
var AFF_NOTE="Some links on this site are affiliate links. If you buy through one, Conventional Memory earns a small commission at no cost to you. As an Amazon Associate I earn from qualifying purchases. Links only search for a product by name; the museum never copies prices or product photos from Amazon or eBay, and nothing here is a paid placement. Items recommended on a page were picked by the museum, and a recommendation is not a promise that a part fits your exact model.";
function affId(k){var v=String(AFF[k]||"").trim();if(k==="amazon")return/^[a-z0-9][a-z0-9-]{1,38}-\d{2}$/i.test(v)?v:"";if(k==="ebay")return/^\d{8,12}$/.test(v)?v:"";return""}
function affOn(){return!!(affId("amazon")||affId("ebay"))}
/* The brand part of a maker field: "Sony Computer Entertainment" -> "Sony", "IBM and Motorola" -> "IBM", "Digital Equipment Corporation" -> "Digital Equipment". */
function affBrand(maker){var m=String(maker||"").split(/\s*(?:\/|,|;|\sand\s|\()\s*/)[0].replace(/[^\w .&'+-]+/g," ").replace(/\s+/g," ").trim(),w=m.split(" "),gen=/^(corp|corporation|inc|incorporated|ltd|limited|co|company|computers?|systems?|technolog(y|ies)|products|entertainment|research|international|holdings|electronics|studios?|software|interactive|games|group)\.?$/i;
 while(w.length>1&&gen.test(w[w.length-1]))w.pop();return w.slice(0,2).join(" ")}
/* What to type into a store search for this thing. Keeps slashes (CP/M, OS/2), drops notes like "(retail release)" and trailing event words ("unveiled"), and adds the maker's brand only when the name does not already carry it. */
function affQ(name,maker){var raw=String(name||"");if(raw.length>52&&raw.indexOf(":")>11)raw=raw.split(":")[0];var n=raw.replace(/\s*\((Japan|North America|Europe|US|UK|NA|EU|JP|PAL|NTSC)\)\s*$/i,"").replace(/\s*\([^)]*(retail|release|remake|beta|untested|no hard drive|for parts)[^)]*\)\s*$/i,"").replace(/\s+(unveiled|announced|launched|released|introduced)$/i,"").replace(/[^\w .&'+\/-]+/g," ").replace(/\s+/g," ").trim();
 if(maker){var b=affBrand(maker),f=b.split(" ")[0];if(f&&n.toLowerCase().indexOf(f.toLowerCase())<0&&!(/^hewlett/i.test(b)&&/\bhp\b/i.test(n)))n=b+" "+n}return n}
/* A search that starts with the BOOKS marker is a book search: it is limited to the Books department (Amazon i=stripbooks, eBay category 267). */
var BOOKS="\u00a7b\u00a7";
function affUrl(k,q){var id=affId(k);if(!id||!q)return"";var bk=String(q).indexOf(BOOKS)===0;if(bk)q=String(q).slice(BOOKS.length).trim();if(!q)return"";var e=encodeURIComponent(q);
 if(k==="amazon")return"https://www.amazon.com/s?k="+e+(bk?"&i=stripbooks":"")+"&tag="+encodeURIComponent(id);
 return"https://www.ebay.com/sch/i.html?_nkw="+e+"&_sacat="+(bk?"267":"0")+"&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid="+id+"&customid="+encodeURIComponent(String(AFF.ebayCustom||"cm").replace(/[^\w-]/g,"").slice(0,30))+"&toolid=10001&mkevt=1"}
/* One link to the preferred store (Amazon first, eBay if that is all that is set). */
function affLink(label,q,exact){var u=affUrl("amazon",q)||affUrl("ebay",q);if(!u)return"";return'<a href="'+esc(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+esc(label)+'</a>'}
/* Simple search box, kept for pages that only need "find one". Returns "" when no IDs are set. */
function affBox(name,maker,label){if(!affOn())return"";var q=affQ(name,maker),a=affUrl("amazon",q),e=affUrl("ebay",q);if(!q||!(a||e))return"";
 function ln(u,t){return u?'<li><a href="'+esc(u)+'" target="_blank" rel="sponsored noopener noreferrer">'+t+'</a></li>':""}
 return'<div class="affb"><h4 class="sub">'+esc(label||"Find one of your own")+'</h4><ul class="refs">'+ln(e,"Search eBay for "+esc(q))+ln(a,"Search Amazon for "+esc(q))+'</ul><p class="affd tn">'+esc(AFF_SHORT)+'</p></div>'}
/* Inline links for one line of text, such as a wanted accessory. */
function affInline(name,maker){if(!affOn())return"";var q=affQ(name,maker),a=affUrl("amazon",q),e=affUrl("ebay",q);if(!q)return"";
 return' <small class="affi">Find it: '+(e?'<a href="'+esc(e)+'" target="_blank" rel="sponsored noopener noreferrer">eBay</a>':"")+(e&&a?" &middot; ":"")+(a?'<a href="'+esc(a)+'" target="_blank" rel="sponsored noopener noreferrer">Amazon</a>':"")+'</small>'}
function affFooter(){var l=document.getElementById("affl");if(l)l.hidden=!affOn()}
function disclosurePage(){app.innerHTML='<section><h2>Affiliate disclosure</h2><p>'+esc(AFF_NOTE)+'</p><p>Questions about a link? Email <a href="mailto:'+EMAIL+'">'+EMAIL+'</a>.</p><p class="tn">Questions? Message Matt on any of the socials listed on the About page.</p></section>'}
document.addEventListener("DOMContentLoaded",affFooter);if(document.readyState!=="loading")affFooter();
