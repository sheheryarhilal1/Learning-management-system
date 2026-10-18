LEARNORA LMS - Announcement and Logout Fixes

Changes included:
1. Teacher announcements saved in `learnora_announcements` are displayed on the Student Announcements page only when the student is enrolled in that course.
2. The Parent Announcements page reads the same shared announcement store and shows course announcements for the linked child's enrolled courses.
3. Audience options are respected:
   - Enrolled Students & Their Parents
   - Enrolled Students Only
   - Parents of Enrolled Students
4. Parent course matching now checks linked child course arrays/course IDs/course names, not only a single course field.
5. Logout handling is added across app pages. Logging out clears session identity keys (not users/academic data) and redirects to `Html/login.html`.
6. Existing page design and sidebars are left in place.

Important limitation:
This project uses browser localStorage. Announcement visibility is shared only in the same browser/profile on the same device. It does not send actual emails and does not synchronize across different devices/browsers. For real email notifications and multi-device updates, connect a backend/database and an email service.


RESULTS & QUIZZES VISIBILITY UPDATE
- Teacher results marked Published are now shown at the top of the matching student's Results page and the linked parent's Results page.
- Draft results remain hidden from student and parent portals.
- Published quizzes/exams stored in learnora_academic_data are shown to students and parents only when the course/subject matches the learner's enrolled courses.
- Latest published items are sorted first.
- The feature uses browser localStorage; for multi-device or different-browser access, a shared backend/database is required.
