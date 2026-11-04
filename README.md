# SMART FASHION — Deploy to GitHub + Render

বাংলাদেশি ফ্যাশন ই-কমার্সের একটি responsive starter project। এতে customer storefront, cart, checkout (Cash on Delivery), product management, order management, store settings এবং admin login আছে।

## 1. যা লাগবে
- GitHub account
- Render account
- Render PostgreSQL database

## 2. GitHub-এ Upload
1. ZIP extract করুন।
2. GitHub-এ `smart-fashion` নামে নতুন repository তৈরি করুন।
3. Extract করা folder-এর সব file repository-তে upload/push করুন।

## 3. Render Database তৈরি
1. Render Dashboard → New → PostgreSQL.
2. Database তৈরি হলে Internal Database URL কপি করুন (Web Service একই Render region-এ রাখুন)।

## 4. Render Web Service
1. Render Dashboard → New → Web Service → GitHub repository connect.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables যোগ করুন:
   - `DATABASE_URL` = Render PostgreSQL Internal Database URL
   - `DB_SSL` = `true` (যদি Render DB connection-এ SSL লাগে; connection issue হলে Render DB নির্দেশনা অনুযায়ী সেট করুন)
   - `SESSION_SECRET` = দীর্ঘ random secret
   - `ADMIN_EMAIL` = আপনার admin email
   - `ADMIN_PASSWORD` = শক্তিশালী admin password
   - `NODE_ENV` = `production`
5. Deploy করুন। প্রথমবার চালু হলে database table ও demo product তৈরি হবে।

`render.yaml` ব্যবহার করলে Blueprint deploy-ও করা যাবে। `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` নিজে Render-এ দিতে হবে।

## 5. Admin Panel
Live site-এর শেষে `/admin` দিন:
`https://YOUR-SERVICE.onrender.com/admin`

Login email/password হবে Render Environment Variables-এ দেওয়া `ADMIN_EMAIL` এবং `ADMIN_PASSWORD`। Admin password পরিবর্তন করতে Render Environment Variables-এ নতুন password দিন এবং redeploy/restart করুন। একই email-এর password startup-এ update হয়।

## 6. Store features
- Product add/edit/delete, category, stock, image URL, featured ও visibility
- Order list ও status update
- Store name, announcement, delivery charge, phone, address
- Checkout-এ Cash on Delivery
- bKash/Nagad option আপাতত customer-এর payment preference হিসেবে রাখা হয়েছে; automatic payment collection চালু নয়। এর জন্য merchant account/API credentials এবং payment gateway integration প্রয়োজন।

## Important before going live
- `SESSION_SECRET` অবশ্যই নিজের long random value দিন।
- Admin email/password কাউকে দেবেন না।
- Demo products/images replace করুন।
- Privacy policy, return/refund policy, delivery policy এবং business contact তথ্য যোগ করুন।
- Production launch-এর আগে backup, rate limiting, CSRF protection, image upload storage, order notifications এবং payment gateway integration যোগ করা উচিত।
- Free Render services/database-এর sleep/expiry/backup সীমাবদ্ধতা থাকতে পারে; Render-এর বর্তমান plan details দেখে নিন।

## Local run
```bash
npm install
# .env.example কপি করে .env বানান এবং DATABASE_URL ও admin credentials দিন
npm start
```
Open `http://localhost:3000`.
