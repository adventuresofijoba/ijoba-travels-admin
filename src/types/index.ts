export interface Destination {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  experiences: {
    name: string;
    image_url: string;
  }[];
  why_visit_description?: string;
  why_visit_image_url?: string;
  recommended_packages?: string[];
}

export interface Package {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  destination: string;
  description: string;
  price: number;
  duration_days: number;
  image_urls: string[];
  is_featured: boolean;
  timeline: {
    date: string;
    title: string;
    description: string;
  }[];
  features: {
    title: string;
    points: string[];
  }[];
}

export interface Inquiry {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone_number: string;
  inquiry_type: "contact" | "custom_package" | "package_reserve" | "newsletter";
  status: "new" | "contacted" | "closed";
  message: string;
  preferred_destination?: string;
  travel_style?: string;
  budget_range?: string;
  travel_dates?: string;
}

export interface Story {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  cover_image: string;
  content: string;
  author_name: string;
  is_published: boolean;
  published_at?: string;
}
