-- Seed 5 dummy stories/tips
-- Uses ON CONFLICT to update existing records if they exist

insert into stories (
  title,
  slug,
  cover_image,
  content,
  author_name,
  is_published,
  published_at
) values
-- 1. Solo Travel Tips
(
  '10 Essential Tips for Solo Female Travelers',
  '10-essential-tips-solo-female-travelers',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000',
  'Traveling solo is one of the most empowering experiences you can have. Here are our top tips for staying safe and making the most of your adventure.

## 1. Research Your Destination
Knowledge is power. Understand the local customs, dress codes, and safety concerns before you go.

## 2. Stay Connected
Always keep your phone charged and have a local SIM card or portable Wi-Fi. Share your itinerary with someone back home.

## 3. Trust Your Instincts
If a situation feels wrong, remove yourself from it immediately. Your safety is more important than being polite.

## 4. Join Day Tours
It''s a great way to meet people and see the sights safely.

## 5. Pack Light
You''ll be more mobile and less of a target. Plus, it''s easier to navigate public transport.',
  'Sarah Jenkins',
  true,
  now()
),
-- 2. Safari Packing List
(
  'The Ultimate Packing List for an African Safari',
  'ultimate-packing-list-african-safari',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
  'Heading to the Serengeti or Kruger? Here is what you need to bring.

### Clothing
*   **Neutral Colors:** Khaki, beige, and green blend in with the bush. Avoid bright colors (scares animals) and dark blue/black (attracts tsetse flies).
*   **Layers:** Mornings are freezing, afternoons are hot.
*   **Hat & Sunglasses:** The sun is strong.

### Gear
*   **Binoculars:** Essential for spotting wildlife.
*   **Camera:** With a good zoom lens.
*   **Power Bank:** Charging points can be scarce.

### Health
*   **Malaria Prophylaxis:** Consult your doctor.
*   **Sunscreen & Insect Repellent:** High SPF and DEET.',
  'David Attenborough (Fan)',
  true,
  now() - interval '2 days'
),
-- 3. Kyoto Hidden Gems
(
  'Hidden Gems of Kyoto: Beyond the Golden Pavilion',
  'hidden-gems-kyoto-beyond-golden-pavilion',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000',
  'Kyoto is famous for Kinkaku-ji and Fushimi Inari, but the real magic lies in the quiet corners.

### 1. Otagi Nenbutsu-ji
A whimsical temple with 1,200 unique stone statues, each with a different facial expression.

### 2. Gio-ji Temple
A small, moss-covered temple that feels like a fairy tale forest.

### 3. Pontocho Alley at Night
While popular, if you explore the narrower side streets, you''ll find intimate izakayas and maybe even spot a Geisha on her way to an appointment.',
  'Kenji Sato',
  true,
  now() - interval '5 days'
),
-- 4. Iceland in Winter
(
  'Why You Should Visit Iceland in Winter',
  'why-visit-iceland-winter',
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=1000',
  'Think Iceland is only for summer? Think again. Winter offers a completely different, magical experience.

*   **The Northern Lights:** The long nights increase your chances of seeing the Aurora Borealis.
*   **Ice Caves:** These natural wonders are only stable and accessible in winter.
*   **Fewer Crowds:** Enjoy the waterfalls and geysers without the summer masses.
*   **Cozy Vibes:** Nothing beats soaking in a hot spring while snow falls around you.',
  'Elena Frost',
  true,
  now() - interval '1 week'
),
-- 5. Italian Cuisine
(
  'A Culinary Journey Through Italy: Regional Specialties',
  'culinary-journey-italy-regional-specialties',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=1000',
  'Italy isn''t just pizza and pasta. Each region has its own distinct flavor.

### Naples (Campania)
The birthplace of pizza. Try a classic **Pizza Margherita** with buffalo mozzarella.

### Rome (Lazio)
Home of **Carbonara** (eggs, cheese, guanciale, pepper - no cream!) and **Cacio e Pepe**.

### Florence (Tuscany)
Famous for **Bistecca alla Fiorentina**, a massive T-bone steak grilled to perfection.

### Bologna (Emilia-Romagna)
The food capital. Indulge in **Tagliatelle al Ragù** (Bolognese) and Mortadella.',
  'Marco Rossi',
  true,
  now() - interval '10 days'
)
on conflict (slug) do update set
  title = excluded.title,
  cover_image = excluded.cover_image,
  content = excluded.content,
  author_name = excluded.author_name,
  is_published = excluded.is_published,
  published_at = excluded.published_at;
