// Edits to timeline entries made from the Admin page (#/admin). Keyed by the entry's title.
// d date, k kind, p price, n note, s source, x extra detail (maker, dev, detail, specs).
// Catalog items link to an entry with their "tl" field and show its details where they have none of their own.
var TLE={};
function tlApplyEdits(E){window.TLBASE=window.TLBASE||{};Object.keys(E).forEach(function(t){var e=E[t],r=TL.filter(function(z){return z[2]===t})[0];if(!r)return;var X=(window.TLX=window.TLX||{});
 if(!TLBASE[t])TLBASE[t]={r:r.slice(),x:JSON.parse(JSON.stringify(X[t]||{}))};
 if(e.d!=null)r[0]=e.d;if(e.k)r[1]=e.k;if(e.p!=null)r[3]=e.p;if(e.n!=null)r[4]=e.n;if(e.s!=null)r[5]=e.s;
 if(e.x){var b=X[t]||(X[t]={});Object.keys(e.x).forEach(function(k){if(k==="specs")b.specs=Object.assign({},b.specs||{},e.x.specs);else b[k]=e.x[k]})}})}
tlApplyEdits(TLE);
