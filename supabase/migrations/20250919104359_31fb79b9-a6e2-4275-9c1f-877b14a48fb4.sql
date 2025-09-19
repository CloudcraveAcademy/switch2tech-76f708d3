-- Update the specific enrollment to reflect correct progress and completion status
UPDATE enrollments 
SET 
  progress = 100,
  completed = true,
  completion_date = now()
WHERE student_id = 'beb151ec-7e34-420f-a400-cf7982efdcea'
  AND course_id = '370f4ba7-8dd2-42ea-8318-ce4587eddd87'
  AND progress = 0
  AND completed = false;