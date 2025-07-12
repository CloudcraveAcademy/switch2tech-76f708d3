-- Add sample mentorship and internship programs for testing
INSERT INTO mentorship_programs (name, description, status, start_date, end_date, max_participants)
VALUES 
  ('Web Development Mentorship', 'Learn web development with experienced mentors', 'active', '2025-01-01', '2025-06-30', 20),
  ('Data Science Mentorship', 'Get guidance in data science and analytics', 'active', '2025-01-15', '2025-07-15', 15);

INSERT INTO internship_programs (name, description, company, status, start_date, end_date, max_interns)
VALUES 
  ('Software Engineering Internship', 'Hands-on software development experience', 'Tech Solutions Inc', 'active', '2025-02-01', '2025-05-31', 10),
  ('UI/UX Design Internship', 'Learn design principles and user experience', 'Design Studio Pro', 'active', '2025-01-20', '2025-04-20', 8);