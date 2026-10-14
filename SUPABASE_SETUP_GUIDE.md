# 🗄️ Drobe Ahmedabad Darkstore - Supabase Database Setup Guide

Everything in the codebase is **100% wired and ready**. Follow these 3 simple steps tonight when you want to connect your live Supabase cloud database:

---

### Step 1: Create a Free Project on Supabase
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **"New Project"**.
3. Name it **`drobe-darkstore-ahmedabad`**, set your database password, and pick a region near India (e.g. `ap-south-1 Mumbai` or `Singapore`).
4. Click **"Create new project"** (takes ~1 minute).

---

### Step 2: Run the Master SQL Script
1. In your Supabase Dashboard, click on **"SQL Editor"** (icon in the left navigation sidebar).
2. Click **"New query"**.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) in this repository, copy the **entire file contents**, and paste it into the Supabase SQL editor.
4. Click the green **"Run"** button (or press `Ctrl + Enter`).
5. You'll see: **`Success. No rows returned`**.

All 8 tables, indexes, triggers, auto-update timestamps, realtime channels, and pre-seeded data are now live!
- `drobe_warehouses` (Ahmedabad Central Hub at Shivam Bungalows 1, Koteshwar Road)
- `drobe_warehouse_shelves` (Rack matrix: Zone A, B, C, D)
- `drobe_brands` (CHANEL, Underrated Club, Atelier Nova)
- `drobe_products` (SKU DR1, DR2, DR3, DR4 with shelf tags & prices)
- `drobe_runners` (Meet Dave, Jay Suthar, Karan Shah, Aarav Patel, Hardik Vaghela)
- `drobe_trial_orders` (Incoming & active 30-min trial orders with phone, address, and live SLA timers)
- `drobe_inbound_shipments` (Consignment shipments from ateliers)
- `drobe_order_events` (Full audit trail)

---

### Step 3: Add Credentials to `.env.local`
1. In your Supabase Dashboard, click on **"Project Settings"** (gear icon) -> **"API"**.
2. Copy:
   - **Project URL**
   - **Project API Keys (`anon` / `public`)**
3. Open or create `.env.local` in this project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

The app will automatically detect your Supabase credentials via [`app/lib/supabaseClient.ts`](./app/lib/supabaseClient.ts) and sync all real-time order diversions, shelf allocations, and delivery runner auto-fetches to the cloud!

---

### 🛡️ Dual-Mode Resilience
Even before you connect Supabase at night, the entire application runs with **zero downtime or crashes** using the local reactive storage engine in [`app/lib/darkstoreData.ts`](./app/lib/darkstoreData.ts). Once you paste your keys, it automatically upgrades to Supabase!
