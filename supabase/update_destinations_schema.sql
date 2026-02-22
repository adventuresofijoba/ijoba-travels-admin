-- 1. Ensure experiences column exists
alter table destinations
add column if not exists experiences text[] default '{}';

-- 2. Create storage bucket for destinations if it doesn't exist
insert into storage.buckets (id, name, public)
values ('destinations', 'destinations', true)
on conflict (id) do nothing;

-- 3. Create storage policies (using unique names)
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
