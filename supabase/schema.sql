create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  image_url text,
  parent_id text references public.categories(id) on delete set null,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text unique,
  category text not null,
  category_id text references public.categories(id) on delete set null,
  price numeric(10, 2) not null check (price > 0),
  base_price numeric(10, 2),
  weight text not null,
  rating numeric(2, 1) not null default 4.8,
  image_url text,
  images text[] not null default '{}',
  description text not null,
  ingredients text,
  nutrition_info jsonb,
  stock integer not null default 100,
  is_bestseller boolean not null default false,
  is_best_seller boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  price numeric(10, 2) not null check (price > 0),
  stock integer not null default 100,
  sku text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id text,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  order_status text not null default 'pending',
  subtotal numeric(10, 2) not null check (subtotal > 0),
  total_amount numeric(10, 2),
  currency text not null default 'INR',
  status text not null default 'pending',
  coupon_code text,
  razorpay_order_id text,
  customer jsonb,
  source text not null default 'web',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  price numeric(10, 2) not null,
  price_at_purchase numeric(10, 2),
  quantity integer not null check (quantity > 0),
  weight text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'customer';

alter table public.products add column if not exists slug text unique;
alter table public.products add column if not exists category_id text references public.categories(id) on delete set null;
alter table public.products add column if not exists base_price numeric(10, 2);
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists ingredients text;
alter table public.products add column if not exists nutrition_info jsonb;
alter table public.products add column if not exists stock integer not null default 100;
alter table public.products add column if not exists is_best_seller boolean not null default false;

alter table public.orders add column if not exists address_id uuid references public.addresses(id) on delete set null;
alter table public.orders add column if not exists payment_method text not null default 'cod';
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists order_status text not null default 'pending';
alter table public.orders add column if not exists total_amount numeric(10, 2);
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists razorpay_order_id text;

alter table public.order_items add column if not exists variant_id uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column if not exists price_at_purchase numeric(10, 2);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('flat', 'percent')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_order_value numeric(10, 2) not null default 0,
  expiry_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  video_url text,
  link_url text,
  position text not null default 'home',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "categories are public readable" on public.categories;
create policy "categories are public readable"
on public.categories for select
using (true);

drop policy if exists "products are public readable" on public.products;
create policy "products are public readable"
on public.products for select
using (is_active = true);

drop policy if exists "variants are public readable" on public.product_variants;
create policy "variants are public readable"
on public.product_variants for select
using (
  exists (
    select 1 from public.products
    where products.id = product_variants.product_id
    and products.is_active = true
  )
);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "users can manage own addresses" on public.addresses;
create policy "users can manage own addresses"
on public.addresses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can manage own cart" on public.cart_items;
create policy "users can manage own cart"
on public.cart_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can read own orders" on public.orders;
create policy "users can read own orders"
on public.orders for select
using (auth.uid() = user_id);

drop policy if exists "users can read own order items" on public.order_items;
create policy "users can read own order items"
on public.order_items for select
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

drop policy if exists "reviews are public readable" on public.reviews;
create policy "reviews are public readable"
on public.reviews for select
using (true);

drop policy if exists "users can create reviews" on public.reviews;
create policy "users can create reviews"
on public.reviews for insert
with check (auth.uid() = user_id);

drop policy if exists "active coupons are public readable" on public.coupons;
create policy "active coupons are public readable"
on public.coupons for select
using (is_active = true);

drop policy if exists "active banners are public readable" on public.banners;
create policy "active banners are public readable"
on public.banners for select
using (is_active = true);

drop policy if exists "inquiries can be submitted" on public.inquiries;
create policy "inquiries can be submitted"
on public.inquiries for insert
with check (true);

drop policy if exists "newsletter can be submitted" on public.newsletter_subscribers;
create policy "newsletter can be submitted"
on public.newsletter_subscribers for insert
with check (true);

insert into public.categories (id, name, slug, sort_order)
values
('banana-chips', 'Banana Chips', 'banana-chips', 1),
('traditional-chips', 'Traditional Chips', 'traditional-chips', 2),
('mixture', 'Mixture', 'mixture', 3),
('sweets', 'Sweets', 'sweets', 4)
on conflict (id) do nothing;

insert into public.products (id, name, category, price, weight, rating, description, is_bestseller, sort_order)
values
('a1-original-banana-chips-200g', 'A1 Original Banana Chips', 'Banana Chips', 120, '200 g', 4.9, 'Crisp salted banana chips inspired by the A1 Chips classic shelf.', true, 1),
('a1-masala-banana-chips-200g', 'A1 Masala Banana Chips', 'Banana Chips', 140, '200 g', 4.8, 'Tangy, spicy banana chips with a proper tea-time masala punch.', true, 2),
('a1-jackfruit-chips-200g', 'Jackfruit Chips', 'Traditional Chips', 160, '200 g', 4.7, 'Golden jackfruit chips for a South Indian snack-store feel.', false, 3)
on conflict (id) do nothing;

update public.products
set
  slug = coalesce(slug, id),
  category_id = case
    when category = 'Banana Chips' then 'banana-chips'
    when category = 'Traditional Chips' then 'traditional-chips'
    when category = 'Mixture' then 'mixture'
    when category = 'Sweets' then 'sweets'
    else category_id
  end,
  base_price = coalesce(base_price, price),
  is_best_seller = is_best_seller or is_bestseller;

insert into public.coupons (code, discount_type, discount_value, min_order_value, expiry_date)
values ('WELCOME10', 'percent', 10, 499, current_date + interval '180 days')
on conflict (code) do nothing;
