-- Seed 5 dummy destinations with rich content
-- Uses ON CONFLICT to update existing records if they exist

insert into destinations (
  name,
  slug,
  description,
  image_url,
  is_active,
  experiences,
  why_visit_description,
  why_visit_image_url,
  recommended_packages
) values
-- 1. Japan
(
  'Japan',
  'japan',
  'A land where ancient traditions fuse with modern life. Explore Kyoto''s temples, Tokyo''s neon streets, and the serene beauty of Mount Fuji.',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000',
  true,
  array[
    '{"name": "Tea Ceremony", "image_url": "https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Cherry Blossoms", "image_url": "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Bullet Train", "image_url": "https://images.unsplash.com/photo-1532517891316-72a08e5c03a7?auto=format&fit=crop&q=80&w=800"}'
  ],
  'Japan offers a unique blend of old and new. You can visit centuries-old temples in the morning and shop in futuristic electronics districts in the afternoon. The food is incredible, the people are polite, and the scenery is breathtaking.',
  'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&q=80&w=1000',
  '{}'
),
-- 2. Tanzania
(
  'Tanzania',
  'tanzania',
  'Home to the Serengeti, Mount Kilimanjaro, and the exotic island of Zanzibar. The ultimate destination for wildlife safaris and beach relaxation.',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
  true,
  array[
    '{"name": "Game Drive", "image_url": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Kilimanjaro Trek", "image_url": "https://images.unsplash.com/photo-1650664326577-432882202685?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Zanzibar Beaches", "image_url": "https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&q=80&w=800"}'
  ],
  'Experience the Great Migration in the Serengeti, climb the highest peak in Africa, or relax on the pristine white sands of Zanzibar. Tanzania is the quintessential African adventure.',
  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&q=80&w=1000',
  '{}'
),
-- 3. Italy
(
  'Italy',
  'italy',
  'From the art of Florence to the ruins of Rome and the canals of Venice. Italy is a feast for the senses with its history, culture, and cuisine.',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=1000',
  true,
  array[
    '{"name": "Gondola Ride", "image_url": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Colosseum Tour", "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Pizza Making", "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"}'
  ],
  'Italy is the birthplace of the Renaissance and the Roman Empire. Every city is an open-air museum. Enjoy world-class art, architecture, and food in one of the most beautiful countries in the world.',
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&q=80&w=1000',
  '{}'
),
-- 4. Indonesia
(
  'Indonesia',
  'indonesia',
  'A tropical paradise of thousands of islands. Famous for Bali''s beaches, temples, and vibrant culture, as well as Komodo dragons and volcanoes.',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
  true,
  array[
    '{"name": "Bali Temples", "image_url": "https://images.unsplash.com/photo-1537953773345-d17270089ab9?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Surfing", "image_url": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Rice Terraces", "image_url": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800"}'
  ],
  'Indonesia offers diverse experiences from spiritual retreats in Ubud to diving in Raja Ampat. It''s affordable, beautiful, and full of friendly locals.',
  'https://images.unsplash.com/photo-1555412654-72a95a495858?auto=format&fit=crop&q=80&w=1000',
  '{}'
),
-- 5. Iceland
(
  'Iceland',
  'iceland',
  'The land of fire and ice. Witness waterfalls, geysers, volcanoes, and the spectacular Northern Lights in this otherworldly landscape.',
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=1000',
  true,
  array[
    '{"name": "Northern Lights", "image_url": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Blue Lagoon", "image_url": "https://images.unsplash.com/photo-1520627725227-1481878d227c?auto=format&fit=crop&q=80&w=800"}',
    '{"name": "Waterfall Hike", "image_url": "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800"}'
  ],
  'Iceland is perfect for nature lovers and adventurers. The dramatic landscapes are unlike anywhere else on Earth. It''s a bucket-list destination for seeing the Aurora Borealis.',
  'https://images.unsplash.com/photo-1520769945061-0a448c463865?auto=format&fit=crop&q=80&w=1000',
  '{}'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  is_active = excluded.is_active,
  experiences = excluded.experiences,
  why_visit_description = excluded.why_visit_description,
  why_visit_image_url = excluded.why_visit_image_url,
  recommended_packages = excluded.recommended_packages;
