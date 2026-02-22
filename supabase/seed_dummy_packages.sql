-- Seed dummy packages
insert into packages (
  title,
  slug,
  destination,
  description,
  price,
  duration_days,
  image_urls,
  is_featured,
  timeline,
  features
) values
-- 1. Kyoto Cultural Immersion
(
  'Kyoto Cultural Immersion',
  'kyoto-cultural-immersion',
  'Kyoto, Japan',
  'Experience the traditional culture of Japan in the ancient capital of Kyoto. Visit temples, shrines, and participate in a tea ceremony.',
  2500,
  7,
  array['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000'],
  true,
  '[
    {"date": "Day 1", "title": "Arrival", "description": "Arrive at Kansai International Airport and transfer to your hotel in Kyoto."},
    {"date": "Day 2", "title": "Kinkaku-ji & Ryoan-ji", "description": "Visit the Golden Pavilion and the famous rock garden."},
    {"date": "Day 3", "title": "Tea Ceremony", "description": "Participate in a traditional tea ceremony in Gion."}
  ]'::jsonb,
  '[
    {"title": "Accommodation", "points": ["4-star hotel in central Kyoto", "Daily breakfast included"]},
    {"title": "Activities", "points": ["Guided temple tours", "Tea ceremony experience", "Kimono rental"]}
  ]'::jsonb
),
-- 2. Safari Adventure in Tanzania
(
  'Safari Adventure in Tanzania',
  'safari-adventure-tanzania',
  'Serengeti, Tanzania',
  'Witness the Great Migration and spot the Big Five in the vast plains of the Serengeti and Ngorongoro Crater.',
  4500,
  10,
  array['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000'],
  true,
  '[
    {"date": "Day 1", "title": "Arrival in Arusha", "description": "Transfer to your lodge near Arusha."},
    {"date": "Day 2-4", "title": "Serengeti National Park", "description": "Game drives in the Serengeti to see lions, elephants, and more."},
    {"date": "Day 5-6", "title": "Ngorongoro Crater", "description": "Explore the crater floor and its diverse wildlife."}
  ]'::jsonb,
  '[
    {"title": "Inclusions", "points": ["All park fees", "Professional guide", "4x4 safari vehicle"]},
    {"title": "Accommodation", "points": ["Luxury tented camps", "Full board meals"]}
  ]'::jsonb
),
-- 3. Amalfi Coast Getaway
(
  'Amalfi Coast Getaway',
  'amalfi-coast-getaway',
  'Amalfi Coast, Italy',
  'Relax on the stunning Amalfi Coast, enjoy Italian cuisine, and visit the ruins of Pompeii.',
  3200,
  8,
  array['https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1000'],
  false,
  '[
    {"date": "Day 1", "title": "Arrival in Naples", "description": "Transfer to your hotel in Positano."},
    {"date": "Day 2", "title": "Boat Tour", "description": "Private boat tour along the coast."},
    {"date": "Day 3", "title": "Pompeii Excursion", "description": "Guided tour of the ancient ruins of Pompeii."}
  ]'::jsonb,
  '[
    {"title": "Highlights", "points": ["Scenic coastal drives", "Authentic Italian dining", "Private boat tour"]},
    {"title": "Transport", "points": ["Private transfers", "Ferry tickets to Capri"]}
  ]'::jsonb
),
-- 4. Bali Spiritual Retreat
(
  'Bali Spiritual Retreat',
  'bali-spiritual-retreat',
  'Ubud, Bali',
  'Reconnect with yourself in the lush jungles of Ubud. Includes daily yoga, meditation, and visits to sacred water temples.',
  1800,
  6,
  array['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000'],
  true,
  '[
    {"date": "Day 1", "title": "Welcome to Ubud", "description": "Check into your jungle villa and enjoy a welcome dinner."},
    {"date": "Day 2", "title": "Yoga & Rice Terraces", "description": "Morning yoga session followed by a walk through Tegalalang Rice Terraces."},
    {"date": "Day 3", "title": "Water Temple Purification", "description": "Traditional purification ritual at Tirta Empul Temple."}
  ]'::jsonb,
  '[
    {"title": "Wellness", "points": ["Daily yoga classes", "2 Spa treatments", "Meditation sessions"]},
    {"title": "Meals", "points": ["Organic breakfast and dinner", "Healthy smoothie bowls"]}
  ]'::jsonb
),
-- 5. Northern Lights in Iceland
(
  'Northern Lights in Iceland',
  'northern-lights-iceland',
  'Reykjavik, Iceland',
  'Chase the Aurora Borealis and explore the land of fire and ice. Visit waterfalls, geysers, and black sand beaches.',
  3800,
  7,
  array['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=1000'],
  true,
  '[
    {"date": "Day 1", "title": "Arrival in Reykjavik", "description": "Explore the capital city and relax in the Blue Lagoon."},
    {"date": "Day 2", "title": "Golden Circle", "description": "Tour the Golden Circle route: Thingvellir, Geysir, and Gullfoss."},
    {"date": "Day 3", "title": "South Coast & Aurora Hunt", "description": "Visit Seljalandsfoss and Skogafoss, then hunt for Northern Lights at night."}
  ]'::jsonb,
  '[
    {"title": "Activities", "points": ["Northern Lights tour", "Blue Lagoon admission", "Glacier hike"]},
    {"title": "Transport", "points": ["Super Jeep tours", "Airport transfers"]}
  ]'::jsonb
),
-- 6. Peruvian Inca Trail
(
  'Peruvian Inca Trail',
  'peruvian-inca-trail',
  'Cusco, Peru',
  'Trek the legendary Inca Trail to Machu Picchu. Experience breathtaking Andes mountain scenery and ancient ruins.',
  2900,
  9,
  array['https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=1000'],
  false,
  '[
    {"date": "Day 1-2", "title": "Acclimatization in Cusco", "description": "Explore Cusco and the Sacred Valley to adjust to the altitude."},
    {"date": "Day 3-6", "title": "Inca Trail Trek", "description": "4-day trek through the Andes, camping along the way."},
    {"date": "Day 7", "title": "Machu Picchu", "description": "Sunrise at the Sun Gate and guided tour of the citadel."}
  ]'::jsonb,
  '[
    {"title": "Trek", "points": ["Permits and fees", "Porters and cooks", "Camping equipment"]},
    {"title": "Accommodation", "points": ["3 nights hotel in Cusco", "3 nights camping"]}
  ]'::jsonb
),
-- 7. Swiss Alps Ski Week
(
  'Swiss Alps Ski Week',
  'swiss-alps-ski-week',
  'Zermatt, Switzerland',
  'World-class skiing in the shadow of the Matterhorn. Enjoy luxury chalets and après-ski culture.',
  5500,
  7,
  array['https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=1000'],
  false,
  '[
    {"date": "Day 1", "title": "Arrival in Zermatt", "description": "Train ride through the mountains to the car-free village of Zermatt."},
    {"date": "Day 2-6", "title": "Skiing & Snowboarding", "description": "Full days on the slopes with options for guided off-piste adventures."},
    {"date": "Day 7", "title": "Departure", "description": "Final morning in the mountains before departure."}
  ]'::jsonb,
  '[
    {"title": "Skiing", "points": ["6-day lift pass", "Equipment rental", "1 day private instructor"]},
    {"title": "Luxury", "points": ["Chalet accommodation", "Spa access", "Gourmet dinners"]}
  ]'::jsonb
),
-- 8. Egyptian Pyramids & Nile Cruise
(
  'Egyptian Pyramids & Nile Cruise',
  'egyptian-pyramids-nile-cruise',
  'Cairo & Luxor, Egypt',
  'Step back in time to the land of Pharaohs. Visit the Great Pyramids and cruise down the Nile River.',
  2200,
  8,
  array['https://images.unsplash.com/photo-1539650116455-251d93d5e933?auto=format&fit=crop&q=80&w=1000'],
  true,
  '[
    {"date": "Day 1-2", "title": "Cairo", "description": "Visit the Giza Pyramids, Sphinx, and the Egyptian Museum."},
    {"date": "Day 3", "title": "Fly to Luxor", "description": "Board your Nile cruise ship."},
    {"date": "Day 4-7", "title": "Nile Cruise", "description": "Sail to Edfu, Kom Ombo, and Aswan, visiting temples along the way."}
  ]'::jsonb,
  '[
    {"title": "Culture", "points": ["Egyptologist guide", "All temple entry fees", "Sound and Light show"]},
    {"title": "Transport", "points": ["Domestic flights", "5-star Nile cruise ship"]}
  ]'::jsonb
),
-- 9. New York City Explorer
(
  'New York City Explorer',
  'new-york-city-explorer',
  'New York, USA',
  'The ultimate city break in the Big Apple. Broadway shows, Central Park, and world-class museums.',
  3000,
  5,
  array['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000'],
  false,
  '[
    {"date": "Day 1", "title": "Midtown Manhattan", "description": "Times Square, Rockefeller Center, and Fifth Avenue shopping."},
    {"date": "Day 2", "title": "Statue of Liberty", "description": "Ferry to Liberty Island and Ellis Island."},
    {"date": "Day 3", "title": "Broadway", "description": "Evening Broadway show of your choice."}
  ]'::jsonb,
  '[
    {"title": "Attractions", "points": ["CityPASS included", "Broadway tickets", "Top of the Rock observation"]},
    {"title": "Stay", "points": ["Central Manhattan hotel", "Concierge service"]}
  ]'::jsonb
),
-- 10. Maldives Luxury Escape
(
  'Maldives Luxury Escape',
  'maldives-luxury-escape',
  'Malé Atoll, Maldives',
  'The ultimate honeymoon or relaxation destination. Overwater bungalows, crystal clear water, and white sand beaches.',
  6000,
  7,
  array['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000'],
  true,
  '[
    {"date": "Day 1", "title": "Seaplane Transfer", "description": "Scenic seaplane flight to your private island resort."},
    {"date": "Day 2-6", "title": "Island Living", "description": "Snorkeling, diving, spa treatments, or simply relaxing by your private pool."},
    {"date": "Day 7", "title": "Sunset Cruise", "description": "Farewell sunset dolphin cruise."}
  ]'::jsonb,
  '[
    {"title": "Luxury", "points": ["Overwater villa", "All-inclusive dining", "Butler service"]},
    {"title": "Activities", "points": ["Snorkeling gear", "Sunset cruise", "Couple''s massage"]}
  ]'::jsonb
);
