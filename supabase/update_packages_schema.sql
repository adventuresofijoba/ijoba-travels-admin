-- Add missing columns to packages table based on frontend requirements
alter table packages
add column if not exists destination text,
add column if not exists timeline jsonb default '[]'::jsonb,
add column if not exists features jsonb default '[]'::jsonb;

-- Make destination_id nullable if it exists, as frontend uses 'destination' string
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'packages' and column_name = 'destination_id') then
    alter table packages alter column destination_id drop not null;
  end if;
end $$;
