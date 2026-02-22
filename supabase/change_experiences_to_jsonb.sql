-- Change experiences column from text[] to jsonb
-- We'll drop the old column and add a new one since the type is completely different
alter table destinations
drop column if exists experiences;

alter table destinations
add column experiences jsonb default '[]'::jsonb;
