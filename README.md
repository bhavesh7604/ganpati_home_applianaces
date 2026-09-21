# Ganpati Home Appliances: online store

Next.js 15 + Supabase + Tailwind. Customers can browse, search, add to cart and place cash-on-delivery orders
(no account needed). You manage products, prices, photos and orders from `/admin`.

## What is included

- Storefront: home (3D hero), shop with categories, brand filter, search and sorting, product pages, cart, checkout,
  order confirmation, order tracking (order number + mobile), customer login and "My orders".
- Admin (`/admin`): dashboard, **quick price/MRP/stock editing for every product**, full product editor with photo upload,
  orders with status updates (stock is restored on cancel/return), categories.
- Pages: 7-day return policy, shipping and delivery, contact.
- 126 products from the PRIDE and RAJAT catalogues, already loaded by `supabase/seed.sql`.
  **They have no prices.** The catalogues do not contain prices, so the site shows "Price on request" with a
  WhatsApp enquiry button until you set a price in the admin. Products with a price can be bought.
- Security: prices and stock are re-read from the database when an order is placed, so a customer cannot change a price
  in the browser. Orders can only be created through the `create_order` database function.

## Setup (about 15 minutes)

1. **Create a Supabase project** at supabase.com (free plan is fine).
2. In **SQL Editor**, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key
   (Supabase > Project Settings > API).
4. `npm install` then `npm run dev`, open http://localhost:3000.
5. **Make yourself admin:** open the site, go to *Log in > Create an account* with your email.
   (If Supabase asks you to confirm the email, confirm it first.) Then in the SQL Editor run:

   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'bhaveshmali9116@gmail.com');
   ```
6. Log in and open `/admin`. Start with **Products > filter "No price set"** and enter prices.
7. Add photos: open a product > *Upload photos*. Photos are stored in the public `product-images` bucket
   (created by schema.sql).

## Deploy (Vercel)

Push to GitHub, import the repo in Vercel, add the same environment variables
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) and deploy.
In Supabase > Authentication > URL Configuration, set the Site URL to your live address.

## Changing store details, policies, and catalogue

- Phone, WhatsApp, email, address, return days: `src/lib/config.ts`.
- Return and shipping wording: `src/app/policies/[slug]/page.tsx`.
- Regenerate the seed after editing catalogue data: `python3 scripts/make_seed.py`
  (safe to re-run in Supabase; existing products are not overwritten).

## Not built yet (suggested next steps)

Online payments (Razorpay/UPI), automatic shipping charges by pincode, GST invoices, order emails/WhatsApp alerts,
CSV bulk price upload, customer reviews.
