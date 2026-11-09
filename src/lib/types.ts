export type Settings = {
  first_name: string;
  last_name: string;
  handle: string;
  title: string;
  subtitle: string;
  tagline: string;
  location: string;
  email: string;
  availability: string;
  photo_url: string;
  cv_url: string;
  about: string[];
  languages: { name: string; level: string }[];
  interests: string[];
  highlights: { value: string; label: string }[];
  socials: { label: string; url: string }[];
  chatbot_enabled: boolean;
  chatbot_instructions: string;
};

export type SkillGroup = { id: string; name: string; icon: string; items: string[]; position: number; published: boolean };

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  category: string;
  year: string;
  topology: "core" | "vlan" | "multi" | "web";
  cover_url: string;
  demo_url: string;
  repo_url: string;
  featured: boolean;
  published: boolean;
  position: number;
  likes?: number;
  gallery?: string[];
  topology_images?: string[];
};

export type TimelineItem = {
  id: string;
  period: string;
  title: string;
  place: string;
  detail: string;
  kind: "formation" | "experience" | "projet" | "competition";
  current: boolean;
  position: number;
  published: boolean;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  status: "obtenue" | "en-cours" | "planifiee";
  credential_url: string;
  badge_url: string;
  /** Date d'obtention (AAAA-MM-JJ) */
  issued_on: string | null;
  /** Établissement qui a dispensé la formation */
  academy: string;
  credential_id: string;
  description: string;
  skills: string[];
  certificate_url: string;
  certificate_name: string;
  certificate_size: number;
  certificate_preview_url: string;
  position: number;
  published: boolean;
};

export type SiteData = {
  settings: Settings;
  skills: SkillGroup[];
  projects: Project[];
  timeline: TimelineItem[];
  certifications: Certification[];
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string;
  pdf_url?: string;
  pdf_name?: string;
  pdf_size?: number;
  pdf_preview_url?: string;
  tags: string[];
  published: boolean;
  published_at: string;
  position: number;
};

export type DocumentItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_name: string;
  file_size: number;
  published: boolean;
  position: number;
  created_at: string;
};
