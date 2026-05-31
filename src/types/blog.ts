export interface BlogPost {
    id: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    published_at: string | null;
    featured_image: string | null;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    views_count: number;
    reading_time?: number;
    translations?: BlogPostTranslation[];
}

export interface BlogPostTranslation {
    id: string;
    post_id: string;
    language: 'pl' | 'en';
    title: string;
    excerpt: string;
    content: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string[];
}
