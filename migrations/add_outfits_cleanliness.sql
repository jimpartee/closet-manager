-- Cleanliness status on items
ALTER TABLE items ADD COLUMN IF NOT EXISTS cleanliness text DEFAULT 'clean';

-- Laundry Hamper location
INSERT INTO locations (name, type, description)
SELECT 'Laundry Hamper', 'room', 'Items waiting to be washed'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Laundry Hamper');

-- Saved outfits
CREATE TABLE IF NOT EXISTS saved_outfits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Items in a saved outfit
CREATE TABLE IF NOT EXISTS outfit_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id uuid REFERENCES saved_outfits(id) ON DELETE CASCADE,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(outfit_id, item_id)
);

-- Outfits assigned to calendar events
CREATE TABLE IF NOT EXISTS event_outfits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_event_id uuid REFERENCES calendar_events(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES saved_outfits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(calendar_event_id, outfit_id)
);
