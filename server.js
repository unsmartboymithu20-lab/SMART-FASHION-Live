require("dotenv").config();
const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const path = require("path");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new PgSession({ pool, tableName: "session" }),
  secret: process.env.SESSION_SECRET || "development-only-change-me",
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 7 * 86400000 }
}));
app.use(express.static(path.join(__dirname, "public")));

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT DEFAULT 'Fashion',
      description TEXT DEFAULT '', price NUMERIC(12,2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0, image TEXT DEFAULT '',
      featured BOOLEAN DEFAULT FALSE, active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL, phone TEXT NOT NULL,
      address TEXT NOT NULL, city TEXT DEFAULT 'Bangladesh',
      items JSONB NOT NULL, subtotal NUMERIC(12,2) NOT NULL,
      delivery_charge NUMERIC(12,2) NOT NULL DEFAULT 80,
      total NUMERIC(12,2) NOT NULL, payment_method TEXT DEFAULT 'Cash on Delivery',
      status TEXT DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL
    );
  `);
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO admins(email,password_hash) VALUES($1,$2)
       ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
      [email.toLowerCase(), hash]
    );
  }
  const count = await pool.query("SELECT COUNT(*)::int AS n FROM products");
  if (count.rows[0].n === 0) {
    const demo = [
      ["Classic Cotton T-Shirt","Men","Soft everyday cotton t-shirt.",650,30,"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",true],
      ["Everyday Casual Shirt","Men","Smart casual shirt for daily wear.",1250,20,"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",true],
      ["Elegant Summer Dress","Women","Lightweight summer dress.",1850,15,"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",true],
      ["Minimal Sneakers","Shoes","Comfortable everyday sneakers.",2200,12,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",true],
      ["Classic Denim Jeans","Men","Versatile blue denim jeans.",1750,18,"https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",false],
      ["Women's Casual Top","Women","Easy-to-style casual top.",950,22,"https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800",false],
      ["Premium Polo Shirt","Men","Smart polo shirt for everyday use.",1100,16,"https://images.unsplash.com/photo-1625910513413-5fc3b3f6f8d8?w=800",false],
      ["Lightweight Hoodie","Unisex","Comfortable hoodie for cool days.",1950,14,"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",true],
      ["Women's Handbag","Accessories","A stylish everyday handbag.",1650,10,"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",false],
      ["Classic Wrist Watch","Accessories","Minimal design wrist watch.",2450,8,"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",false],
      ["Kids Printed T-Shirt","Kids","Soft printed t-shirt for kids.",450,25,"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",false],
      ["Kids Casual Sneakers","Kids","Lightweight kids sneakers.",1250,11,"https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800",false],
      ["Women's White Sneakers","Shoes","Clean everyday sneakers.",2100,9,"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",false],
      ["Formal Office Shirt","Men","A neat shirt for office and events.",1450,13,"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800",false],
      ["Women's Wide Leg Pants","Women","Relaxed fit wide-leg trousers.",1550,12,"https://images.unsplash.com/photo-1506629905607-d9c297d7a4f0?w=800",false],
      ["Canvas Backpack","Accessories","Everyday backpack with clean styling.",1350,17,"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",false],
      ["Summer Sunglasses","Accessories","Modern sunglasses for sunny days.",850,20,"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",false],
      ["Women's Knit Cardigan","Women","Soft knit layer for a relaxed look.",1850,7,"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800",false],
      ["Men's Casual Shorts","Men","Comfortable casual shorts.",900,19,"https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800",false],
      ["Classic Leather Belt","Accessories","Simple belt to complete your outfit.",700,21,"https://images.unsplash.com/photo-1624222247344-550fb8f7a2a4?w=800",false]
    ];
    for (const p of demo) await pool.query(
      "INSERT INTO products(name,category,description,price,stock,image,featured) VALUES($1,$2,$3,$4,$5,$6,$7)", p
    );
  }
  await pool.query(`INSERT INTO settings(key,value) VALUES
    ('store_name','SMART FASHION'),('delivery_charge','80'),('announcement','নতুন কালেকশন এসেছে!'),
    ('phone','01XXXXXXXXX'),('address','Bangladesh')
    ON CONFLICT(key) DO NOTHING`);
}
const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const adminOnly = (req,res,next) => req.session.admin ? next() : res.status(401).json({error:"Admin login required"});

app.get("/api/health", (req,res) => res.json({ok:true,store:"SMART FASHION"}));
app.get("/api/products", asyncRoute(async (req,res) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE active=true ORDER BY featured DESC, id DESC");
  res.json(rows);
}));
app.get("/api/settings", asyncRoute(async (req,res) => {
  const { rows } = await pool.query("SELECT key,value FROM settings");
  res.json(Object.fromEntries(rows.map(r=>[r.key,r.value])));
}));
app.post("/api/orders", asyncRoute(async (req,res) => {
  const { customer_name, phone, address, city, items, payment_method } = req.body;
  if (!customer_name || !phone || !address || !Array.isArray(items) || !items.length)
    return res.status(400).json({error:"নাম, ফোন, ঠিকানা ও পণ্য দিন।"});
  const ids = items.map(i=>Number(i.id)).filter(Number.isInteger);
  const { rows: products } = await pool.query("SELECT * FROM products WHERE id=ANY($1::int[]) AND active=true", [ids]);
  let normalized=[], subtotal=0;
  for (const item of items) {
    const p=products.find(x=>x.id===Number(item.id)), qty=Math.max(1,Math.min(20,Number(item.qty)||1));
    if (!p || p.stock < qty) return res.status(400).json({error:`${p?.name || "একটি পণ্য"} স্টকে পর্যাপ্ত নেই।`});
    normalized.push({id:p.id,name:p.name,price:Number(p.price),qty});
    subtotal += Number(p.price)*qty;
  }
  const s=await pool.query("SELECT value FROM settings WHERE key='delivery_charge'");
  const delivery=Number(s.rows[0]?.value || 80), total=subtotal+delivery;
  const client=await pool.connect();
  try {
    await client.query("BEGIN");
    const result=await client.query(
      `INSERT INTO orders(customer_name,phone,address,city,items,subtotal,delivery_charge,total,payment_method)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [customer_name,phone,address,city||"Bangladesh",JSON.stringify(normalized),subtotal,delivery,total,payment_method||"Cash on Delivery"]
    );
    for(const item of normalized) await client.query("UPDATE products SET stock=stock-$1 WHERE id=$2",[item.qty,item.id]);
    await client.query("COMMIT");
    res.json({success:true,order_id:result.rows[0].id,total});
  } catch(e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
}));
app.post("/api/admin/login", asyncRoute(async (req,res) => {
  const email=String(req.body.email||"").toLowerCase(), password=String(req.body.password||"");
  const {rows}=await pool.query("SELECT * FROM admins WHERE email=$1",[email]);
  if(!rows[0] || !(await bcrypt.compare(password,rows[0].password_hash)))
    return res.status(401).json({error:"Email অথবা password সঠিক নয়"});
  req.session.admin={id:rows[0].id,email:rows[0].email};
  res.json({success:true,email:rows[0].email});
}));
app.post("/api/admin/logout", (req,res)=>req.session.destroy(()=>res.json({success:true})));
app.get("/api/admin/me",(req,res)=>res.json({admin:req.session.admin||null}));
app.get("/api/admin/products",adminOnly,asyncRoute(async(req,res)=>{
  const {rows}=await pool.query("SELECT * FROM products ORDER BY id DESC"); res.json(rows);
}));
app.post("/api/admin/products",adminOnly,asyncRoute(async(req,res)=>{
  const p=req.body;
  if(!p.name || Number(p.price)<0) return res.status(400).json({error:"পণ্যের নাম ও সঠিক দাম দিন"});
  const {rows}=await pool.query(
    `INSERT INTO products(name,category,description,price,stock,image,featured,active)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [p.name,p.category||"Fashion",p.description||"",Number(p.price),Number(p.stock)||0,p.image||"",!!p.featured,p.active!==false]);
  res.json(rows[0]);
}));
app.put("/api/admin/products/:id",adminOnly,asyncRoute(async(req,res)=>{
  const p=req.body;
  const {rows}=await pool.query(
    `UPDATE products SET name=$1,category=$2,description=$3,price=$4,stock=$5,image=$6,featured=$7,active=$8
     WHERE id=$9 RETURNING *`,
    [p.name,p.category||"Fashion",p.description||"",Number(p.price),Number(p.stock)||0,p.image||"",!!p.featured,p.active!==false,req.params.id]);
  if(!rows[0]) return res.status(404).json({error:"Product not found"}); res.json(rows[0]);
}));
app.delete("/api/admin/products/:id",adminOnly,asyncRoute(async(req,res)=>{
  await pool.query("DELETE FROM products WHERE id=$1",[req.params.id]); res.json({success:true});
}));
app.get("/api/admin/orders",adminOnly,asyncRoute(async(req,res)=>{
  const {rows}=await pool.query("SELECT * FROM orders ORDER BY id DESC"); res.json(rows);
}));
app.patch("/api/admin/orders/:id",adminOnly,asyncRoute(async(req,res)=>{
  const allowed=["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled"];
  if(!allowed.includes(req.body.status)) return res.status(400).json({error:"Invalid status"});
  const {rows}=await pool.query("UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",[req.body.status,req.params.id]);
  res.json(rows[0]||{});
}));
app.get("/api/admin/overview",adminOnly,asyncRoute(async(req,res)=>{
  const [p,o,s]=await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM products"),
    pool.query("SELECT COUNT(*)::int AS count,COALESCE(SUM(total),0)::numeric AS revenue FROM orders"),
    pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status='Pending'")
  ]);
  res.json({products:p.rows[0].count,orders:o.rows[0].count,revenue:Number(o.rows[0].revenue),pending:s.rows[0].count});
}));
app.put("/api/admin/settings",adminOnly,asyncRoute(async(req,res)=>{
  const allowed=["store_name","delivery_charge","announcement","phone","address"];
  for(const k of allowed) if(req.body[k]!==undefined)
    await pool.query("INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value",[k,String(req.body[k])]);
  res.json({success:true});
}));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:"Server error. Render logs দেখুন।"});});

const port=process.env.PORT||3000;
initDb().then(()=>app.listen(port,()=>console.log(`SMART FASHION running on ${port}`)))
.catch(err=>{console.error("Database initialization failed:",err);process.exit(1);});
