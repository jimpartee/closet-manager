-- Add photo support to locations and bags
alter table locations add column if not exists image_url text;
alter table bags add column if not exists image_url text;

-- Add cleanliness field to items
alter table items add column if not exists cleanliness text default 'clean'; -- 'clean' or 'dirty'

-- Note: items.status is a text column and now supports 'active', 'donated', or 'lost'
