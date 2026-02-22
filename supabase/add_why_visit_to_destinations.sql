-- Add why_visit_description and why_visit_image_url columns to destinations table
alter table destinations
add column if not exists why_visit_description text,
add column if not exists why_visit_image_url text;
