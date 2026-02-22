-- Add recommended_packages column to destinations table
alter table destinations
add column if not exists recommended_packages text[] default '{}';
