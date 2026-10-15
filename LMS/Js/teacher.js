
/* =========================================================
   LEARNORA LMS — TEACHER DASHBOARD
   Courses | Students | Marks | Assignments | Quizzes
   Announcements | LocalStorage
   ========================================================= */

document.addEventListener("DOMContentLoaded", initTeacherDashboard);

const TeacherLMS = {
    USERS_KEY: "learnora_users",
    CURRENT_KEY: "learnora_current_user",
    DATA_KEY: "learnora_academic_data",

    teacher: null,
    users: [],
    data: null,
    courses: [],
    students: [],
    selectedCourse: ""
};

/* ======================== INITIALIZATION ======================== */

function initTeacherDashboard() {
    const $ = id => document.getElementById(id);

    $("todayDate") && (
        $("todayDate").textContent = new Date().toLocaleDateString(
            "en-US",
            { weekday: "short", day: "numeric", month: "short", year: "numeric" }
        )
    );

    TeacherLMS.teacher = getCurrentTeacher();

    if (!TeacherLMS.teacher) {
        alert("Please log in using your teacher account.");
        window.location.href = "../../index.html";
        return;
    }

    const role = String(TeacherLMS.teacher.role || "").toLowerCase();

    if (role && role !== "teacher") {
        window.location.href =
            role === "student" ? "../student/dashboard.html" :
            role === "parent" ? "../parent/dashboard.html" :
            "../../index.html";
        return;
    }

    loadData();
    renderTeacherIdentity();
    renderDashboard();
    addManagementPanel();
    initMenu();
    initLogout();
}

function getCurrentTeacher() {
    const keys = [
        "learnora_current_user",
        "current_teacher",
        "currentTeacher",
        "logged_in_user"
    ];

    for (const key of keys) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            if (value && typeof value === "object") return value;
        } catch (_) {}
    }

    return null;
}

function loadData() {
    try {
        TeacherLMS.users = JSON.parse(
            localStorage.getItem(TeacherLMS.USERS_KEY) || "[]"
        );
    } catch (_) {
        TeacherLMS.users = [];
    }

    if (!Array.isArray(TeacherLMS.users)) {
        TeacherLMS.users = [];
    }

    try {
        TeacherLMS.data = JSON.parse(
            localStorage.getItem(TeacherLMS.DATA_KEY) || "{}"
        );
    } catch (_) {
        TeacherLMS.data = {};
    }

    TeacherLMS.data = {
        marks: Array.isArray(TeacherLMS.data.marks)
            ? TeacherLMS.data.marks : [],
        assignments: Array.isArray(TeacherLMS.data.assignments)
            ? TeacherLMS.data.assignments : [],
        quizzes: Array.isArray(TeacherLMS.data.quizzes)
            ? TeacherLMS.data.quizzes : [],
        announcements: Array.isArray(TeacherLMS.data.announcements)
            ? TeacherLMS.data.announcements : []
    };

    TeacherLMS.students = TeacherLMS.users.filter(user =>
        String(user.role || "").toLowerCase() === "student" ||
        String(user.id || "").toUpperCase().startsWith("STU")
    );

    TeacherLMS.courses = getTeacherCourses();
    TeacherLMS.selectedCourse = TeacherLMS.courses[0]?.code || "";
}

function saveData() {
    localStorage.setItem(
        TeacherLMS.DATA_KEY,
        JSON.stringify(TeacherLMS.data)
    );

    localStorage.setItem(
        TeacherLMS.USERS_KEY,
        JSON.stringify(TeacherLMS.users)
    );

    // Refresh current student/parent records if they exist.
    const current = parseJSON(localStorage.getItem(TeacherLMS.CURRENT_KEY));
    if (current) {
        const updated = TeacherLMS.users.find(user =>
            String(user.id) === String(current.id)
        );

        if (updated) {
            localStorage.setItem(TeacherLMS.CURRENT_KEY, JSON.stringify(updated));
        }
    }
}

function parseJSON(value) {
    try { return JSON.parse(value); }
    catch (_) { return null; }
}

/* ======================== TEACHER IDENTITY ======================== */

function renderTeacherIdentity() {
    const teacher = TeacherLMS.teacher;
    const name = teacher.name || teacher.fullName ||
        teacher.teacherName || teacher.username || "Teacher";

    setText("teacherName", name);
    setText("welcomeName", name);
    setText("teacherAvatar", name.trim().charAt(0).toUpperCase() || "T");
}

/* ======================== COURSE HELPERS ======================== */

function normalizeCourse(course) {
    if (typeof course === "string") {
        return { code: course, name: course };
    }

    if (!course || typeof course !== "object") return null;

    const code = String(
        course.code || course.courseCode || course.id || course.name || course.title || ""
    ).trim();

    const name = String(
        course.name || course.courseName || course.title || course.subject || code
    ).trim();

    return code ? { code, name } : null;
}

function getStudentCourses(student) {
    const list = student.courses || student.enrolledCourses ||
        student.subjects || [];

    if (!Array.isArray(list)) return [];

    return list.map(normalizeCourse).filter(Boolean);
}

function getTeacherCourses() {
    const teacher = TeacherLMS.teacher;
    const assigned = teacher.assignedCourses || teacher.courses ||
        teacher.subjects || [];

    let list = Array.isArray(assigned)
        ? assigned.map(normalizeCourse).filter(Boolean)
        : [];

    // Fallback for existing demo accounts without teacher course mapping.
    if (!list.length) {
        TeacherLMS.students.forEach(student => {
            getStudentCourses(student).forEach(course => {
                if (!list.some(item => item.code === course.code)) {
                    list.push(course);
                }
            });
        });
    }

    return list;
}

function getEnrolledStudents(courseCode) {
    return TeacherLMS.students.filter(student =>
        getStudentCourses(student).some(course => course.code === courseCode)
    );
}

function studentId(student) {
    return String(student.id || student.studentId || student.email || student.name);
}

function studentName(student) {
    return student.name || student.fullName ||
        student.studentName || student.username || "Student";
}

function courseName(code) {
    return TeacherLMS.courses.find(course => course.code === code)?.name || code;
}

function scopedItems(type, courseCode = TeacherLMS.selectedCourse) {
    return TeacherLMS.data[type].filter(item =>
        item.teacherId === teacherId() &&
        (!courseCode || item.courseCode === courseCode)
    );
}

function teacherId() {
    return String(
        TeacherLMS.teacher.id || TeacherLMS.teacher.email ||
        TeacherLMS.teacher.name || "teacher"
    );
}

/* ======================== DASHBOARD ======================== */

function renderDashboard() {
    const courses = TeacherLMS.courses;
    const students = new Set();

    courses.forEach(course => {
        getEnrolledStudents(course.code).forEach(student => {
            students.add(studentId(student));
        });
    });

    setText("courseCount", courses.length);
    setText("studentCount", students.size);

    const today = new Date().toDateString();
    const classesToday = courses.filter(course =>
        course.day && new Date(course.day).toDateString() === today
    );

    setText("classCount", classesToday.length);

    const pending = TeacherLMS.data.assignments.filter(item =>
        item.teacherId === teacherId()
    ).reduce((total, assignment) => {
        const enrolled = getEnrolledStudents(assignment.courseCode);
        const graded = (assignment.submissions || []).filter(
            submission => submission.marks !== "" &&
                submission.marks !== null && submission.marks !== undefined
        ).length;

        return total + Math.max(0, enrolled.length - graded);
    }, 0);

    setText("pendingCount", pending);

    const allStudents = [...students];
    const marks = TeacherLMS.data.marks.filter(item =>
        item.teacherId === teacherId()
    );

    const average = marks.length
        ? Math.round(marks.reduce((sum, item) =>
            sum + (Number(item.marks) / Math.max(1, Number(item.totalMarks))) * 100,
        0) / marks.length)
        : 0;

    setProgress("performancePercent", "performanceBar", average);

    renderClassList();
    renderAssignmentList();
    renderQuizList();
    renderAnnouncementList();
}

function renderClassList() {
    const container = document.getElementById("classesList");
    if (!container) return;

    if (!TeacherLMS.courses.length) {
        container.innerHTML = emptyMessage("No courses assigned yet.");
        return;
    }

    container.innerHTML = TeacherLMS.courses.slice(0, 5).map((course, index) => {
        const count = getEnrolledStudents(course.code).length;

        return `
            <div class="class-item">
                <div class="time-box">${escapeHTML(course.code)}</div>
                <div class="item-info">
                    <strong>${escapeHTML(course.name)}</strong>
                    <small>${count} enrolled student(s)</small>
                </div>
                <span class="status blue">Assigned</span>
            </div>`;
    }).join("");
}

function renderAssignmentList() {
    const container = document.getElementById("assignmentsList");
    if (!container) return;

    const items = scopedItems("assignments").slice(-3).reverse();

    container.innerHTML = items.length ? items.map(item => `
        <div class="task-item">
            <div class="announcement-icon"><i class="fa-solid fa-file-lines"></i></div>
            <div class="item-info">
                <strong>${escapeHTML(item.title)}</strong>
                <small>${escapeHTML(courseName(item.courseCode))} · Due ${escapeHTML(item.dueDate || "Not set")}</small>
            </div>
            <span class="status">${item.totalMarks} marks</span>
        </div>
    `).join("") : emptyMessage("No assignments created yet.");
}

function renderQuizList() {
    const container = document.getElementById("quizzesList");
    if (!container) return;

    const items = scopedItems("quizzes").slice(-3).reverse();

    container.innerHTML = items.length ? items.map(item => `
        <div class="task-item">
            <div class="announcement-icon"><i class="fa-solid fa-circle-question"></i></div>
            <div class="item-info">
                <strong>${escapeHTML(item.title)}</strong>
                <small>${escapeHTML(courseName(item.courseCode))} · ${item.totalMarks} marks</small>
            </div>
            <span class="status green">Published</span>
        </div>
    `).join("") : emptyMessage("No quizzes created yet.");
}

function renderAnnouncementList() {
    const container = document.getElementById("announcementsList");
    if (!container) return;

    const items = scopedItems("announcements").slice(-4).reverse();

    container.innerHTML = items.length ? items.map(item => `
        <div class="notice-item">
            <div class="announcement-icon"><i class="fa-solid fa-bell"></i></div>
            <div class="item-info">
                <strong>${escapeHTML(item.title)}</strong>
                <small>${escapeHTML(courseName(item.courseCode))} · ${escapeHTML(item.date)}</small>
            </div>
        </div>
    `).join("") : emptyMessage("No announcements created yet.");
}

function setProgress(labelId, barId, value) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    setText(labelId, `${safe}%`);

    const bar = document.getElementById(barId);
    if (bar) bar.style.width = `${safe}%`;
}

/* ======================== MANAGEMENT PANEL ======================== */

function addManagementPanel() {
    const content = document.querySelector(".content");
    if (!content || document.getElementById("teacherManagement")) return;

    const panel = document.createElement("section");
    panel.id = "teacherManagement";
    panel.className = "card";
    panel.style.marginTop = "24px";

    panel.innerHTML = `
        <div class="section-head">
            <h3><i class="fa-solid fa-sliders" style="color:#4cc6ff;margin-right:8px"></i>
                Manage Academic Activities
            </h3>
        </div>

        <p class="muted" style="margin-bottom:12px">
            Select a course to manage its enrolled students, marks, assignments, quizzes and announcements.
        </p>

        <label for="manageCourse" class="muted">Select Course</label>
        <select id="manageCourse" style="${fieldStyle()}">
            ${TeacherLMS.courses.map(course => `
                <option value="${escapeHTML(course.code)}">
                    ${escapeHTML(course.code)} — ${escapeHTML(course.name)}
                </option>
            `).join("")}
        </select>

        <div id="courseStudentInfo" class="muted" style="margin:12px 0"></div>

        <div class="management-buttons">
            <button type="button" class="manage-btn" data-action="marks">Upload Marks</button>
            <button type="button" class="manage-btn" data-action="assignment">Create Assignment</button>
            <button type="button" class="manage-btn" data-action="quiz">Create Quiz / Exam</button>
            <button type="button" class="manage-btn" data-action="announcement">Publish Announcement</button>
        </div>

        <div id="teacherRecords" style="margin-top:20px"></div>
    `;

    content.appendChild(panel);

    const style = document.createElement("style");
    style.textContent = `
        #teacherManagement select,
        #teacherManagement input,
        #teacherManagement textarea {
            width:100%; background:#091525; color:#eaf2ff;
            border:1px solid #263b55; border-radius:8px;
            padding:11px; margin:7px 0 13px; font:inherit;
        }
        .management-buttons {
            display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;
        }
        .manage-btn {
            border:1px solid #225072; background:#12344d;
            color:#69d0ff; padding:11px 14px; border-radius:9px;
            cursor:pointer; font:600 13px 'DM Sans',sans-serif;
        }
        .manage-btn:hover { background:#194765; }
        .teacher-form {
            margin-top:18px; padding:17px; background:#091525;
            border:1px solid #263b55; border-radius:12px;
        }
        .teacher-form label { display:block; color:#aabbd0; font-size:12px; }
        .teacher-form button {
            padding:10px 15px; border:0; border-radius:8px;
            background:#20aeea; color:#041321; cursor:pointer;
            font-weight:700; margin-right:7px;
        }
        .teacher-table-wrap { overflow-x:auto; margin-top:14px; }
        .teacher-table { border-collapse:collapse; width:100%; min-width:550px; }
        .teacher-table th,.teacher-table td {
            text-align:left; padding:10px; border-bottom:1px solid #26374b;
            font-size:12px;
        }
        .teacher-table th { color:#62caff; }
        .record-actions { display:flex; gap:8px; flex-wrap:wrap; margin:12px 0; }
        .record-actions button {
            background:#132b43; color:#9fdfff; border:1px solid #28445f;
            padding:7px 10px; border-radius:7px; cursor:pointer;
        }
        .teacher-notice { color:#91a3bb; font-size:12px; padding:12px 0; }
    `;
    document.head.appendChild(style);

    const selector = document.getElementById("manageCourse");
    selector?.addEventListener("change", () => {
        TeacherLMS.selectedCourse = selector.value;
        clearForm();
        renderCourseStudents();
        renderRecords();
    });

    panel.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            clearForm();
            openManagementForm(button.dataset.action);
        });
    });

    renderCourseStudents();
    renderRecords();
}

function fieldStyle() {
    return "display:block;width:100%;background:#091525;color:#eaf2ff;border:1px solid #263b55;border-radius:8px;padding:11px;margin:7px 0 13px";
}

function renderCourseStudents() {
    const container = document.getElementById("courseStudentInfo");
    if (!container) return;

    const students = getEnrolledStudents(TeacherLMS.selectedCourse);
    container.textContent = `${students.length} student(s) enrolled in ${courseName(TeacherLMS.selectedCourse)}.`;
}

function clearForm() {
    const old = document.getElementById("teacherForm");
    if (old) old.remove();
}

function openManagementForm(action) {
    const container = document.getElementById("teacherRecords");
    if (!container) return;

    const form = document.createElement("form");
    form.id = "teacherForm";
    form.className = "teacher-form";

    const students = getEnrolledStudents(TeacherLMS.selectedCourse);
    const studentOptions = students.map(student => `
        <option value="${escapeHTML(studentId(student))}">
            ${escapeHTML(studentName(student))}
        </option>
    `).join("");

    if (action === "marks") {
        form.innerHTML = `
            <h3 style="margin-bottom:15px">Upload / Update Student Marks</h3>
            <label>Student</label>
            <select name="studentId" required>${studentOptions}</select>
            <label>Assessment / Exam Name</label>
            <input name="title" required placeholder="e.g. Midterm Exam">
            <label>Obtained Marks</label>
            <input name="marks" type="number" min="0" step="0.5" required>
            <label>Total Marks</label>
            <input name="totalMarks" type="number" min="1" step="0.5" required>
            <button type="submit">Save Marks</button>
        `;
    } else if (action === "assignment") {
        form.innerHTML = `
            <h3 style="margin-bottom:15px">Create Assignment</h3>
            <label>Assignment Title</label>
            <input name="title" required placeholder="Assignment title">
            <label>Description</label>
            <textarea name="description" rows="3" placeholder="Instructions for students"></textarea>
            <label>Due Date</label>
            <input name="dueDate" type="date" required>
            <label>Total Marks</label>
            <input name="totalMarks" type="number" min="1" required value="100">
            <button type="submit">Publish Assignment</button>
        `;
    } else if (action === "quiz") {
        form.innerHTML = `
            <h3 style="margin-bottom:15px">Create Quiz / Exam</h3>
            <label>Quiz / Exam Title</label>
            <input name="title" required placeholder="e.g. SQL Quiz 1">
            <label>Description / Instructions</label>
            <textarea name="description" rows="3"></textarea>
            <label>Due Date (optional)</label>
            <input name="dueDate" type="date">
            <label>Total Marks</label>
            <input name="totalMarks" type="number" min="1" required value="20">
            <button type="submit">Publish Quiz / Exam</button>
        `;
    } else if (action === "announcement") {
        form.innerHTML = `
            <h3 style="margin-bottom:15px">Publish Course Announcement</h3>
            <label>Announcement Title</label>
            <input name="title" required placeholder="Announcement title">
            <label>Message</label>
            <textarea name="message" rows="4" required placeholder="Write announcement for your students"></textarea>
            <button type="submit">Publish Announcement</button>
        `;
    }

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";
    cancel.style.cssText = "background:#26374b;color:#eaf2ff;margin-top:10px";
    cancel.addEventListener("click", clearForm);
    form.appendChild(cancel);
    container.prepend(form);

    form.addEventListener("submit", event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form).entries());

        if (!TeacherLMS.selectedCourse) {
            alert("Please select a course first.");
            return;
        }

        if (action === "marks") saveMarks(values);
        if (action === "assignment") saveAssignment(values);
        if (action === "quiz") saveQuiz(values);
        if (action === "announcement") saveAnnouncement(values);

        clearForm();
        renderDashboard();
        renderCourseStudents();
        renderRecords();
    });
}

/* ======================== SAVE MARKS ======================== */

function saveMarks(values) {
    const marks = Number(values.marks);
    const total = Number(values.totalMarks);

    if (marks < 0 || total <= 0 || marks > total) {
        alert("Obtained marks must be between 0 and total marks.");
        return;
    }

    const student = TeacherLMS.students.find(
        item => studentId(item) === values.studentId
    );

    if (!student || !getStudentCourses(student).some(
        course => course.code === TeacherLMS.selectedCourse
    )) {
        alert("This student is not enrolled in the selected course.");
        return;
    }

    const record = {
        id: makeId("MARK"),
        teacherId: teacherId(),
        studentId: studentId(student),
        studentName: studentName(student),
        courseCode: TeacherLMS.selectedCourse,
        title: values.title.trim(),
        marks,
        totalMarks: total,
        percentage: Math.round((marks / total) * 100),
        updatedAt: new Date().toISOString()
    };

    const existingIndex = TeacherLMS.data.marks.findIndex(item =>
        item.teacherId === teacherId() &&
        item.studentId === record.studentId &&
        item.courseCode === record.courseCode &&
        item.title.toLowerCase() === record.title.toLowerCase()
    );

    if (existingIndex >= 0) {
        record.id = TeacherLMS.data.marks[existingIndex].id;
        TeacherLMS.data.marks[existingIndex] = record;
    } else {
        TeacherLMS.data.marks.push(record);
    }

    // Also make marks available in the student's existing user record.
    student.results = Array.isArray(student.results) ? student.results : [];

    const oldResultIndex = student.results.findIndex(item =>
        item.courseCode === record.courseCode &&
        String(item.title || item.name || "").toLowerCase() === record.title.toLowerCase()
    );

    const studentResult = {
        id: record.id,
        title: record.title,
        name: record.title,
        courseCode: record.courseCode,
        courseName: courseName(record.courseCode),
        marks: record.marks,
        obtainedMarks: record.marks,
        totalMarks: record.totalMarks,
        percentage: record.percentage,
        updatedAt: record.updatedAt
    };

    if (oldResultIndex >= 0) {
        student.results[oldResultIndex] = studentResult;
    } else {
        student.results.push(studentResult);
    }

    saveData();
    alert("Marks saved successfully for " + studentName(student) + ".");
}

/* ======================== SAVE ASSIGNMENTS ======================== */

function saveAssignment(values) {
    const totalMarks = Number(values.totalMarks);

    if (totalMarks <= 0) {
        alert("Total marks must be greater than zero.");
        return;
    }

    const record = {
        id: makeId("ASG"),
        teacherId: teacherId(),
        courseCode: TeacherLMS.selectedCourse,
        title: values.title.trim(),
        description: (values.description || "").trim(),
        dueDate: values.dueDate,
        totalMarks,
        createdAt: new Date().toISOString(),
        submissions: []
    };

    TeacherLMS.data.assignments.push(record);

    // Add a course-specific assignment to each enrolled student.
    getEnrolledStudents(record.courseCode).forEach(student => {
        student.assignments = Array.isArray(student.assignments)
            ? student.assignments : [];

        if (!student.assignments.some(item =>
            item.id === record.id || item.assignmentId === record.id
        )) {
            student.assignments.push({
                id: record.id,
                assignmentId: record.id,
                title: record.title,
                name: record.title,
                courseCode: record.courseCode,
                courseName: courseName(record.courseCode),
                description: record.description,
                dueDate: record.dueDate,
                totalMarks: record.totalMarks,
                status: "Pending",
                createdAt: record.createdAt
            });
        }
    });

    saveData();
    alert("Assignment published for enrolled students.");
}

/* ======================== SAVE QUIZZES ======================== */

function saveQuiz(values) {
    const totalMarks = Number(values.totalMarks);

    if (totalMarks <= 0) {
        alert("Total marks must be greater than zero.");
        return;
    }

    const record = {
        id: makeId("QUIZ"),
        teacherId: teacherId(),
        courseCode: TeacherLMS.selectedCourse,
        title: values.title.trim(),
        description: (values.description || "").trim(),
        dueDate: values.dueDate || "",
        totalMarks,
        createdAt: new Date().toISOString(),
        published: true
    };

    TeacherLMS.data.quizzes.push(record);

    getEnrolledStudents(record.courseCode).forEach(student => {
        student.quizzes = Array.isArray(student.quizzes) ? student.quizzes : [];

        if (!student.quizzes.some(item => item.id === record.id)) {
            student.quizzes.push({
                id: record.id,
                title: record.title,
                courseCode: record.courseCode,
                courseName: courseName(record.courseCode),
                description: record.description,
                dueDate: record.dueDate,
                totalMarks: record.totalMarks,
                published: true
            });
        }
    });

    saveData();
    alert("Quiz / exam published for enrolled students.");
}

/* ======================== SAVE ANNOUNCEMENTS ======================== */

function saveAnnouncement(values) {
    const record = {
        id: makeId("ANN"),
        teacherId: teacherId(),
        courseCode: TeacherLMS.selectedCourse,
        title: values.title.trim(),
        message: values.message.trim(),
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
    };

    TeacherLMS.data.announcements.push(record);

    // Announcements are attached only to students enrolled in this course.
    getEnrolledStudents(record.courseCode).forEach(student => {
        student.announcements = Array.isArray(student.announcements)
            ? student.announcements : [];

        if (!student.announcements.some(item => item.id === record.id)) {
            student.announcements.push({
                id: record.id,
                title: record.title,
                message: record.message,
                courseCode: record.courseCode,
                courseName: courseName(record.courseCode),
                date: record.date,
                createdAt: record.createdAt
            });
        }
    });

    saveData();
    alert("Announcement published to students in the selected course.");
}

/* ======================== DISPLAY SAVED RECORDS ======================== */

function renderRecords() {
    const container = document.getElementById("teacherRecords");
    if (!container) return;

    const course = TeacherLMS.selectedCourse;
    if (!course) {
        container.innerHTML = emptyMessage("No course is available.");
        return;
    }

    const marks = scopedItems("marks", course);
    const assignments = scopedItems("assignments", course);
    const quizzes = scopedItems("quizzes", course);
    const announcements = scopedItems("announcements", course);

    container.innerHTML = `
        <h3 style="margin-bottom:10px">Saved Records — ${escapeHTML(courseName(course))}</h3>

        <div class="record-actions">
            <button type="button" data-show="marks">Marks (${marks.length})</button>
            <button type="button" data-show="assignments">Assignments (${assignments.length})</button>
            <button type="button" data-show="quizzes">Quizzes (${quizzes.length})</button>
            <button type="button" data-show="announcements">Announcements (${announcements.length})</button>
        </div>

        <div id="recordList"></div>
    `;

    container.querySelectorAll("[data-show]").forEach(button => {
        button.addEventListener("click", () => showRecords(button.dataset.show));
    });

    showRecords("marks");
}

function showRecords(type) {
    const container = document.getElementById("recordList");
    if (!container) return;

    const items = scopedItems(type, TeacherLMS.selectedCourse);

    if (!items.length) {
        container.innerHTML = emptyMessage("No records found for this course yet.");
        return;
    }

    if (type === "marks") {
        container.innerHTML = `
            <div class="teacher-table-wrap">
                <table class="teacher-table">
                    <thead><tr>
                        <th>Student</th><th>Assessment</th>
                        <th>Marks</th><th>Percentage</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                        ${items.slice().reverse().map(item => `
                            <tr>
                                <td>${escapeHTML(item.studentName)}</td>
                                <td>${escapeHTML(item.title)}</td>
                                <td>${item.marks} / ${item.totalMarks}</td>
                                <td>${item.percentage}%</td>
                                <td>
                                    <button type="button" data-edit-mark="${escapeHTML(item.id)}"
                                        style="background:#12344d;color:#69d0ff;border:0;border-radius:6px;padding:6px;cursor:pointer">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

        container.querySelectorAll("[data-edit-mark]").forEach(button => {
            button.addEventListener("click", () => {
                const record = TeacherLMS.data.marks.find(item =>
                    item.id === button.dataset.editMark
                );
                if (!record) return;

                openManagementForm("marks");

                const form = document.getElementById("teacherForm");
                if (!form) return;

                form.studentId.value = record.studentId;
                form.title.value = record.title;
                form.marks.value = record.marks;
                form.totalMarks.value = record.totalMarks;
            });
        });

        return;
    }

    if (type === "assignments" || type === "quizzes") {
        container.innerHTML = `
            <div class="teacher-table-wrap">
                <table class="teacher-table">
                    <thead><tr><th>Title</th><th>Due Date</th><th>Total Marks</th><th>Created</th></tr></thead>
                    <tbody>
                        ${items.slice().reverse().map(item => `
                            <tr>
                                <td>${escapeHTML(item.title)}</td>
                                <td>${escapeHTML(item.dueDate || "Not set")}</td>
                                <td>${item.totalMarks}</td>
                                <td>${escapeHTML(new Date(item.createdAt).toLocaleDateString())}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    container.innerHTML = items.slice().reverse().map(item => `
        <div class="task-item">
            <div class="announcement-icon"><i class="fa-solid fa-bullhorn"></i></div>
            <div class="item-info">
                <strong>${escapeHTML(item.title)}</strong>
                <small>${escapeHTML(item.message)}</small>
            </div>
        </div>
    `).join("");
}

/* ======================== SIDEBAR / LOGOUT ======================== */

function initMenu() {
    const button = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (button && sidebar) {
        button.addEventListener("click", () => sidebar.classList.toggle("open"));
    }
}

function initLogout() {
    const button = document.getElementById("logoutBtn");
    if (!button) return;

    button.addEventListener("click", event => {
        event.preventDefault();

        if (!confirm("Are you sure you want to logout?")) return;

        // Clear the current session only; preserve users and academic records.
        [
            "learnora_current_user",
            "current_teacher",
            "currentTeacher",
            "logged_in_user",
            "learnora_logged_in",
            "logged_in",
            "learnora_user_role",
            "user_role",
            "learnora_user_email",
            "user_email",
            "learnora_user_id",
            "user_id"
        ].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        window.location.href = "../../index.html";
    });
}

/* ======================== UTILITIES ======================== */

function makeId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function emptyMessage(message) {
    return `<p class="teacher-notice">${escapeHTML(message)}</p>`;
}

window.LearnoraTeacher = {
    renderDashboard,
    renderRecords,
    saveData
};
