UPDATE public.student_success_stories
SET story = 'Switch2Tech''s practical approach and hands-on projects gave me the confidence I needed as a frontend web developer. The curriculum built a solid foundation, and engaging with real-world projects prepared me for the demands of the industry. This experience has been invaluable in my career journey.',
    updated_at = now()
WHERE name = 'Micheal';

DELETE FROM public.student_success_stories
WHERE name IN ('John Doe', 'Jane Smith', 'Mike Johnson');