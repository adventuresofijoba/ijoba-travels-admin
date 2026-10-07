-- Testimonials: admin-managed + public "Share your experience" submissions.
-- Run in the Supabase SQL Editor.

create table if not exists testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null check (char_length(name) between 2 and 80),
  destination text not null check (char_length(destination) between 2 and 80),
  trip_year integer not null check (trip_year between 1990 and 2100),
  quote text not null check (char_length(quote) between 20 and 1500),
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  source text not null default 'form' check (source in ('admin', 'form')),
  display_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_testimonials_status_order
  on testimonials (status, display_order, created_at);

alter table testimonials enable row level security;

-- Public: read approved only. Admins (authenticated, same as other tables): read all.
create policy "Approved testimonials are viewable by everyone"
  on testimonials for select
  using ( status = 'approved' or auth.role() = 'authenticated' );

-- Public: submit only as a pending form submission, with no photo or a photo
-- stored in our own bucket's testimonials/ folder.
create policy "Public can submit pending testimonials"
  on testimonials for insert
  to anon
  with check (
    status = 'pending'
    and source = 'form'
    and display_order = 0
    and (photo_url is null or photo_url like '%/storage/v1/object/public/destinations/testimonials/%')
  );

create policy "Admins can insert testimonials"
  on testimonials for insert
  to authenticated
  with check ( true );

create policy "Admins can update testimonials"
  on testimonials for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete testimonials"
  on testimonials for delete
  using ( auth.role() = 'authenticated' );

-- Database-level flood guard for public submissions (backs up the API rate limit,
-- since the anon key could be used to insert directly).
create or replace function testimonials_limit_form_submissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.source = 'form' and (
    select count(*) from testimonials
    where source = 'form' and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'Too many testimonial submissions, please try again later.';
  end if;
  return new;
end;
$$;

drop trigger if exists testimonials_limit_form_submissions on testimonials;
create trigger testimonials_limit_form_submissions
  before insert on testimonials
  for each row execute function testimonials_limit_form_submissions();

-- Photos reuse the existing public 'destinations' bucket under testimonials/.
-- Admin uploads use the existing authenticated storage policies.
-- Public uploads go through the website's /api/testimonials route (service role),
-- so no anonymous storage policy is needed.
