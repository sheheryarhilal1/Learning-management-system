LEARNORA LMS — Quiz runtime, attachments and announcement visibility

Changes included:
- Teacher can add a resource attachment to a quiz/exam and an optional attachment to each MCQ.
- Student can open published quizzes from the student Quizzes page, answer MCQs, see a countdown timer, and submit. Timer expiry submits automatically.
- Objective MCQs are auto-marked and the score is shown immediately. One attempt per student/quiz is enforced in this browser storage.
- Student may attach an answer/work file when submitting; file-only submissions are supported for assessments without structured MCQs.
- Quiz attempts and marks are stored in learnora_academic_data.quizAttempts; student Results page and parent Quizzes page display the relevant attempt where the current user/linked child can be matched.
- Latest teacher announcement is shown at the top of student and parent Announcements pages when matching course information is available.

Important technical note: this project uses browser localStorage. It works only within the same browser/profile/device. Separate teacher, student and parent devices need a shared backend/database to sync assessments, announcements, attempts and attachments. Attachments are limited to 1.5 MB each to reduce localStorage quota errors.
