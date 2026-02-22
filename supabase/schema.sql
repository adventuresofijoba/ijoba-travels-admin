-- Create a table for Destinations
create table destinations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  experiences text[] -- Array of strings for key experiences
);

-- Create a table for Packages
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
  timeline jsonb default '[]'::jsonb -- Structure: [{ date: "March 23, 2025", title: "Arrival", description: "..." }]
);

-- Enable Row Level Security (RLS)
alter table destinations enable row level security;
alter table packages enable row level security;

-- Create policies (modify as needed for your auth setup)
-- For now, allow public read access
create policy "Public destinations are viewable by everyone"
  on destinations for select
  using ( true );

create policy "Public packages are viewable by everyone"
  on packages for select
  using ( true );

-- Allow authenticated users (admins) to insert/update/delete
create policy "Admins can insert destinations"
  on destinations for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update destinations"
  on destinations for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete destinations"
  on destinations for delete
  using ( auth.role() = 'authenticated' );

-- Same for packages
create policy "Admins can insert packages"
  on packages for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update packages"
  on packages for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete packages"
  on packages for delete
  using ( auth.role() = 'authenticated' );
