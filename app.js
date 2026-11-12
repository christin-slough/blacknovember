(function(){
"use strict";
var SITE="https://www.senegence.com";
var CODE="192358-15TU0M3F9M-15",PWS="superherolips";
var DISC=0.85;
var TIERS=[
 {at:50,t:"1 entry"},
 {at:100,t:"2 entries + $10 gift card"},
 {at:150,t:"3 entries + $15 gift card + free shipping"},
 {at:200,t:"4 entries + $20 gift card + free shipping"},
 {at:250,t:"5 entries + $25 gift card + free shipping"},
 {at:300,t:"6 entries + $30 gift card or a Lulu crossbody bag + free shipping"}
];
var $=function(s){return document.querySelector(s)};
var money=function(n){return "$"+(Math.round(n*100)/100).toFixed(2)};
var mine=function(n){return money(n*DISC)};
var clean=function(s){return String(s||"").replace(/[®™’]/g,function(c){return c==="’"?"'":""}).replace(/\s+/g," ").trim()};
function linkTo(handle){return SITE+"/discount/"+CODE+"?pws="+PWS+"&redirect=/products/"+handle}
function cartLink(items){return SITE+"/cart/"+items.map(function(i){return i.id+":"+i.q}).join(",")+"?discount="+CODE+"&pws="+PWS}
function el(tag,attrs,kids){var e=document.createElement(tag);for(var k in (attrs||{})){if(k==="text")e.textContent=attrs[k];else if(k==="html")e.innerHTML=attrs[k];else e.setAttribute(k,attrs[k])}(kids||[]).forEach(function(c){e.appendChild(c)});return e}

/* box */
var box={};
try{box=JSON.parse(localStorage.getItem("bn26box")||"{}")}catch(e){box={}}
function saveBox(){try{localStorage.setItem("bn26box",JSON.stringify(box))}catch(e){}}
function boxItems(){return Object.keys(box).map(function(k){return box[k]})}
function boxSpend(){return boxItems().reduce(function(s,i){return s+i.price*i.q},0)*DISC}
function count(){return boxItems().reduce(function(s,i){return s+i.q},0)}
function addToBox(v,p){var k=String(v.id);if(box[k])box[k].q+=1;else box[k]={id:v.id,q:1,price:parseFloat(v.price),title:clean(p.title),shade:v.title==="Default Title"?"":clean(v.title),handle:p.handle};saveBox();renderBar()}
function tierInfo(spend){var cur=null,next=null;TIERS.forEach(function(t){if(spend>=t.at)cur=t});for(var i=0;i<TIERS.length;i++){if(spend<TIERS[i].at){next=TIERS[i];break}}return{cur:cur,next:next}}
function renderBar(){
  var n=count(),w=$("#barwrap");
  if(!n){w.hidden=true;return}
  w.hidden=false;
  var s=boxSpend(),ti=tierInfo(s);
  var line="<b>"+n+" in my box</b> - "+money(s)+" after my 15%";
  if(ti.cur)line+="<br>Unlocked: "+ti.cur.t;if(ti.next)line+="<br>"+money(ti.next.at-s)+" more reaches $"+ti.next.at+": "+ti.next.t;else line+="<br>Top of the ladder. Nice.";
  $("#barText").innerHTML=line;
}
function openBox(){
  var sh=$("#sheet");if(sh.open)sh.close();
  var d=$("#boxd"),b=$("#boxBody");b.innerHTML="";
  var items=boxItems();
  var hd=el("div",{class:"hd"},[el("h2",{text:"My box"}),el("button",{class:"x",type:"button","aria-label":"Close",text:"×"})]);
  hd.querySelector(".x").onclick=function(){d.close()};
  b.appendChild(hd);
  if(!items.length){b.appendChild(el("p",{class:"empty",text:"Nothing here yet. Add a few favorites and I'll build one checkout for you."}))}
  items.forEach(function(i){
    var row=el("div",{class:"line"});
    row.appendChild(el("div",{html:"<b>"+esc(i.title)+"</b>"+(i.shade?"<br><span class='note'>"+esc(i.shade)+"</span>":"")+"<br><span class='note'>"+mine(i.price)+" each on my link</span>"}));
    var q=el("div",{class:"qty"});
    var m=el("button",{type:"button","aria-label":"One less",text:"−"}),p=el("button",{type:"button","aria-label":"One more",text:"+"});
    m.onclick=function(){box[i.id].q-=1;if(box[i.id].q<1)delete box[i.id];saveBox();renderBar();openBox()};
    p.onclick=function(){box[i.id].q+=1;saveBox();renderBar();openBox()};
    q.appendChild(m);q.appendChild(el("span",{text:String(i.q)}));q.appendChild(p);row.appendChild(q);b.appendChild(row);
  });
  if(items.length){
    var s=boxSpend(),ti=tierInfo(s),top=TIERS[TIERS.length-1].at;
    b.appendChild(el("div",{html:"<b>"+money(s)+"</b> after my 15% <span class='note'>(before tax and shipping)</span>"}));
    var m2=el("div",{class:"meter"},[el("i",{style:"width:"+Math.min(100,s/top*100)+"%"})]);b.appendChild(m2);
    b.appendChild(el("p",{class:"note",text:ti.cur?("You've unlocked the $"+ti.cur.at+" step: "+ti.cur.t+"."+(ti.next?" "+money(ti.next.at-s)+" more reaches the $"+ti.next.at+" step: "+ti.next.t+".":"")):("You're "+money(TIERS[0].at-s)+" from your first entry.")}));
    var a=el("a",{class:"btn",href:cartLink(items),rel:"noopener",text:"Check out with my 15%"});b.appendChild(a);
    b.appendChild(el("p",{class:"note",text:"This opens checkout on the shop with everything in your cart. Your free mystery mini is added there. The ladder adds up across the month."}));
    var clr=el("button",{class:"btn ghost small",type:"button",text:"Empty my box"});clr.onclick=function(){box={};saveBox();renderBar();d.close()};b.appendChild(clr);
  }
  if(!d.open)d.showModal();
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

/* product sheet */
function openSheet(p){
  var d=$("#sheet"),b=$("#sheetBody");b.innerHTML="";
  var vs=p.variants.filter(function(v){return v.available});
  var single=vs.length===1&&vs[0].title==="Default Title";
  var sel=single?vs[0]:null;
  var hd=el("div",{class:"hd"},[el("h2",{text:clean(p.title)}),el("button",{class:"x",type:"button","aria-label":"Close",text:"×"})]);
  hd.querySelector(".x").onclick=function(){d.close()};b.appendChild(hd);
  var img=p.images&&p.images[0]?p.images[0].src:"";
  if(img)b.appendChild(el("img",{src:img,alt:clean(p.title),style:"max-height:220px;object-fit:contain;margin:0 auto;background:#1b1b1d;width:100%"}));
  var info=el("div",{class:"price"});b.appendChild(info);
  var btns=el("div",{style:"display:flex;gap:10px;flex-wrap:wrap"});
  var add=el("button",{class:"btn",type:"button",text:"Add to my box"});
  var now=el("a",{class:"btn ghost",rel:"noopener",text:"Buy this one now"});
  function upd(){
    if(sel){info.innerHTML=mine(parseFloat(sel.price))+" on my 15% link"+(single?"":"<small>"+esc(clean(sel.title))+"</small>");add.disabled=false;add.style.opacity=1;now.href=cartLink([{id:sel.id,q:1}]);now.style.display=""}
    else{info.innerHTML="From "+mine(Math.min.apply(null,vs.map(function(v){return parseFloat(v.price)})))+" on my 15% link<small>Pick a shade below</small>";add.disabled=true;add.style.opacity=.4;now.style.display="none"}
  }
  if(!single){
    var chips=el("div",{class:"chips",role:"group","aria-label":"Shades in stock"});
    var draw=function(f){chips.innerHTML="";vs.filter(function(v){return !f||clean(v.title).toLowerCase().indexOf(f)>-1}).forEach(function(v){
      var c=el("button",{class:"chip",type:"button","aria-pressed":sel&&sel.id===v.id?"true":"false",text:clean(v.title)});
      c.onclick=function(){sel=v;draw(f);upd()};chips.appendChild(c)})};
    if(vs.length>12){var s=el("input",{type:"search",placeholder:"Search "+vs.length+" shades in stock","aria-label":"Search shades"});s.oninput=function(){draw(s.value.trim().toLowerCase())};b.appendChild(s)}
    b.appendChild(chips);draw("");
  }
  add.onclick=function(){if(!sel)return;addToBox(sel,p);add.textContent="Added ✓";setTimeout(function(){add.textContent="Add to my box"},1200)};
  btns.appendChild(add);btns.appendChild(now);b.appendChild(btns);
  b.appendChild(el("a",{class:"note",href:linkTo(p.handle),rel:"noopener",text:"See it on the shop with my 15% →"}));
  upd();d.showModal();
}

/* cards */
function priceOf(p){var a=p.variants.filter(function(v){return v.available}).map(function(v){return parseFloat(v.price)});return a.length?Math.min.apply(null,a):null}
function card(p){
  var a=p.variants.filter(function(v){return v.available});
  var many=a.length>1;
  var c=el("div",{class:"card"});
  var ph=el("div",{class:"ph"});if(p.images&&p.images[0])ph.appendChild(el("img",{src:p.images[0].src+(p.images[0].src.indexOf("?")>-1?"&":"?")+"width=480",alt:clean(p.title),loading:"lazy"}));c.appendChild(ph);
  var pr=priceOf(p);
  var bd=el("div",{class:"bd"},[el("h3",{text:clean(p.title)}),el("div",{class:"price",html:(many?"From ":"")+mine(pr)+"<small>on my 15% link"+(many?" - "+a.length+" in stock":"")+"</small>"})]);
  var b=el("button",{class:"btn",type:"button",text:many?"Choose a shade":"Add / details"});b.onclick=function(){openSheet(p)};
  bd.appendChild(b);c.appendChild(bd);return c;
}
function fill(id,list){var g=$(id);g.innerHTML="";if(!list.length){g.appendChild(el("p",{class:"empty",text:"Checking the shelves. Check back soon."}));return}list.forEach(function(p){g.appendChild(card(p))})}

/* classification */
var SKIP_T=/^(HairCare|Royal Reward|Supplies|Samples|Kit|Nails|Tools|Wellness|Top|T-Shirt|Jacket|Bag|Bathing Suit|Polo|Scarf|Dress|Purse|Blouse|BackPack)$/;
var SKIP_N=/hair|shampoo|conditioner|toothpaste|sleep|nail|repurchase|order$|free promotions|\(\d+% off\)|^🎁|kit\b|sample|retiring/i;
function ok(p){
  var t=clean(p.title);
  if(SKIP_T.test(p.product_type)||SKIP_N.test(t)||/^🎁/.test(p.title))return false;
  return p.variants.some(function(v){return v.available});
}
function isSet(p){return /collection|trio|duo|set\b|regimen|gift|bundle/i.test(clean(p.title))}

function featured(all){
  var pick=function(re){return all.filter(function(p){return re.test(p.handle+" "+p.title)}).filter(function(p){return p.variants.some(function(v){return v.available})})[0]};
  var list=[pick(/wrapped-in-luxe/i),pick(/milk.*cookies/i),pick(/blushed-rose/i),pick(/lip-butters/i),pick(/glowify-lip-oil-delectably/i),pick(/holiday-glow-gift-set/i)].filter(Boolean);
  var host=$("#featured");host.innerHTML="";
  return fetch(SITE+"/products/made-to-glow-box.js").then(function(r){return r.json()}).catch(function(){return null}).then(function(g){
    var sub=95;
    try{var a=g.variants[0].selling_plan_allocations[0];if(a&&a.price)sub=a.price/100}catch(e){}
    if(!g||g.available!==false){
      var c=el("div",{class:"card"});
      var ph=el("div",{class:"ph"});if(g&&g.featured_image)ph.appendChild(el("img",{src:(g.featured_image.indexOf("//")===0?"https:":"")+g.featured_image,alt:"Made to GLOW box"}));c.appendChild(ph);
      var bd=el("div",{class:"bd"},[el("h3",{text:"Made to GLOW box"}),el("div",{class:"price",html:money(sub)+" a month<small>Pick the monthly subscription on the next page. My 15% comes with the link.</small>"})]);
      bd.appendChild(el("a",{class:"btn",href:linkTo("made-to-glow-box"),rel:"noopener",text:"See the box"}));c.appendChild(bd);host.appendChild(c);
    }
    list.forEach(function(p){host.appendChild(card(p))});
  });
}

function loadAll(){
  var out=[],seen={};
  function page(n){
    return fetch(SITE+"/products.json?limit=250&page="+n).then(function(r){return r.json()}).then(function(j){
      var added=0;(j.products||[]).forEach(function(p){if(!seen[p.id]){seen[p.id]=1;out.push(p);added++}});
      if(added&&n<10)return page(n+1);
    });
  }
  return page(1).then(function(){return{products:out}});
}
function boot(){
  loadAll().then(function(j){
    var all=j.products.filter(ok);
    var used={};
    featured(j.products).then(function(){});
    var gifts=all.filter(function(p){return isSet(p)});
    var sets=[/wrapped-in-luxe/,/milk.*cookies/,/blushed-rose/,/lip-butters/,/glowify-lip-oil-delectably/,/holiday-glow-gift-set/];
    var inFeat=function(p){return sets.some(function(re){return re.test(p.handle)})};
    var rest=all.filter(function(p){return !inFeat(p)&&!/made-to-glow/.test(p.handle)});
    var tabs=[["Sets",function(){return gifts.filter(function(p){return !inFeat(p)})}],["Under $50",function(){return rest.filter(function(p){var x=priceOf(p);return x!==null&&x<=50&&!isSet(p)}).slice(0,16)}]];
    var tb=$("#giftTabs");
    var show=function(i){tb.querySelectorAll("button").forEach(function(b,k){b.setAttribute("aria-pressed",k===i?"true":"false")});fill("#giftGrid",tabs[i][1]())};
    tabs.forEach(function(t,i){var b=el("button",{type:"button","aria-pressed":"false",text:t[0]});b.onclick=function(){show(i)};tb.appendChild(b)});
    show(0);
    var FACE=/foundation|tinted moisturizer|color correcting|corrective|concealer|blush|bronzer|loose powder|pressed powder|primer|highlighter|pearlizer|illuminating|setting/i;
    var sec=function(p){
      var t=clean(p.title);
      if(isSet(p))return null;
      if(p.product_type==="Lips"||(p.product_type==="Multi-Use"&&!/serum|moistur/i.test(t)))return "lips";
      if(FACE.test(t)&&!/lip/i.test(t))return "face";
      if(/^Eyes$/.test(p.product_type))return "eyes";
      if(/^Face$/.test(p.product_type))return "face";
      if(/^(Treatments|Moisturizers|Bath&Body|Remover|Cleanser|Masks)$/.test(p.product_type))return "skin";
      return null;
    };
    var groups={lips:[],eyes:[],face:[],skin:[]};
    rest.forEach(function(p){var k=sec(p);if(k)groups[k].push(p)});
    var order=function(a,b){var rank=function(p){return /liquid lip color|original foundation|color correcting tinted|eyeshadow/i.test(p.title)?0:1};return rank(a)-rank(b)};
    Object.keys(groups).forEach(function(k){groups[k].sort(order);fill("#g-"+k,groups[k])});
    $("#stamp").textContent="Checked "+new Date().toLocaleString("en-US",{weekday:"short",month:"numeric",day:"numeric",hour:"numeric",minute:"2-digit"});
  }).catch(function(){
    ["#giftGrid","#g-lips","#g-eyes","#g-face","#g-skin"].forEach(function(id){var g=$(id);g.innerHTML="";g.appendChild(el("p",{class:"empty",text:"The shelves are slow to load. Refresh, or tap below to shop everything with my 15%."}))});
    $("#featured").innerHTML="";
    $("#featured").appendChild(el("a",{class:"btn",href:SITE+"/discount/"+CODE+"?pws="+PWS,rel:"noopener",text:"Shop with my 15%"}));
  });
}
function ladder(){
  var h=$("#ladderRows");
  var gc={100:10,150:15,200:20,250:25,300:30};
  TIERS.forEach(function(t){
    var row=el("div",{class:"row"+(t.at===300?" bag":"")});
    row.appendChild(el("span",{class:"amt",text:"$"+t.at}));
    var txt=t.t;
    var rw=el("span",{class:"reward"});
    if(t.at===300){
      rw.appendChild(el("b",{text:"6 entries + free shipping + YOUR CHOICE"}));
      rw.appendChild(el("small",{text:"A $30 gift card, or the Lulu crossbody bag: the quilted black one with gold zippers."}));
    }else{
      rw.appendChild(el("b",{text:t.t.replace(" gift card"," gift card")}));
    }
    row.appendChild(rw);
    if(t.at===300){row.appendChild(el("img",{class:"bagimg",src:"https://i.brd.so/athreFStJD43fZWtstfq37N9hr1o.png",alt:"Lulu crossbody bag",loading:"lazy"}))}
    else if(gc[t.at]){row.appendChild(el("span",{class:"gc",text:"$"+gc[t.at],"aria-hidden":"true"}))}
    else row.appendChild(el("span"));
    h.appendChild(row);
  });
}
function promo(){fetch("promo.json?"+Date.now()).then(function(r){return r.json()}).then(function(j){var h=$("#promo");(j.corporate||[]).forEach(function(x){h.appendChild(el("div",{class:"promo"},[el("span",{class:"label",text:"New from corporate"}),el("h3",{text:x.title}),el("p",{class:"sub",text:x.body}),x.link?el("a",{class:"btn small",href:x.link,rel:"noopener",text:x.cta||"Shop it"}):el("span")]))})}).catch(function(){})}
$("#openBox").onclick=openBox;
ladder();promo();renderBar();boot();
})();
