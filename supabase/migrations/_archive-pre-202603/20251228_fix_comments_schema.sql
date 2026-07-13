-- Migration to fix blog_comments schema: is_approved -> status

-- 1. Add status column with default 'pending'
ALTER TABLE public.blog_comments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Migrate existing data
UPDATE public.blog_comments 
SET status = 'approved' 
WHERE is_approved = TRUE;

UPDATE public.blog_comments 
SET status = 'pending' 
WHERE is_approved = FALSE OR is_approved IS NULL;

-- 3. Drop is_approved column
ALTER TABLE public.blog_comments 
DROP COLUMN IF EXISTS is_approved;

-- 4. Drop old RLS policies
DROP POLICY IF EXISTS "Public can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Public can add comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admin can manage all comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admin can manage blog comments" ON public.blog_comments; -- Possible duplicate from other migrations
DROP POLICY IF EXISTS "Public can view approved blog comments" ON public.blog_comments; -- Possible duplicate
DROP POLICY IF EXISTS "Users can create blog comments" ON public.blog_comments; -- Possible duplicate

-- 5. Create new RLS policies using status

-- Admin can manage everything
CREATE POLICY "Admin can manage all comments" 
ON public.blog_comments 
FOR ALL 
USING (is_admin_user());

-- Public can view approved comments
CREATE POLICY "Public can view approved comments" 
ON public.blog_comments 
FOR SELECT 
USING (
    status = 'approved' 
    AND EXISTS (
        SELECT 1 FROM public.blog_posts 
        WHERE blog_posts.id = blog_comments.post_id 
        AND blog_posts.status = 'published'
        AND blog_posts.allow_comments = true
    )
);

-- Public can add comments (status will be pending by default)
CREATE POLICY "Public can add comments" 
ON public.blog_comments 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.blog_posts 
        WHERE blog_posts.id = blog_comments.post_id 
        AND blog_posts.status = 'published' -- Only on published posts
        AND blog_posts.allow_comments = true
    )
);

-- Grant permissions (just in case)
GRANT SELECT, INSERT ON public.blog_comments TO anon;
GRANT SELECT, INSERT ON public.blog_comments TO authenticated;
GRANT ALL ON public.blog_comments TO authenticated; -- Admin permissions handled by RLS, but authenticated need basic access
