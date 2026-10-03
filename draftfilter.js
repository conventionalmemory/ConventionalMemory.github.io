/* Draft items stay in items.js (so the admin can edit them) but the public site never sees them.
   ALLITEMS = everything (stable catalog numbers); ITEMS = published only; DRAFTS = unpublished. */
var ALLITEMS=ITEMS.slice(),DRAFTS=ITEMS.filter(function(i){return i.draft}),ADMINVIEW=false;
ITEMS=ITEMS.filter(function(i){return !i.draft});
