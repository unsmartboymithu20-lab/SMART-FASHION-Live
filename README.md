# SMART FASHION — GitHub + Render

এই project-এ responsive customer store, cart, Cash on Delivery checkout, Admin Panel, ২০টি starter product, product management, order management ও store settings আছে।

## GitHub
1. ZIP Extract করুন।
2. GitHub-এ `smart-fashion` নামে repository খুলুন।
3. Extract করা folder-এর ভেতরের সব file upload করুন (ZIP file নয়)।

## Render PostgreSQL
1. https://dashboard.render.com → New + → PostgreSQL।
2. Database তৈরি করে Internal Database URL কপি করুন।

## Render Web Service
1. New + → Web Service → GitHub repository connect করুন।
2. Build Command: `npm install`; Start Command: `npm start`।
3. Environment Variables যোগ করুন:
   - `DATABASE_URL` = Render PostgreSQL Internal Database URL
   - `DB_SSL` = `true`
   - `NODE_ENV` = `production`
   - `ADMIN_EMAIL` = আপনার login email
   - `ADMIN_PASSWORD` = আপনার শক্তিশালী password
   - `SESSION_SECRET` = নিজের লম্বা random secret
4. Save Changes → Manual Deploy → Deploy latest commit.

## Admin Login
Deploy সফল হলে `https://YOUR-SERVICE.onrender.com/admin` খুলুন।
Login email/password হবে `ADMIN_EMAIL` এবং `ADMIN_PASSWORD`।

## ২০টি পণ্য
নতুন/খালি database-এ প্রথমবার চালু হলে ২০টি sample product নিজে থেকেই যোগ হবে। Admin Panel → Products থেকে পণ্যের নাম, দাম, stock, category ও image URL edit করতে পারবেন। আগে থেকেই product থাকা database-এ seed আবার হবে না।

## সীমাবদ্ধতা
bKash/Nagad এখন payment preference মাত্র; automatic payment collection চালু নয়। এর জন্য merchant API credentials ও gateway integration প্রয়োজন। Sample images নিজের পণ্যের ছবি দিয়ে বদলান। Production চালুর আগে privacy/return/delivery policy, order notification, image storage, security hardening ও backup যোগ করুন। Render free plan-এর sleep/database retention সীমা থাকতে পারে; current plan details যাচাই করুন।
