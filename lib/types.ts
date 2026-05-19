export interface Location {
  id: string
  name: string
  type: 'room' | 'bag'
  description?: string
  created_at: string
}

export interface Bag {
  id: string
  name: string
  location_id?: string
  description?: string
  created_at: string
  location?: Location
}

export interface Item {
  id: string
  name: string
  brand?: string
  category?: string
  subcategory?: string
  color?: string
  size?: string
  gender?: string
  purchase_price?: number
  purchase_date?: string
  source: 'manual' | 'email_scan'
  product_url?: string
  image_url?: string
  notes?: string
  status: 'active' | 'donated'
  location_id?: string
  bag_id?: string
  gmail_message_id?: string
  created_at: string
  updated_at: string
  location?: Location
  bag?: Bag
}

export interface PriceAlert {
  id: string
  item_id: string
  product_url: string
  target_price: number
  is_active: boolean
  created_at: string
}

export interface Donation {
  id: string
  organization: string
  donation_date: string
  notes?: string
  receipt_image_url?: string
  total_estimated_value?: number
  created_at: string
  donation_items?: DonationItem[]
}

export interface DonationItem {
  id: string
  donation_id: string
  item_id: string
  estimated_value?: number
  item?: Item
}

export interface CalendarAccount {
  id: string
  email: string
  access_token: string
  refresh_token?: string
  token_expiry?: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  calendar_account_id: string
  google_event_id: string
  title?: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  calendar_id?: string
  is_all_day: boolean
  created_at: string
  updated_at: string
  calendar_account?: CalendarAccount
  event_bags?: EventBag[]
}

export interface EventBag {
  id: string
  calendar_event_id: string
  bag_id: string
  notes?: string
  created_at: string
  bag?: Bag
}

export const GENDERS = ["Men's", "Women's", "Unisex"]

export const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses & Jumpsuits',
  'Outerwear',
  'Shoes & Boots',
  'Accessories',
  'Swimwear',
  'Loungewear/PJs',
  'Underwear',
  'Socks',
  'Other',
]

export const SIZES = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '0', '2', '4', '6', '8', '10', '12', '14',
  '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10',
  'One Size',
]
