let products=[],cart=JSON.parse(localStorage.getItem("sf_cart")||"[]");
const money=n=>"৳"+Number(n||0).toLocaleString("en-BD");
async function loadStore(){
 const [p,s]=await Promise.all([fetch("/api/products").then(r=>r.json()),fetch("/api/settings").then(r=>r.json())]);
 products=p;document.title=(s.store_name||"SMART FASHION")+" | Online Fashion Store";
 document.querySelector(".logo").innerHTML=(s.store_name||"SMART FASHION").replace(" ","<span>")+"</span>";
 document.getElementById("announcement").textContent=s.announcement||"";
 document.getElementById("year").textContent=new Date().getFullYear();
 renderProducts();renderCart();
}
function renderProducts(){document.getElementById("productsGrid").innerHTML=products.length?products.map(p=>`<article class="product-card"><img class="product-image" src="${esc(p.image||"https://images.unsplash.com/photo-1445205170230-053b83016050?w=700")}" alt="${esc(p.name)}" onerror="this.src='https://images.unsplash.com/photo-1445205170230-053b83016050?w=700'"><h3>${esc(p.name)}</h3><p>${esc(p.category||"Fashion")}</p><div class="product-bottom"><b>${money(p.price)}</b><button class="add-btn" onclick="addCart(${p.id})">ADD +</button></div></article>`).join(""):"<p>এখনো কোনো পণ্য যোগ করা হয়নি।</p>"}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function saveCart(){localStorage.setItem("sf_cart",JSON.stringify(cart));renderCart()}
function addCart(id){let x=cart.find(i=>i.id===id);if(x)x.qty++;else cart.push({id,qty:1});saveCart();toggleCart(true)}
function renderCart(){document.getElementById("cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0);let lines=cart.map(i=>{let p=products.find(x=>x.id===i.id);return p?`<div class="cart-line"><span>${esc(p.name)} × ${i.qty}</span><b>${money(p.price*i.qty)} <button onclick="removeCart(${i.id})">✕</button></b></div>`:""}).join("");document.getElementById("cartItems").innerHTML=lines||"<p>আপনার Cart খালি।</p>";document.getElementById("cartTotal").textContent="Subtotal: "+money(cart.reduce((a,i)=>a+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0))}
function removeCart(id){cart=cart.filter(i=>i.id!==id);saveCart()}
function toggleCart(force){let open=force??!document.getElementById("cart").classList.contains("open");document.getElementById("cart").classList.toggle("open",open);document.getElementById("overlay").classList.toggle("open",open)}
function checkout(){if(!cart.length)return alert("প্রথমে পণ্য Cart-এ যোগ করুন");toggleCart(false);document.getElementById("checkoutModal").classList.add("show")}
function closeCheckout(){document.getElementById("checkoutModal").classList.remove("show")}
document.getElementById("checkoutForm").addEventListener("submit",async e=>{e.preventDefault();let data=Object.fromEntries(new FormData(e.target));data.items=cart;let msg=document.getElementById("checkoutMessage");msg.textContent="অর্ডার পাঠানো হচ্ছে...";let r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}),j=await r.json();if(!r.ok){msg.textContent=j.error||"অর্ডার করা যায়নি";return}cart=[];saveCart();e.target.reset();msg.textContent=`ধন্যবাদ! আপনার Order #${j.order_id} সফলভাবে নেওয়া হয়েছে। মোট ${money(j.total)}।`;});
loadStore().catch(()=>document.getElementById("productsGrid").textContent="পণ্য লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।");