-- 1. DROP EXISTING TABLES (CLEAN SLATE)
-- Use this if you want to reset everything and start fresh.
drop table if exists inquiries;
drop table if exists packages;
drop table if exists destinations;
drop table if exists stories;

-- 2. CREATE TABLES

-- Destinations
create table destinations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  experiences text[]
);

-- Packages
create table packages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  destination_id uuid references destinations(id) not null,
  description text,
  price numeric,
  duration_days integer,
  duration_nights integer,
  image_urls text[],
  is_featured boolean default false,
  itinerary jsonb
);

-- Inquiries
create table inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null,
  phone_number text,
  inquiry_type text not null,
  status text default 'new',
  message text,
  preferred_destination text,
  travel_style text,
  budget_range text,
  travel_dates text
);

-- Stories
create table stories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  cover_image text,
  content text,
  author_name text,
  is_published boolean default false,
  published_at timestamp with time zone
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table destinations enable row level security;
alter table packages enable row level security;
alter table inquiries enable row level security;
alter table stories enable row level security;

-- 4. CREATE DEVELOPMENT POLICIES (OPEN ACCESS)
-- WARNING: These policies allow ANYONE with your API key to view and edit data.
-- We will secure this later when we build the Login page.

-- Destinations
create policy "Enable read access for all users" on destinations for select using (true);
create policy "Enable insert access for all users" on destinations for insert with check (true);
create policy "Enable update access for all users" on destinations for update using (true);
create policy "Enable delete access for all users" on destinations for delete using (true);

-- Packages
create policy "Enable read access for all users" on packages for select using (true);
create policy "Enable insert access for all users" on packages for insert with check (true);
create policy "Enable update access for all users" on packages for update using (true);
create policy "Enable delete access for all users" on packages for delete using (true);

-- Inquiries
create policy "Enable read access for all users" on inquiries for select using (true);
create policy "Enable insert access for all users" on inquiries for insert with check (true);
create policy "Enable update access for all users" on inquiries for update using (true);
create policy "Enable delete access for all users" on inquiries for delete using (true);

-- Stories
create policy "Enable read access for all users" on stories for select using (true);
create policy "Enable insert access for all users" on stories for insert with check (true);
create policy "Enable update access for all users" on stories for update using (true);
create policy "Enable delete access for all users" on stories for delete using (true);
