/**
 * Art Categories for Exhibit
 * These are the core categories used throughout the platform
 * for artist portfolios, collector preferences, and content discovery.
 */

export const CATEGORIES = [
  {
    name: "Digital Art",
    slug: "digital-art",
    icon: "🎨",
  },
  {
    name: "Painting",
    slug: "painting",
    icon: "🖼️",
  },
  {
    name: "Illustration",
    slug: "illustration",
    icon: "✏️",
  },
  {
    name: "Photography",
    slug: "photography",
    icon: "📷",
  },
  {
    name: "Sculpture",
    slug: "sculpture",
    icon: "🗿",
  },
  {
    name: "Mixed Media",
    slug: "mixed-media",
    icon: "🎭",
  },
  {
    name: "Street Art",
    slug: "street-art",
    icon: "🏙️",
  },
  {
    name: "Concept Art",
    slug: "concept-art",
    icon: "💡",
  },
  {
    name: "Character Design",
    slug: "character-design",
    icon: "👤",
  },
  {
    name: "Abstract",
    slug: "abstract",
    icon: "🌀",
  },
  {
    name: "Portraits",
    slug: "portraits",
    icon: "🖌️",
  },
  {
    name: "Landscapes",
    slug: "landscapes",
    icon: "🏞️",
  },
  {
    name: "Animation",
    slug: "animation",
    icon: "🎬",
  },
  {
    name: "3D Art",
    slug: "3d-art",
    icon: "🧊",
  },
  {
    name: "Traditional",
    slug: "traditional",
    icon: "🎨",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export type CategoryName = (typeof CATEGORIES)[number]["name"];

export const getCategoryBySlug = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const getCategoryByName = (name: string) =>
  CATEGORIES.find((c) => c.name === name);
