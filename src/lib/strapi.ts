// Optimized Strapi API Client
const STRAPI_URL = process.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.VITE_STRAPI_TOKEN || '';

// Optimized API endpoints with selective population
const API_ENDPOINTS = {
  // Articles with minimal data - only essential fields
  articles: `/api/articles?populate[featured_image][fields][0]=url&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[category][fields][0]=name&populate[category][fields][1]=slug&populate[tags][fields][0]=name&populate[tags][fields][1]=slug&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=publishedAt&fields[4]=status`,
  
  // Single article with full content but minimal metadata
  article: (slug: string) => `/api/articles?filters[slug][$eq]=${slug}&populate[featured_image][fields][0]=url&populate[author][fields][0]=name&populate[author][fields][1]=slug&populate[category][fields][0]=name&populate[category][fields][1]=slug&populate[tags][fields][0]=name&populate[tags][fields][1]=slug&populate[blocks]=*&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=body&fields[4]=seo_title&fields[5]=meta_description&fields[6]=publishedAt&fields[7]=status`,
  
  // Categories - minimal data only
  categories: `/api/categories?fields[0]=name&fields[1]=slug`,
  
  // Authors - minimal data only  
  authors: `/api/authors?fields[0]=name&fields[1]=slug&populate[profile_image][fields][0]=url`,
  
  // Tags - minimal data only
  tags: `/api/tags?fields[0]=name&fields[1]=slug`
};

// Optimized interfaces with only essential fields
export interface StrapiImage {
  url: string;
}

export interface StrapiAuthor {
  name: string;
  slug: string;
  profile_image?: StrapiImage;
}

export interface StrapiCategory {
  name: string;
  slug: string;
}

export interface StrapiTag {
  name: string;
  slug: string;
}

export interface StrapiArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body?: string;
  seo_title?: string;
  meta_description?: string;
  featured_image?: StrapiImage;
  publishedAt: string;
  status: 'published' | 'draft';
  author?: StrapiAuthor;
  category?: StrapiCategory;
  tags?: StrapiTag[];
  blocks?: any[]; // Dynamic zone content
}

// Transform Strapi response to clean format
function transformArticle(strapiArticle: any): StrapiArticle {
  const { id, attributes } = strapiArticle;
  
  return {
    id,
    title: attributes.title,
    slug: attributes.slug,
    summary: attributes.summary,
    body: attributes.body,
    seo_title: attributes.seo_title,
    meta_description: attributes.meta_description,
    featured_image: attributes.featured_image?.data?.attributes,
    publishedAt: attributes.publishedAt,
    status: attributes.status,
    author: attributes.author?.data?.attributes,
    category: attributes.category?.data?.attributes,
    tags: attributes.tags?.data?.map((tag: any) => tag.attributes) || [],
    blocks: attributes.blocks
  };
}

// Generic API fetch function
async function fetchAPI(endpoint: string): Promise<any> {
  const url = `${STRAPI_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Strapi API Error:', error);
    throw error;
  }
}

// Optimized API functions
export async function getArticles(): Promise<StrapiArticle[]> {
  const data = await fetchAPI(API_ENDPOINTS.articles);
  return data.data.map(transformArticle);
}

export async function getArticle(slug: string): Promise<StrapiArticle | null> {
  const data = await fetchAPI(API_ENDPOINTS.article(slug));
  
  if (data.data.length === 0) {
    return null;
  }
  
  return transformArticle(data.data[0]);
}

export async function getCategories(): Promise<StrapiCategory[]> {
  const data = await fetchAPI(API_ENDPOINTS.categories);
  return data.data.map((item: any) => item.attributes);
}

export async function getAuthors(): Promise<StrapiAuthor[]> {
  const data = await fetchAPI(API_ENDPOINTS.authors);
  return data.data.map((item: any) => ({
    ...item.attributes,
    profile_image: item.attributes.profile_image?.data?.attributes
  }));
}

export async function getTags(): Promise<StrapiTag[]> {
  const data = await fetchAPI(API_ENDPOINTS.tags);
  return data.data.map((item: any) => item.attributes);
}

// Utility functions for frontend
export function getImageUrl(image: StrapiImage | undefined): string {
  if (!image?.url) return '';
  
  // Handle relative URLs from Strapi
  if (image.url.startsWith('/')) {
    return `${STRAPI_URL}${image.url}`;
  }
  
  return image.url;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// SEO helpers
export function getMetaTitle(article: StrapiArticle): string {
  return article.seo_title || article.title;
}

export function getMetaDescription(article: StrapiArticle): string {
  return article.meta_description || article.summary;
}

// Filter published articles only
export function getPublishedArticles(articles: StrapiArticle[]): StrapiArticle[] {
  return articles.filter(article => article.status === 'published');
}

export default {
  getArticles,
  getArticle,
  getCategories,
  getAuthors,
  getTags,
  getImageUrl,
  formatDate,
  getMetaTitle,
  getMetaDescription,
  getPublishedArticles
}; 