create extension if not exists "uuid-ossp";

create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'room', -- 'room' or 'bag'
  description text,
  image_url text,
  created_at timestamptz default now()
);

create table bags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location_id uuid references locations(id) on delete set null,
  description text,
  image_url text,
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
  status text default 'active', -- 'active', 'donated', or 'lost'
  location_id uuid references locations(id) on delete set null,
  bag_id uuid references bags(id) on delete set null,
  cleanliness text default 'clean', -- 'clean' or 'dirty'
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

create table calendar_accounts (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  access_token text not null,
  refresh_token text,
  token_expiry timestamptz,
  created_at timestamptz default now()
);

create table calendar_events (
  id uuid primary key default uuid_generate_v4(),
  calendar_account_id uuid references calendar_accounts(id) on delete cascade,
  google_event_id text not null,
  title text,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  location text,
  calendar_id text,
  is_all_day boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(calendar_account_id, google_event_id)
);

create table event_bags (
  id uuid primary key default uuid_generate_v4(),
  calendar_event_id uuid references calendar_events(id) on delete cascade,
  bag_id uuid references bags(id) on delete cascade,
  notes text,
  created_at timestamptz default now(),
  unique(calendar_event_id, bag_id)
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
