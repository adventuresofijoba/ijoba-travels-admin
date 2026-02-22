-- Add region column to destinations table
ALTER TABLE destinations ADD COLUMN region text;

-- Add index for performance
CREATE INDEX idx_destinations_region ON destinations(region);

-- Example updates (you should run these based on your actual data)
-- UPDATE destinations SET region = 'Europe' WHERE name IN ('France', 'Italy', 'Spain', 'Germany');
-- UPDATE destinations SET region = 'Asia' WHERE name IN ('Japan', 'Thailand', 'Vietnam');
-- UPDATE destinations SET region = 'Africa' WHERE name IN ('Kenya', 'South Africa', 'Morocco');
-- UPDATE destinations SET region = 'North America' WHERE name IN ('USA', 'Canada', 'Mexico');
-- UPDATE destinations SET region = 'South America' WHERE name IN ('Brazil', 'Argentina', 'Peru');
