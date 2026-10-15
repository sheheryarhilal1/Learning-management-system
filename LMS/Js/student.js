/* =========================================================
   LEARNORA LMS — STUDENT PORTAL JAVASCRIPT
   Student Portal + Published Teacher Assignments
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initStudentPortal();
});

function initStudentPortal() {
    initSidebar();
    initActiveNavigation();
    initSearch();
    initNotifications();
    initCourseActions();
    initLectureFilters();
    initGeneralFilters();
    initTabs();
    initModal();
    initQuiz();
    initButtons();
    initLocalStorage();

    // NEW: Load published assignments for logged-in student
    initStudentAssignments();
}

/* =========================================================
   2. SIDEBAR MENU
   ========================================================= */

function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const menuButton = document.querySelector(".mobile-menu-btn");

    if (!sidebar || !menuButton) return;

    sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    document.body.classList.remove("sidebar-open");
    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        sidebar.classList.contains("open")
            ? closeSidebar()
            : openSidebar();
    });

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", closeSidebar);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeSidebar();
    });

    function openSidebar() {
        sidebar.classList.add("open");
        if (overlay) overlay.classList.add("show");
        document.body.classList.add("sidebar-open");
        menuButton.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
        document.body.classList.remove("sidebar-open");
        menuButton.setAttribute("aria-expanded", "false");
    }
}

/* =========================================================
   3. ACTIVE SIDEBAR NAVIGATION
   ========================================================= */

function initActiveNavigation() {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (!href) return;

        const linkPage = href.split("/").pop().toLowerCase();

        if (linkPage && linkPage === currentPage) {
            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");
        }
    });
}

/* =========================================================
   4. GLOBAL SEARCH
   ========================================================= */

function initSearch() {
    document.querySelectorAll(".topbar-search input, [data-search]")
        .forEach(input => {
            input.addEventListener("input", debounce(function () {
                performSearch(this.value.trim().toLowerCase());
            }, 250));
        });
}

function performSearch(query) {
    const items = document.querySelectorAll(`
        .course-card,
        .lecture-item,
        .recording-card,
        .assignment-item,
        .quiz-card,
        .announcement-item,
        .material-card,
        .activity-item
    `);

    items.forEach(item => {
        item.style.display =
            !query || item.innerText.toLowerCase().includes(query)
                ? ""
                : "none";
    });
}

/* =========================================================
   5. NOTIFICATIONS
   ========================================================= */

function initNotifications() {
    document.querySelectorAll(".topbar-icon").forEach(button => {
        const icon = button.querySelector("i");

        if (icon && icon.classList.contains("fa-bell")) {
            button.addEventListener("click", () => {
                showToast("You have 3 new notifications.", "info");

                const dot = button.querySelector(".notification-dot");
                if (dot) dot.remove();
            });
        }
    });
}

/* =========================================================
   6. COURSE ACTIONS
   ========================================================= */

function initCourseActions() {
    document.querySelectorAll("[data-course-open], .open-course")
        .forEach(button => {
            button.addEventListener("click", event => {
                const target =
                    button.dataset.courseOpen ||
                    button.getAttribute("href");

                if (target && target !== "#") return;

                event.preventDefault();
                window.location.href = "course-detail.html";
            });
        });

    document.querySelectorAll(".drop-course, [data-drop-course]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const name =
                    button.dataset.dropCourse ||
                    getClosestCourseName(button);

                if (!confirm(`Are you sure you want to drop ${name}?`)) {
                    return;
                }

                const card = button.closest(
                    ".course-card, tr, .assignment-item"
                );

                if (card) {
                    card.style.opacity = "0.45";
                    button.disabled = true;
                    button.textContent = "Dropped";
                }

                showToast(`${name} has been dropped successfully.`, "success");
            });
        });

    document.querySelectorAll(".add-course, [data-add-course]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const name =
                    button.dataset.addCourse ||
                    getClosestCourseName(button);

                button.disabled = true;
                button.innerHTML = '<i class="fa-solid fa-check"></i> Added';
                button.classList.remove("btn-primary");
                button.classList.add("btn-success");

                showToast(`${name} has been added to your courses.`, "success");
            });
        });

    const searchButton = document.querySelector(
        "#courseSearchBtn, .course-code-search .btn"
    );

    const codeInput = document.querySelector(
        "#courseCode, .course-code-search .form-input"
    );

    if (searchButton && codeInput) {
        searchButton.addEventListener("click", () => {
            const code = codeInput.value.trim().toUpperCase();

            if (!code) {
                showToast("Please enter a course code.", "warning");
                codeInput.focus();
                return;
            }

            searchCourseCode(code);
        });

        codeInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchButton.click();
            }
        });
    }
}

/* =========================================================
   7. COURSE CODE SEARCH
   ========================================================= */

function searchCourseCode(code) {
    const cards = document.querySelectorAll("[data-course-code]");
    let found = false;

    cards.forEach(card => {
        if ((card.dataset.courseCode || "").toUpperCase() === code) {
            found = true;

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            card.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";

            setTimeout(() => {
                card.style.boxShadow = "";
            }, 1800);
        }
    });

    if (found) {
        showToast(`Course ${code} found.`, "success");
        return;
    }

    const demoCourses = {
        "AI-401": {
            name: "Artificial Intelligence",
            instructor: "Dr. Hassan Ahmed"
        },
        "CS-409": {
            name: "Cloud Computing",
            instructor: "Dr. Bilal Khan"
        },
        "DS-405": {
            name: "Machine Learning",
            instructor: "Dr. Ayesha Malik"
        }
    };

    if (demoCourses[code]) {
        showToast(
            `${demoCourses[code].name} — ${demoCourses[code].instructor}`,
            "info"
        );
        return;
    }

    showToast(`No course found with code ${code}.`, "danger");
}

/* =========================================================
   8. LECTURE FILTERS
   ========================================================= */

function initLectureFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const lectures = document.querySelectorAll(".lecture-item");

    if (!buttons.length || !lectures.length) return;

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filter = (
                button.dataset.filter ||
                button.textContent.trim()
            ).toLowerCase();

            lectures.forEach(item => {
                const status = getLectureStatus(item);

                if (filter === "all" || filter.includes("all")) {
                    item.style.display = "";
                } else if (filter.includes("completed")) {
                    item.style.display =
                        status === "completed" ? "" : "none";
                } else if (filter.includes("pending")) {
                    item.style.display =
                        status !== "completed" ? "" : "none";
                } else {
                    item.style.display = "";
                }
            });
        });
    });
}

function getLectureStatus(item) {
    if (
        item.querySelector(".badge-success") ||
        item.classList.contains("completed")
    ) {
        return "completed";
    }

    return "pending";
}

/* =========================================================
   9. GENERAL FILTERS
   ========================================================= */

function initGeneralFilters() {
    document.querySelectorAll("[data-filter]").forEach(button => {
        if (button.closest(".lecture-list")) return;

        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            if (!filter) return;

            const group = button.closest(".filter-group");

            if (group) {
                group.querySelectorAll("[data-filter]").forEach(item => {
                    item.classList.remove("active");
                });
            }

            button.classList.add("active");
            applyGenericFilter(filter);
        });
    });
}

function applyGenericFilter(filter) {
    const normalized = filter.toLowerCase();

    document.querySelectorAll(`
        .assignment-item,
        .quiz-card,
        .recording-card,
        .material-card,
        .announcement-item
    `).forEach(item => {
        if (normalized === "all") {
            item.style.display = "";
            return;
        }

        const status = (item.dataset.status || "").toLowerCase();
        const text = item.innerText.toLowerCase();

        item.style.display =
            status === normalized || text.includes(normalized)
                ? ""
                : "none";
    });
}

/* =========================================================
   10. COURSE / PAGE TABS
   ========================================================= */

function initTabs() {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", event => {
            const target = tab.dataset.tab;

            if (!target && !tab.getAttribute("href")) {
                event.preventDefault();
            }

            const parent = tab.parentElement;

            if (parent) {
                parent.querySelectorAll(".tab").forEach(item => {
                    item.classList.remove("active");
                });
            }

            tab.classList.add("active");

            if (target) switchTabContent(target);
        });
    });
}

function switchTabContent(target) {
    document.querySelectorAll("[data-tab-content]").forEach(section => {
        section.style.display =
            section.dataset.tabContent === target ? "" : "none";
    });
}

/* =========================================================
   11. MODAL
   ========================================================= */

function initModal() {
    document.querySelectorAll("[data-modal]").forEach(trigger => {
        trigger.addEventListener("click", event => {
            event.preventDefault();

            const modal = document.getElementById(trigger.dataset.modal);
            if (modal) openModal(modal);
        });
    });

    document.querySelectorAll(".modal-close, [data-modal-close]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const modal = button.closest(".modal-overlay");
                if (modal) closeModal(modal);
            });
        });

    document.addEventListener("click", event => {
        if (event.target.classList.contains("modal-overlay")) {
            closeModal(event.target);
        }
    });
}

function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
}

/* =========================================================
   12. QUIZ SYSTEM
   ========================================================= */

let currentQuestion = 0;
let quizQuestions = [];
let quizTimerInterval = null;

function initQuiz() {
    const quizForm = document.querySelector("#quizForm, .quiz-question-card");
    if (!quizForm) return;

    setupQuizQuestions();
    setupQuizNavigation();
    setupQuizTimer();
    setupQuestionMap();
    restoreQuizAnswers();
}

function setupQuizQuestions() {
    const questions = document.querySelectorAll("[data-question]");

    if (!questions.length) {
        quizQuestions = [];
        return;
    }

    quizQuestions = Array.from(questions);

    quizQuestions.forEach((question, index) => {
        question.dataset.index = index;
        if (index !== 0) question.style.display = "none";
    });

    updateQuestionCounter();
}

function setupQuizNavigation() {
    const nextButton = document.querySelector(
        "#nextQuestion, [data-next-question]"
    );

    const previousButton = document.querySelector(
        "#previousQuestion, [data-previous-question]"
    );

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            saveCurrentAnswer();

            if (currentQuestion === quizQuestions.length - 1) {
                submitQuiz();
            } else {
                goToQuestion(currentQuestion + 1);
            }
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            saveCurrentAnswer();
            goToQuestion(currentQuestion - 1);
        });
    }

    const submitButton = document.querySelector(
        "#submitQuiz, [data-submit-quiz]"
    );

    if (submitButton) {
        submitButton.addEventListener("click", submitQuiz);
    }
}

function goToQuestion(index) {
    if (index < 0 || index >= quizQuestions.length) return;

    quizQuestions.forEach(question => {
        question.style.display = "none";
    });

    currentQuestion = index;
    quizQuestions[currentQuestion].style.display = "";

    updateQuestionCounter();
    updateQuizNavigation();
    updateQuestionMap();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateQuestionCounter() {
    const current = document.querySelector(
        "#currentQuestion, [data-current-question]"
    );

    const total = document.querySelector(
        "#totalQuestions, [data-total-questions]"
    );

    if (current) current.textContent = currentQuestion + 1;
    if (total) total.textContent = quizQuestions.length;

    const progress = document.querySelector("[data-quiz-progress]");

    if (progress) {
        progress.style.width = `${
            quizQuestions.length
                ? ((currentQuestion + 1) / quizQuestions.length) * 100
                : 0
        }%`;
    }
}

function updateQuizNavigation() {
    const previous = document.querySelector(
        "#previousQuestion, [data-previous-question]"
    );

    const next = document.querySelector(
        "#nextQuestion, [data-next-question]"
    );

    if (previous) previous.disabled = currentQuestion === 0;

    if (next) {
        next.innerHTML =
            currentQuestion === quizQuestions.length - 1
                ? 'Submit <i class="fa-solid fa-check"></i>'
                : 'Next <i class="fa-solid fa-arrow-right"></i>';
    }
}

function setupQuestionMap() {
    document.querySelectorAll(".question-map-btn").forEach((button, index) => {
        button.addEventListener("click", () => {
            saveCurrentAnswer();
            goToQuestion(index);
        });
    });

    updateQuestionMap();
}

function updateQuestionMap() {
    document.querySelectorAll(".question-map-btn").forEach((button, index) => {
        button.classList.toggle("active", index === currentQuestion);
    });
}

function saveCurrentAnswer() {
    if (!quizQuestions.length) return;

    const current = quizQuestions[currentQuestion];
    const selected = current.querySelector("input[type='radio']:checked");

    if (!selected) return;

    localStorage.setItem(
        `learnora_quiz_${getQuizId()}_${currentQuestion}`,
        selected.value
    );

    const mapButton = document.querySelector(
        `.question-map-btn:nth-child(${currentQuestion + 1})`
    );

    if (mapButton) mapButton.classList.add("completed");
}

function restoreQuizAnswers() {
    if (!quizQuestions.length) return;

    quizQuestions.forEach((question, index) => {
        const saved = localStorage.getItem(
            `learnora_quiz_${getQuizId()}_${index}`
        );

        if (!saved) return;

        const radio = Array.from(
            question.querySelectorAll('input[type="radio"]')
        ).find(input => input.value === saved);

        if (radio) radio.checked = true;
    });
}

function getQuizId() {
    const quiz = document.querySelector("[data-quiz-id]");

    if (quiz && quiz.dataset.quizId) return quiz.dataset.quizId;

    return document.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

/* =========================================================
   13. QUIZ TIMER
   ========================================================= */

function setupQuizTimer() {
    const timer = document.querySelector("[data-quiz-timer], #quizTimer");
    if (!timer) return;

    let minutes = parseInt(timer.dataset.minutes || "20", 10);
    let seconds = parseInt(timer.dataset.seconds || "0", 10);

    function updateTimer() {
        timer.textContent =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;

        if (minutes === 0 && seconds === 0) {
            clearInterval(quizTimerInterval);
            showToast("Time is over. Your quiz is being submitted.", "danger");
            submitQuiz(true);
            return;
        }

        if (seconds === 0) {
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }

        if (minutes < 2) {
            timer.style.background = "#fff0f0";
            timer.style.color = "#dc2626";
        }
    }

    updateTimer();
    quizTimerInterval = setInterval(updateTimer, 1000);
}

/* =========================================================
   14. SUBMIT QUIZ
   ========================================================= */

function submitQuiz(timeExpired = false) {
    saveCurrentAnswer();

    if (!timeExpired && !confirm("Are you sure you want to submit this quiz?")) {
        return;
    }

    if (quizTimerInterval) clearInterval(quizTimerInterval);

    const answers = quizQuestions.map(question => {
        const selected = question.querySelector("input[type='radio']:checked");
        return selected ? selected.value : null;
    });

    localStorage.setItem(
        `learnora_quiz_result_${getQuizId()}`,
        JSON.stringify({
            answers,
            submittedAt: new Date().toISOString()
        })
    );

    showToast("Quiz submitted successfully!", "success");

    setTimeout(() => {
        if (window.location.pathname.includes("/student/")) {
            window.location.href = "results.html";
        }
    }, 1200);
}

/* =========================================================
   15. BUTTON INTERACTIONS
   ========================================================= */

function initButtons() {
    document.querySelectorAll(".watch-recording, [data-watch-recording]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const title =
                    button.dataset.watchRecording || "Lecture Recording";

                showToast(`Opening ${title}...`, "info");
                button.innerHTML =
                    '<i class="fa-solid fa-play"></i> Playing';
            });
        });

    document.querySelectorAll(".submit-assignment, [data-submit-assignment]")
        .forEach(button => {
            button.addEventListener("click", () => {
                showToast(
                    "Assignment submission panel opened. File submission is not configured yet.",
                    "info"
                );
            });
        });

    document.querySelectorAll(".start-quiz, [data-start-quiz]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const href = button.getAttribute("href");
                if (href && href !== "#") return;
                window.location.href = "quiz.html";
            });
        });

    document.querySelectorAll(".download-material, [data-download-material]")
        .forEach(button => {
            button.addEventListener("click", event => {
                const href = button.getAttribute("href");
                if (href && href !== "#") return;

                event.preventDefault();
                showToast("Demo download started.", "info");
            });
        });

    document.querySelectorAll(".continue-lecture, [data-continue-lecture]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const href = button.getAttribute("href");
                if (href && href !== "#") return;
                window.location.href = "lectures.html";
            });
        });
}

/* =========================================================
   16. LOCAL STORAGE
   ========================================================= */

function initLocalStorage() {
    const savedName = localStorage.getItem("learnora_student_name");

    if (savedName) {
        document.querySelectorAll("[data-student-name]").forEach(element => {
            element.textContent = savedName;
        });
    } else {
        // Avoid creating a default name if a real logged-in user exists.
        const currentUser = getLoggedInStudent();

        if (currentUser && (currentUser.name || currentUser.fullName)) {
            const name = currentUser.name || currentUser.fullName;

            localStorage.setItem("learnora_student_name", name);

            document.querySelectorAll("[data-student-name]").forEach(element => {
                element.textContent = name;
            });
        }
    }

    const theme = localStorage.getItem("learnora_theme");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    }
}

/* =========================================================
   17. STUDENT ASSIGNMENTS — NEW INTEGRATION
   Reads published assignments saved by teacher's assignments.html
   Storage key: learnora_teacher_assignments
   ========================================================= */

function initStudentAssignments() {
    const assignments = getPublishedAssignmentsForStudent();

    renderStudentAssignments(assignments);

    // Refresh if teacher data changes in another browser tab.
    window.addEventListener("storage", event => {
        if (
            event.key === "learnora_teacher_assignments" ||
            event.key === "learnora_users" ||
            event.key === "learnora_current_user"
        ) {
            renderStudentAssignments(getPublishedAssignmentsForStudent());
        }
    });
}

/* Get the currently logged-in student */
function getLoggedInStudent() {
    const possibleKeys = [
        "learnora_current_user",
        "current_student",
        "currentStudent",
        "logged_in_user",
        "learnora_logged_in_user"
    ];

    let currentUser = null;

    for (const key of possibleKeys) {
        const value = readJSON(key, null);

        if (value && typeof value === "object") {
            currentUser = value;
            break;
        }
    }

    // If current user is represented by an ID/email string,
    // resolve it against learnora_users.
    const users = readJSON("learnora_users", []);
    const userList = Array.isArray(users)
        ? users
        : Object.values(users || {});

    if (typeof currentUser === "string") {
        const identifier = currentUser.toLowerCase();

        currentUser = userList.find(user => {
            return [
                user.id,
                user.studentId,
                user.student_id,
                user.email,
                user.username
            ].some(value =>
                value && String(value).toLowerCase() === identifier
            );
        }) || null;
    }

    // Find the student record by ID/email if a session exists.
    if (currentUser && typeof currentUser === "object") {
        const identifierValues = [
            currentUser.id,
            currentUser.userId,
            currentUser.user_id,
            currentUser.studentId,
            currentUser.student_id,
            currentUser.email,
            currentUser.username
        ].filter(Boolean).map(value => String(value).toLowerCase());

        const matchedUser = userList.find(user => {
            const userValues = [
                user.id,
                user.userId,
                user.user_id,
                user.studentId,
                user.student_id,
                user.email,
                user.username
            ].filter(Boolean).map(value => String(value).toLowerCase());

            return identifierValues.some(value => userValues.includes(value));
        });

        if (matchedUser) {
            return { ...matchedUser, ...currentUser };
        }

        return currentUser;
    }

    return null;
}

/* Find this student's record inside learnora_users */
function getStudentRecord(currentUser) {
    if (!currentUser) return null;

    const users = readJSON("learnora_users", []);
    const userList = Array.isArray(users)
        ? users
        : Object.values(users || {});

    const identifiers = [
        currentUser.id,
        currentUser.userId,
        currentUser.user_id,
        currentUser.studentId,
        currentUser.student_id,
        currentUser.email,
        currentUser.username
    ].filter(Boolean).map(value => String(value).toLowerCase());

    return userList.find(user => {
        const values = [
            user.id,
            user.userId,
            user.user_id,
            user.studentId,
            user.student_id,
            user.email,
            user.username
        ].filter(Boolean).map(value => String(value).toLowerCase());

        return identifiers.some(value => values.includes(value));
    }) || null;
}

/* Read the student's enrolled courses */
function getStudentEnrolledCourses(currentUser, studentRecord) {
    const courses = [];

    function addCourses(source) {
        if (!source) return;

        if (typeof source === "string") {
            source.split(",").forEach(value => {
                if (value.trim()) courses.push(value.trim());
            });
            return;
        }

        if (Array.isArray(source)) {
            source.forEach(course => {
                if (typeof course === "string") {
                    courses.push(course);
                } else if (course && typeof course === "object") {
                    courses.push(
                        course.code ||
                        course.courseCode ||
                        course.course_code ||
                        course.courseName ||
                        course.name ||
                        course.title ||
                        course.id ||
                        ""
                    );
                }
            });
            return;
        }

        if (typeof source === "object") {
            Object.values(source).forEach(value => addCourses(value));
        }
    }

    const sources = [
        currentUser && currentUser.courses,
        currentUser && currentUser.enrolledCourses,
        currentUser && currentUser.enrolled_courses,
        currentUser && currentUser.subjects,
        currentUser && currentUser.academicData &&
            currentUser.academicData.courses,

        studentRecord && studentRecord.courses,
        studentRecord && studentRecord.enrolledCourses,
        studentRecord && studentRecord.enrolled_courses,
        studentRecord && studentRecord.subjects,
        studentRecord && studentRecord.academicData &&
            studentRecord.academicData.courses,

        readJSON("learnora_student_courses", [])
    ];

    sources.forEach(addCourses);

    // Remove duplicate course names/codes.
    return [...new Set(
        courses
            .filter(Boolean)
            .map(course => String(course).trim())
            .filter(Boolean)
    )];
}

/* Normalize course code/name for matching */
function normalizeCourse(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
}

/* Match assignment course with enrolled student courses */
function studentIsEnrolledInCourse(enrolledCourses, assignmentCourse) {
    if (!assignmentCourse) return false;

    const target = normalizeCourse(assignmentCourse);

    if (!target) return false;

    return enrolledCourses.some(course => {
        const normalized = normalizeCourse(course);

        // Exact match is preferred. Partial match also supports
        // "CS-401 Software Engineering" vs "CS-401".
        return normalized === target ||
            normalized.includes(target) ||
            target.includes(normalized);
    });
}

/* Retrieve published assignments for the logged-in student */
function getPublishedAssignmentsForStudent() {
    const currentUser = getLoggedInStudent();

    if (!currentUser) {
        console.warn(
            "Learnora: Logged-in student was not found. " +
            "Check the login session storage key."
        );
        return [];
    }

    const studentRecord = getStudentRecord(currentUser);

    const enrolledCourses = getStudentEnrolledCourses(
        currentUser,
        studentRecord
    );

    const allAssignments = readJSON("learnora_teacher_assignments", []);

    const assignmentList = Array.isArray(allAssignments)
        ? allAssignments
        : Object.values(allAssignments || {});

    const studentId = String(
        currentUser.id ||
        currentUser.studentId ||
        currentUser.student_id ||
        currentUser.email ||
        currentUser.username ||
        ""
    ).toLowerCase();

    return assignmentList.filter(assignment => {
        if (!assignment || typeof assignment !== "object") return false;

        const status = String(assignment.status || "").toLowerCase();

        if (status !== "published") return false;

        const assignmentCourse =
            assignment.course ||
            assignment.courseName ||
            assignment.course_name ||
            assignment.courseCode ||
            assignment.course_code ||
            "";

        // If the student has no course data in their login/user record,
        // do not display assignments from every course.
        if (!enrolledCourses.length) {
            console.warn(
                "Learnora: No enrolled courses found for this student.",
                studentId
            );
            return false;
        }

        return studentIsEnrolledInCourse(
            enrolledCourses,
            assignmentCourse
        );
    }).sort((a, b) => {
        return new Date(a.dueDate || "2999-12-31") -
            new Date(b.dueDate || "2999-12-31");
    });
}

/* Render assignments in the existing assignment section */
function renderStudentAssignments(assignments) {
    let container = document.querySelector(
        "#assignmentsList, #assignmentList, " +
        ".assignments-list, .assignment-list, " +
        "[data-student-assignments]"
    );

    // If a container doesn't exist, find an existing assignment section.
    if (!container) {
        const section = document.querySelector(
            "#assignments, #assignmentsSection, " +
            ".assignments-section, [data-section='assignments']"
        );

        if (section) {
            container = document.createElement("div");
            container.id = "assignmentsList";
            container.className = "assignments-list";
            section.appendChild(container);
        }
    }

    // Do not inject into an unrelated page if no assignment section exists.
    if (!container) {
        console.warn(
            "Learnora: Assignment container not found. " +
            "Add <div id=\"assignmentsList\"></div> to the student assignments page."
        );
        return;
    }

    if (!assignments.length) {
        container.innerHTML = `
            <div class="assignment-empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <h3>No Published Assignments</h3>
                <p>
                    Published assignments for your enrolled courses
                    will appear here.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = assignments.map(assignment => {
        const id = escapeHTML(assignment.id || "");
        const title = escapeHTML(assignment.title || "Untitled Assignment");
        const course = escapeHTML(
            assignment.course ||
            assignment.courseName ||
            assignment.courseCode ||
            "Course"
        );
        const description = escapeHTML(
            assignment.description || "No description provided."
        );
        const dueDate = formatAssignmentDate(assignment.dueDate);
        const marks = escapeHTML(assignment.totalMarks ?? assignment.marks ?? "—");

        const overdue = assignment.dueDate &&
            new Date(assignment.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

        return `
            <article class="assignment-item"
                     data-status="published"
                     data-assignment-id="${id}">
                <div class="assignment-item-header">
                    <div class="assignment-icon">
                        <i class="fa-solid fa-file-lines"></i>
                    </div>
                    <div class="assignment-heading">
                        <h3 class="assignment-title">${title}</h3>
                        <span class="assignment-course">${course}</span>
                    </div>
                    <span class="assignment-status ${
                        overdue ? "overdue" : "published"
                    }">
                        ${overdue ? "Past Due" : "Published"}
                    </span>
                </div>

                <p class="assignment-description">${description}</p>

                <div class="assignment-meta">
                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        Due: ${dueDate}
                    </span>
                    <span>
                        <i class="fa-solid fa-star"></i>
                        Total Marks: ${marks}
                    </span>
                </div>

                <div class="assignment-actions">
                    <button type="button"
                            class="btn btn-primary submit-assignment"
                            data-submit-assignment="${id}"
                            ${overdue ? "disabled" : ""}>
                        <i class="fa-solid fa-upload"></i>
                        ${overdue ? "Past Due" : "Submit Assignment"}
                    </button>
                </div>
            </article>
        `;
    }).join("");

    // Attach submit buttons added dynamically after page load.
    container.querySelectorAll("[data-submit-assignment]").forEach(button => {
        button.addEventListener("click", () => {
            showToast(
                "Assignment submission panel opened. " +
                "File upload and submission saving need to be implemented separately.",
                "info"
            );
        });
    });
}

function formatAssignmentDate(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(value);
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (value === null || value === "") return fallback;

        return JSON.parse(value);
    } catch (error) {
        console.warn(`Learnora: Could not parse localStorage key "${key}".`, error);
        return fallback;
    }
}

/* =========================================================
   18. TOAST NOTIFICATIONS
   ========================================================= */

function showToast(message, type = "info") {
    let container = document.querySelector(".toast-container");

    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        Object.assign(container.style, {
            position: "fixed",
            right: "22px",
            bottom: "22px",
            zIndex: "9999",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        });

        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    Object.assign(toast.style, {
        minWidth: "280px",
        maxWidth: "380px",
        padding: "13px 15px",
        borderRadius: "11px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 15px 40px rgba(15,23,42,.15)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "DM Sans, Manrope, sans-serif",
        fontSize: "11px",
        fontWeight: "700",
        color: "#0f172a",
        opacity: "0",
        transform: "translateY(10px)",
        transition: "all .25s ease"
    });

    const styles = {
        info: ["fa-circle-info", "#2563eb"],
        success: ["fa-circle-check", "#059669"],
        warning: ["fa-triangle-exclamation", "#d97706"],
        danger: ["fa-circle-xmark", "#dc2626"]
    };

    const [icon, iconColor] = styles[type] || styles.info;

    const iconElement = document.createElement("i");
    iconElement.className = `fa-solid ${icon}`;
    iconElement.style.color = iconColor;
    iconElement.style.fontSize = "15px";

    const textElement = document.createElement("span");
    textElement.textContent = String(message);

    toast.append(iconElement, textElement);
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}

/* =========================================================
   19. GET COURSE NAME
   ========================================================= */

function getClosestCourseName(element) {
    const card = element.closest(`
        .course-card,
        .assignment-item,
        .quiz-card,
        tr
    `);

    if (!card) return "Course";

    const title = card.querySelector(`
        .course-cover-title,
        .course-title,
        .assignment-title,
        .quiz-title,
        .table-title
    `);

    return title ? title.textContent.trim() : "Course";
}

/* =========================================================
   20. DEBOUNCE
   ========================================================= */

function debounce(callback, delay) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}

/* =========================================================
   21. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   22. WINDOW RESIZE
   ========================================================= */

window.addEventListener("resize", debounce(() => {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const menuButton = document.querySelector(".mobile-menu-btn");

    if (!sidebar) return;

    sidebar.classList.remove("open");

    if (overlay) overlay.classList.remove("show");

    document.body.classList.remove("sidebar-open");

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
    }
}, 150));

/* =========================================================
   23. PREVENT DOUBLE FORM SUBMISSION
   ========================================================= */

document.addEventListener("submit", event => {
    const form = event.target;

    if (!form.matches("form")) return;

    const button = form.querySelector('button[type="submit"]');

    if (!button) return;

    if (button.dataset.submitting === "true") {
        event.preventDefault();
        return;
    }

    button.dataset.submitting = "true";

    setTimeout(() => {
        button.dataset.submitting = "false";
    }, 1500);
});

/* =========================================================
   24. SMOOTH INTERNAL LINKS
   ========================================================= */

document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');

    if (!link) return;

    const targetId = link.getAttribute("href");

    if (targetId === "#" || targetId.length < 2) return;

    let target;

    try {
        target = document.querySelector(targetId);
    } catch (error) {
        return;
    }

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

/* =========================================================
   25. PAGE VISIBILITY
   ========================================================= */

document.addEventListener("visibilitychange", () => {
    if (document.hidden && quizTimerInterval) {
        // Timer continues naturally while the page is hidden.
    }
});

/* =========================================================
   26. GLOBAL EXPORTS
   ========================================================= */

window.LearnoraStudent = {
    showToast,
    openModal,
    closeModal,
    goToQuestion,
    submitQuiz,
    searchCourseCode,
    getPublishedAssignmentsForStudent,
    renderStudentAssignments
};

/* =========================================================
   END OF STUDENT.JS
   ========================================================= */
   /* =========================================================
   LEARNORA LMS — STUDENT ASSIGNMENTS INTEGRATION
   Reads assignments published by the teacher.
   Uses the existing assignments.html UI.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initPublishedStudentAssignments();
});

function initPublishedStudentAssignments() {
    const $ = (id) => document.getElementById(id);

    const readJSON = (key, fallback = null) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error(`Unable to read ${key}:`, error);
            return fallback;
        }
    };

    const currentUser = readJSON("learnora_current_user");

    // Login protection
    if (!currentUser) {
        window.location.href = "../login.html";
        return;
    }

    const role = String(currentUser.role || "")
        .trim()
        .toLowerCase();

    if (role && role !== "student") {
        if (role === "teacher") {
            window.location.href = "../teacher/dashboard.html";
        } else if (role === "parent") {
            window.location.href = "../parent/dashboard.html";
        } else {
            window.location.href = "../login.html";
        }
        return;
    }

    const allUsers = readJSON("learnora_users", []);
    const email = String(currentUser.email || "").trim().toLowerCase();
    const userId = String(
        currentUser.id ||
        currentUser.studentId ||
        currentUser.userId ||
        ""
    ).trim();

    // Find the full student record, if stored separately.
    const savedStudent = Array.isArray(allUsers)
        ? allUsers.find(user => {
            const sameEmail =
                email &&
                String(user.email || "").trim().toLowerCase() === email;

            const savedId = String(
                user.id ||
                user.studentId ||
                user.userId ||
                ""
            ).trim();

            return (sameEmail || (userId && savedId === userId)) &&
                (!user.role ||
                    String(user.role).toLowerCase() === "student");
        })
        : null;

    const student = {
        ...(savedStudent || {}),
        ...currentUser
    };

    const studentName =
        student.name ||
        student.fullName ||
        student.username ||
        "Student";

    const program =
        student.program ||
        student.department ||
        student.degree ||
        "Student";

    const initials = studentName
        .trim()
        .split(/\s+/)
        .map(part => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "ST";

    const setText = (id, value) => {
        const element = $(id);
        if (element) element.textContent = String(value ?? "");
    };

    // Update student profile UI.
    setText("sidebarStudentName", studentName);
    setText("sidebarStudentProgram", program);
    setText("topbarStudentName", studentName);
    setText("sidebarAvatar", initials);
    setText("topbarAvatar", initials);
    setText("assignmentAccount", `${studentName} · ${program}`);

    /* ---------------------------------------------------------
       1. GET ENROLLED COURSES
    --------------------------------------------------------- */

    const courseSources = [
        student.courses,
        student.enrolledCourses,
        student.enrolled_courses,
        student.courseCodes,
        student.subjects,
        student.registeredCourses,
        student.courseList,
        student.academicData?.courses,
        student.academic_data?.courses,
        student.profile?.courses
    ];

    const normalize = value => String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");

    const enrolledCourses = [];

    function addCourse(course) {
        if (!course) return;

        if (typeof course === "string" || typeof course === "number") {
            const text = String(course).trim();
            if (text && !enrolledCourses.some(c => normalize(c) === normalize(text))) {
                enrolledCourses.push(text);
            }
            return;
        }

        if (typeof course === "object") {
            const values = [
                course.code,
                course.courseCode,
                course.course_code,
                course.courseId,
                course.course_id,
                course.name,
                course.courseName,
                course.title
            ].filter(Boolean);

            values.forEach(value => addCourse(value));
        }
    }

    courseSources.forEach(source => {
        if (Array.isArray(source)) {
            source.forEach(addCourse);
        } else if (source && typeof source === "object") {
            Object.values(source).forEach(addCourse);
        }
    });

    /*
     * Include course registrations stored separately, if present.
     * If this key is a general course catalogue rather than the
     * logged-in student's enrollment list, do not use it here.
     */
    const extraCourses = readJSON("learnora_student_courses", []);

    if (Array.isArray(extraCourses)) {
        extraCourses.forEach(item => {
            if (item && typeof item === "object") {
                const owner = String(
                    item.studentEmail || item.email || item.studentId || ""
                ).trim().toLowerCase();

                const belongsToStudent =
                    !owner ||
                    owner === email ||
                    owner === String(student.id || "").trim().toLowerCase();

                if (belongsToStudent) addCourse(item);
            } else {
                addCourse(item);
            }
        });
    }

    // Course code/name matching without showing unrelated courses.
    function courseMatches(assignmentCourse) {
        if (!assignmentCourse || !enrolledCourses.length) return false;

        const target = normalize(assignmentCourse);
        if (!target) return false;

        return enrolledCourses.some(course => {
            const enrolled = normalize(course);
            if (!enrolled) return false;

            if (target === enrolled) return true;

            // Supports values such as "CS-401 - Software Engineering".
            const assignmentTokens = String(assignmentCourse)
                .toUpperCase()
                .match(/[A-Z]{1,6}[- ]?\d{2,4}[A-Z]?/g) || [];

            const enrolledTokens = String(course)
                .toUpperCase()
                .match(/[A-Z]{1,6}[- ]?\d{2,4}[A-Z]?/g) || [];

            if (assignmentTokens.length && enrolledTokens.length) {
                return assignmentTokens.some(a =>
                    enrolledTokens.some(e => normalize(a) === normalize(e))
                );
            }

            return false;
        });
    }

    /* ---------------------------------------------------------
       2. READ TEACHER-PUBLISHED ASSIGNMENTS
    --------------------------------------------------------- */

    function getTeacherAssignments() {
        const records = readJSON("learnora_teacher_assignments", []);
        if (!Array.isArray(records)) return [];

        return records
            .filter(item => {
                const status = String(item.status || "")
                    .trim()
                    .toLowerCase();

                return status === "published";
            })
            .filter(item => {
                const course = item.course ||
                    item.courseCode ||
                    item.course_code ||
                    item.courseName ||
                    "";

                return courseMatches(course);
            })
            .map((item, index) => {
                const courseValue =
                    item.course ||
                    item.courseCode ||
                    item.course_code ||
                    "Course";

                const courseText = String(courseValue).trim();

                const dueValue =
                    item.dueDate ||
                    item.due ||
                    item.deadline ||
                    "";

                const parsedDate = dueValue ? new Date(dueValue) : null;
                const validDate = parsedDate &&
                    !Number.isNaN(parsedDate.getTime());

                const dueISO = validDate
                    ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`
                    : "";

                const dueDisplay = validDate
                    ? parsedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    })
                    : (dueValue || "Not specified");

                return {
                    id: String(item.id || `TEACHER-ASG-${index}`),
                    title: String(item.title || "Untitled Assignment"),
                    number: `Assignment ${index + 1}`,
                    course: courseText,
                    courseName: String(
                        item.courseName ||
                        item.course_name ||
                        courseText
                    ),
                    description: String(
                        item.description ||
                        "No additional instructions provided."
                    ),
                    due: dueDisplay,
                    dueISO,
                    points: Number(item.totalMarks ?? item.points ?? 0),
                    status: "pending",
                    submittedDate: "",
                    score: null,
                    instructor: String(
                        item.teacherName ||
                        item.instructor ||
                        "Course Instructor"
                    ),
                    icon: "fa-file-pen",
                    color: "blue",
                    source: "teacher"
                };
            });
    }

    /*
     * Keep the demo assignments out of the real published feed.
     * The page should show teacher-published assignments only.
     */
    let userAssignments = getTeacherAssignments();

    /* ---------------------------------------------------------
       3. COURSE FILTER
    --------------------------------------------------------- */

    const courseFilter = $("courseFilter");

    if (courseFilter) {
        const previousOptions = Array.from(courseFilter.options)
            .filter(option => option.value !== "all");

        previousOptions.forEach(option => option.remove());

        const uniqueCourses = [
            ...new Set(userAssignments.map(item => item.course))
        ];

        uniqueCourses.forEach(course => {
            const option = document.createElement("option");
            option.value = course;
            option.textContent = course;
            courseFilter.appendChild(option);
        });
    }

    /* ---------------------------------------------------------
       4. DATE HELPERS
    --------------------------------------------------------- */

    function getDaysDifference(assignment) {
        if (!assignment.dueISO) return null;

        const due = new Date(`${assignment.dueISO}T00:00:00`);
        if (Number.isNaN(due.getTime())) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Math.ceil((due.getTime() - today.getTime()) / 86400000);
    }

    function getDueText(assignment) {
        const days = getDaysDifference(assignment);

        if (days === null) return "Date not set";
        if (days < 0) return `${Math.abs(days)} day(s) overdue`;
        if (days === 0) return "Due today";
        return `${days} day(s) left`;
    }

    function getDueClass(assignment) {
        const days = getDaysDifference(assignment);

        if (days === null) return "";
        if (days < 0) return "overdue-text";
        if (days <= 2) return "due-soon-text";
        return "";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function getStatusHTML(status) {
        const normalized = String(status || "").toLowerCase();

        if (normalized === "submitted") {
            return '<span class="status-badge completed">Submitted</span>';
        }

        if (normalized === "in-progress") {
            return '<span class="status-badge progress">In Progress</span>';
        }

        return '<span class="status-badge pending">Pending</span>';
    }

    /* ---------------------------------------------------------
       5. ASSIGNMENT DETAIL MODAL
    --------------------------------------------------------- */

    const modal = $("assignmentModal");
    let activeAssignment = null;

    function openAssignment(assignment) {
        activeAssignment = assignment;

        setText("modalCourse", `${assignment.course} · ${assignment.courseName}`);
        setText("modalTitle", assignment.title);
        setText("modalDescription", assignment.description);
        setText("modalDueDate", assignment.due);
        setText("modalPoints", `${assignment.points} Points`);
        setText("modalStatus", "Pending");
        setText("modalInstructor", assignment.instructor);

        const primary = $("modalPrimaryAction");
        if (primary) primary.textContent = "Open Assignment";

        if (modal) {
            modal.classList.add("show");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeAssignment() {
        if (!modal) return;

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        activeAssignment = null;
    }

    $("assignmentModalClose")?.addEventListener("click", closeAssignment);
    $("modalSecondaryAction")?.addEventListener("click", closeAssignment);

    modal?.addEventListener("click", event => {
        if (event.target === modal) closeAssignment();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeAssignment();
    });

    $("modalPrimaryAction")?.addEventListener("click", () => {
        if (!activeAssignment) return;

        alert(
            `Assignment: ${activeAssignment.title}\n\n` +
            "Assignment details are available. Submission/upload functionality " +
            "requires a separate submission workflow."
        );
    });

    /* ---------------------------------------------------------
       6. EMPTY STATE
    --------------------------------------------------------- */

    function showEmptyState(id, show) {
        const element = $(id);
        if (element) element.classList.toggle("show", show);
    }

    /* ---------------------------------------------------------
       7. RENDER UPCOMING ASSIGNMENTS
    --------------------------------------------------------- */

    function renderUpcoming(list) {
        const tbody = $("upcomingAssignmentsBody");
        if (!tbody) return;

        tbody.innerHTML = "";

        showEmptyState("upcomingEmpty", list.length === 0);

        list.forEach(assignment => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="table-title">
                        <div class="table-icon ${escapeHTML(assignment.color)}">
                            <i class="fa-solid ${escapeHTML(assignment.icon)}"></i>
                        </div>
                        <div>
                            <strong>${escapeHTML(assignment.title)}</strong>
                            <span>${escapeHTML(assignment.number)}</span>
                            <small class="assignment-description">
                                ${escapeHTML(assignment.description)}
                            </small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="course-code-badge">
                        ${escapeHTML(assignment.course)}
                    </span>
                </td>
                <td>
                    <strong>${escapeHTML(assignment.due)}</strong>
                    <small class="${getDueClass(assignment)}">
                        ${escapeHTML(getDueText(assignment))}
                    </small>
                </td>
                <td>${escapeHTML(assignment.points)}</td>
                <td>${getStatusHTML(assignment.status)}</td>
                <td>
                    <button
                        class="primary-btn small-btn assignment-action-btn"
                        type="button">
                        Open
                    </button>
                </td>
            `;

            row.querySelector(".assignment-action-btn")
                ?.addEventListener("click", () => openAssignment(assignment));

            tbody.appendChild(row);
        });
    }

    /* ---------------------------------------------------------
       8. RENDER SUBMITTED ASSIGNMENTS
       Teacher-published assignments start as pending.
    --------------------------------------------------------- */

    function renderSubmitted(list) {
        const tbody = $("submittedAssignmentsBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        showEmptyState("submittedEmpty", list.length === 0);
    }

    /* ---------------------------------------------------------
       9. STATS AND FILTERING
    --------------------------------------------------------- */

    function renderStats(list) {
        setText("totalAssignments", list.length);
        setText(
            "submittedAssignments",
            list.filter(item => item.status === "submitted").length
        );
        setText(
            "pendingAssignments",
            list.filter(item => item.status !== "submitted").length
        );
        setText(
            "dueSoonAssignments",
            list.filter(item => {
                const days = getDaysDifference(item);
                return item.status !== "submitted" &&
                    days !== null &&
                    days >= 0 &&
                    days <= 2;
            }).length
        );
    }

    function renderAssignments() {
        const search = String($("assignmentSearch")?.value || "")
            .trim()
            .toLowerCase();

        const selectedCourse = courseFilter?.value || "all";

        const filtered = userAssignments.filter(assignment => {
            const matchesCourse =
                selectedCourse === "all" ||
                assignment.course === selectedCourse;

            const searchableText = [
                assignment.title,
                assignment.number,
                assignment.course,
                assignment.courseName,
                assignment.description,
                assignment.instructor
            ].join(" ").toLowerCase();

            return matchesCourse &&
                (!search || searchableText.includes(search));
        });

        const upcoming = filtered.filter(item => item.status !== "submitted");
        const submitted = filtered.filter(item => item.status === "submitted");

        renderUpcoming(upcoming);
        renderSubmitted(submitted);
        renderStats(filtered);

        setText(
            "upcomingDescription",
            `${upcoming.length} assignment(s) requiring your attention.`
        );
    }

    $("assignmentSearch")?.addEventListener("input", renderAssignments);
    courseFilter?.addEventListener("change", renderAssignments);

    /* ---------------------------------------------------------
       10. NOTIFICATIONS
    --------------------------------------------------------- */

    const pendingCount = userAssignments.filter(
        item => item.status !== "submitted"
    ).length;

    const dot = $("notificationDot");
    if (dot) dot.style.display = pendingCount > 0 ? "block" : "none";

    $("notificationButton")?.addEventListener("click", () => {
        $("upcomingAssignmentsBody")
            ?.closest(".content-card")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    /* ---------------------------------------------------------
       11. LOGOUT
    --------------------------------------------------------- */

    $("logoutLink")?.addEventListener("click", () => {
        [
            "learnora_current_user",
            "learnora_logged_in",
            "learnora_user_role",
            "learnora_user_email",
            "learnora_user_id",
            "learnora_student_name",
            "learnora_remember"
        ].forEach(key => localStorage.removeItem(key));
    });

    /* ---------------------------------------------------------
       12. REFRESH WHEN TEACHER DATA CHANGES IN ANOTHER TAB
    --------------------------------------------------------- */

    window.addEventListener("storage", event => {
        if (event.key !== "learnora_teacher_assignments") return;

        userAssignments = getTeacherAssignments();

        if (courseFilter) {
            const selected = courseFilter.value;
            courseFilter.innerHTML = '<option value="all">All Courses</option>';

            [...new Set(userAssignments.map(item => item.course))]
                .forEach(course => {
                    const option = document.createElement("option");
                    option.value = course;
                    option.textContent = course;
                    courseFilter.appendChild(option);
                });

            if ([...courseFilter.options].some(option => option.value === selected)) {
                courseFilter.value = selected;
            }
        }

        renderAssignments();
    });

    renderAssignments();

    console.log("Learnora published assignments loaded:", {
        student: studentName,
        enrolledCourses,
        assignments: userAssignments
    });
}