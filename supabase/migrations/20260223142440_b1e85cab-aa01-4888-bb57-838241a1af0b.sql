
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.course_categories;

CREATE POLICY "Only admins can manage categories"
ON public.course_categories
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
