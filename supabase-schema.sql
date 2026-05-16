create extension if not exists "uuid-ossp";

create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'room', -- 'room' or 'bag'
  description text,
  created_at timestamptz default now()
);

create table bags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location_id uuid references locations(id) on delete set null,
  description text,
  created_at timestamptz default now()
);

create table items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text,
  category text,
  subcategory text,
  color text,
  size text,
  gender text, -- 'Men''s', 'Women''s', or 'Unisex'
  purchase_price numeric(10,2),
  purchase_date date,
  source text default 'manual', -- 'manual' or 'email_scan'
  product_url text,
  image_url text,
  notes text,
  status text default 'active', -- 'active' or 'donated'
  location_id uuid references locations(id) on delete set null,
  bag_id uuid references bags(id) on delete set null,
  gmail_message_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table price_alerts (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references items(id) on delete cascade,
  product_url text not null,
  target_price numeric(10,2) not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table donations (
  id uuid primary key default uuid_generate_v4(),
  organization text not null,
  donation_date date not null,
  notes text,
  receipt_image_url text,
  total_estimated_value numeric(10,2),
  created_at timestamptz default now()
);

create table donation_items (
  id uuid primary key default uuid_generate_v4(),
  donation_id uuid references donations(id) on delete cascade,
  item_id uuid references items(id) on delete cascade,
  estimated_value numeric(10,2)
);

create table email_scans (
  id uuid primary key default uuid_generate_v4(),
  scanned_at timestamptz default now(),
  emails_processed integer default 0,
  items_found integer default 0,
  status text default 'completed'
);

-- Default data
insert into locations (name, type, description) values
  ('Bed Closet', 'room', 'Main bedroom closet'),
  ('Bathroom Closet', 'room', 'Bathroom storage'),
  ('Office', 'room', 'Office/workspace storage');

insert into bags (name, description) values
  ('Tumi Roller Bag', 'Large rolling travel bag'),
  ('Black Hanging Bag', 'Garment hanging bag'),
  ('Black Steve Madden Quilted Bag', 'Quilted carry bag');
