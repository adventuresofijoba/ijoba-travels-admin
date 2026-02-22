

-- Create a table for Inquiries (Contact Us & Custom Packages)
create table inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text not null,
  phone_number text,
  inquiry_type text not null, -- 'contact' or 'custom_package'
  status text default 'new', -- 'new', 'contacted', 'closed'
  message text,
  
  -- Fields for Custom Package
  preferred_destination text,
  travel_style text,
  budget_range text,
  travel_dates text
);

-- Create a table for Stories (Blog)
create table stories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  cover_image text,
  content text, -- Rich text HTML or Markdown
  author_name text,
  is_published boolean default false,
  published_at timestamp with time zone
);

-- RLS for Inquiries
alter table inquiries enable row level security;

create policy "Admins can view inquiries"
  on inquiries for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update inquiries"
  on inquiries for update
  using ( auth.role() = 'authenticated' );

-- Allow public to insert inquiries (so the website can submit forms)
create policy "Public can submit inquiries"
  on inquiries for insert
  with check ( true );

-- RLS for Stories
alter table stories enable row level security;

create policy "Public can view published stories"
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
