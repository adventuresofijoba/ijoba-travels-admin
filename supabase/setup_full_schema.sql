-- Full Database Setup Script for Ijoba Travels
-- Run this script in your Supabase SQL Editor to set up the entire schema.

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Storage Buckets
-- We use a single 'destinations' bucket for all images (destinations, packages, stories)
insert into storage.buckets (id, name, public)
values ('destinations', 'destinations', true)
on conflict (id) do nothing;

-- Storage Policies
-- Allow public access to view images
create policy "Public Access Destinations"
on storage.objects for select
to public
using ( bucket_id = 'destinations' );

-- Allow authenticated users to upload images
create policy "Auth Upload Destinations"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'destinations' );

-- Allow authenticated users to update images
create policy "Auth Update Destinations"
on storage.objects for update
to authenticated
using ( bucket_id = 'destinations' );

-- Allow authenticated users to delete images
create policy "Auth Delete Destinations"
on storage.objects for delete
to authenticated
using ( bucket_id = 'destinations' );


-- 3. Create Tables

-- Destinations Table
create table if not exists destinations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  experiences jsonb default '[]'::jsonb,
  why_visit_description text,
  why_visit_image_url text,
  recommended_packages text[] default '{}',
  region text
);

-- Index for region
create index if not exists idx_destinations_region on destinations(region);

-- Packages Table
create table if not exists packages (
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
  timeline jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb
);

-- Inquiries Table
create table if not exists inquiries (
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

-- Stories Table
create table if not exists stories (
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

-- 4. Enable Row Level Security (RLS)
alter table destinations enable row level security;
alter table packages enable row level security;
alter table inquiries enable row level security;
alter table stories enable row level security;

-- 5. Create RLS Policies

-- Destinations Policies
create policy "Public destinations are viewable by everyone"
  on destinations for select
  using ( true );

create policy "Admins can insert destinations"
  on destinations for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update destinations"
  on destinations for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete destinations"
  on destinations for delete
  using ( auth.role() = 'authenticated' );

-- Packages Policies
create policy "Public packages are viewable by everyone"
  on packages for select
  using ( true );

create policy "Admins can insert packages"
  on packages for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update packages"
  on packages for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete packages"
  on packages for delete
  using ( auth.role() = 'authenticated' );

-- Inquiries Policies
create policy "Admins can view all inquiries"
  on inquiries for select
  using ( auth.role() = 'authenticated' );

create policy "Public can submit inquiries"
  on inquiries for insert
  with check ( true );

create policy "Admins can update inquiries"
  on inquiries for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete inquiries"
  on inquiries for delete
  using ( auth.role() = 'authenticated' );

-- Stories Policies
create policy "Public stories are viewable by everyone"
  on stories for select
  using ( is_published = true or auth.role() = 'authenticated' );

create policy "Admins can insert stories"
  on stories for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update stories"
  on stories for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete stories"
  on stories for delete
  using ( auth.role() = 'authenticated' );
