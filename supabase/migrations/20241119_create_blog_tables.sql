-- Tworzenie tabeli postów bloga
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    author_id UUID REFERENCES public.admins(id),
    featured_image TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    reading_time INTEGER DEFAULT 0, -- czas czytania w minutach
    views_count INTEGER DEFAULT 0,
    allow_comments BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tworzenie tabeli tłumaczeń dla postów bloga
CREATE TABLE IF NOT EXISTS public.blog_post_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    language VARCHAR(2) NOT NULL CHECK (language IN ('pl', 'en')),
    title VARCHAR(255) NOT NULL,
    excerpt VARCHAR(1000), -- krótki wstęp
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    tags VARCHAR(50)[], -- tagi dla posta
    UNIQUE(post_id, language)
);

-- Tworzenie tabeli kategorii bloga
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6', -- kolor hex dla kategorii
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tworzenie tabeli tłumaczeń dla kategorii bloga
CREATE TABLE IF NOT EXISTS public.blog_category_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    language VARCHAR(2) NOT NULL CHECK (language IN ('pl', 'en')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE(category_id, language)
);

-- Tabela łącząca posty z kategoriami (many-to-many)
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- główna kategoria
    UNIQUE(post_id, category_id)
);

-- Tworzenie tabeli komentarzy
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(255),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funkcja do automatycznego ustawiania published_at
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla automatycznego ustawiania published_at
CREATE TRIGGER trigger_set_published_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_published_at();

-- Trigger dla updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON public.blog_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS dla tabeli postów bloga
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Polityki dla postów bloga
CREATE POLICY "Public can view published posts" ON public.blog_posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admin can manage all posts" ON public.blog_posts FOR ALL
    USING (is_admin_user());

-- RLS dla tłumaczeń postów
ALTER TABLE public.blog_post_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view translations for published posts" ON public.blog_post_translations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.blog_posts 
        WHERE blog_posts.id = blog_post_translations.post_id 
        AND blog_posts.status = 'published'
    ));

CREATE POLICY "Admin can manage post translations" ON public.blog_post_translations FOR ALL
    USING (is_admin_user());

-- RLS dla kategorii bloga
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blog categories" ON public.blog_categories FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage blog categories" ON public.blog_categories FOR ALL
    USING (is_admin_user());

-- RLS dla tłumaczeń kategorii bloga
ALTER TABLE public.blog_category_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blog category translations" ON public.blog_category_translations FOR SELECT
    USING (true);

CREATE POLICY "Admin can manage blog category translations" ON public.blog_category_translations FOR ALL
    USING (is_admin_user());

-- RLS dla przypisań kategorii
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view category assignments for published posts" ON public.blog_post_categories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.blog_posts 
        WHERE blog_posts.id = blog_post_categories.post_id 
        AND blog_posts.status = 'published'
    ));

CREATE POLICY "Admin can manage post category assignments" ON public.blog_post_categories FOR ALL
    USING (is_admin_user());

-- RLS dla komentarzy
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments" ON public.blog_comments FOR SELECT
    USING (is_approved = true AND EXISTS (
        SELECT 1 FROM public.blog_posts 
        WHERE blog_posts.id = blog_comments.post_id 
        AND blog_posts.status = 'published'
        AND blog_posts.allow_comments = true
    ));

CREATE POLICY "Public can add comments" ON public.blog_comments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.blog_posts 
        WHERE blog_posts.id = blog_comments.post_id 
        AND blog_posts.status = 'published'
        AND blog_posts.allow_comments = true
    ));

CREATE POLICY "Admin can manage all comments" ON public.blog_comments FOR ALL
    USING (is_admin_user());

-- Uprawnienia dla anonimowych użytkowników
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_post_translations TO anon;
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT ON public.blog_category_translations TO anon;
GRANT SELECT ON public.blog_post_categories TO anon;
GRANT SELECT, INSERT ON public.blog_comments TO anon;

-- Uprawnienia dla zalogowanych użytkowników
GRANT SELECT ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_post_translations TO authenticated;
GRANT SELECT ON public.blog_categories TO authenticated;
GRANT SELECT ON public.blog_category_translations TO authenticated;
GRANT SELECT ON public.blog_post_categories TO authenticated;
GRANT SELECT, INSERT ON public.blog_comments TO authenticated;

-- Uprawnienia dla admina
GRANT ALL ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_post_translations TO authenticated;
GRANT ALL ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_category_translations TO authenticated;
GRANT ALL ON public.blog_post_categories TO authenticated;
GRANT ALL ON public.blog_comments TO authenticated;