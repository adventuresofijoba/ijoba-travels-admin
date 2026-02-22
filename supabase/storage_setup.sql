-- Create a storage bucket for destinations
-- Note: We do NOT need 'create extension storage'. The storage schema is pre-installed.

insert into storage.buckets (id, name, public)
values ('destinations', 'destinations', true)
on conflict (id) do nothing;

-- Set up security policies for the destinations bucket

-- Allow public read access to all files in the destinations bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'destinations' );

-- Allow authenticated users (admins) to upload files
create policy "Authenticated Uploads"
on storage.objects for insert
with check ( bucket_id = 'destinations' and auth.role() = 'authenticated' );

-- Allow authenticated users to update their own files (or all files if admin)
create policy "Authenticated Updates"
on storage.objects for update
using ( bucket_id = 'destinations' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete files
create policy "Authenticated Deletes"
on storage.objects for delete
using ( bucket_id = 'destinations' and auth.role() = 'authenticated' );
