create table calendar_accounts (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
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
