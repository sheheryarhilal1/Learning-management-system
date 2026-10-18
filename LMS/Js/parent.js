/* =========================================================
   LEARNORA LMS
   PARENT PORTAL CONTROLLER
   File: js/parent.js

   UPDATED:
   - Parent -> Linked Child Attendance
   - localStorage attendance support
   - attendance_records_<email>
   - attendance_<email>
   - learnora_attendance_<email>
   - attendance by student ID
   - nested attendance records
   - course-wise attendance
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentParent = null;
let currentChild = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeParentPortal();

});


function initializeParentPortal() {

    const loggedInUser =
        getCurrentLoggedInUser();


    if (!loggedInUser) {

        redirectToLogin();

        return;
    }


    const role =
        String(
            loggedInUser.role || ""
        ).toLowerCase();


    if (role !== "parent") {

        redirectToCorrectRole(
            loggedInUser
        );

        return;
    }


    currentParent =
        loggedInUser;


    currentChild =
        findLinkedStudent(
            currentParent
        );


    if (!currentChild) {

        showChildNotFoundState();

        return;
    }


    console.log(
        "Learnora Parent Portal:",
        {
            parent: currentParent,
            child: currentChild
        }
    );


    renderParentInformation();

    renderChildInformation();


    const page =
        getCurrentPage();


    switch (page) {

        case "dashboard.html":

        case "":

            renderDashboard();

            break;


        case "results.html":

            renderResultsPage();

            break;


        case "schedule.html":

            renderSchedulePage();

            break;


        case "attendance.html":

            renderAttendancePage();

            break;


        case "assignments.html":

            renderAssignmentsPage();

            break;


        case "quizzes.html":

            renderQuizzesPage();

            break;


        case "profile.html":

            renderParentProfile();

            break;


        default:

            renderDashboard();

            break;

    }

}


/* =========================================================
   CURRENT USER
========================================================= */

function getCurrentLoggedInUser() {

    let user = null;


    try {

        const localUser =
            localStorage.getItem(
                "learnora_current_user"
            );


        if (localUser) {

            user =
                JSON.parse(
                    localUser
                );

        }

    } catch (error) {

        console.error(
            "Error reading localStorage user:",
            error
        );

    }


    if (!user) {

        try {

            const sessionUser =
                sessionStorage.getItem(
                    "learnora_current_user"
                );


            if (sessionUser) {

                user =
                    JSON.parse(
                        sessionUser
                    );

            }

        } catch (error) {

            console.error(
                "Error reading sessionStorage user:",
                error
            );

        }

    }


    return user;

}


/* =========================================================
   ALL USERS
========================================================= */

function getAllUsers() {

    try {

        const users =
            localStorage.getItem(
                "learnora_users"
            );


        if (!users) {

            return [];

        }


        const parsed =
            JSON.parse(
                users
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Unable to read users:",
            error
        );

        return [];

    }

}


/* =========================================================
   FIND LINKED STUDENT
========================================================= */

function findLinkedStudent(parent) {

    if (!parent) {

        return null;

    }


    /*
       Parent account may store child directly.
    */

    if (
        parent.child &&
        typeof parent.child === "object"
    ) {

        return parent.child;

    }


    if (
        parent.student &&
        typeof parent.student === "object"
    ) {

        return parent.student;

    }


    const childId =
        parent.childId ||
        parent.studentId ||
        parent.child_id ||
        parent.linkedStudentId ||
        parent.linkedChildId ||
        parent.student_id;


    const childEmail =
        parent.childEmail ||
        parent.studentEmail ||
        parent.child_email ||
        parent.linkedStudentEmail;


    const users =
        getAllUsers();


    if (!users.length) {

        console.warn(
            "No users found in learnora_users."
        );

        return null;

    }


    /*
       First try student ID.
    */

    if (childId !== undefined && childId !== null) {

        const studentById =
            users.find(function (user) {

                if (!user) {

                    return false;

                }


                const role =
                    String(
                        user.role || ""
                    ).toLowerCase();


                if (role !== "student") {

                    return false;

                }


                const userId =
                    user.id ??
                    user.studentId ??
                    user.userId;


                return (
                    String(userId) ===
                    String(childId)
                );

            });


        if (studentById) {

            console.log(
                "Linked student found by ID:",
                studentById
            );

            return studentById;

        }

    }


    /*
       Then try child email.
    */

    if (childEmail) {

        const studentByEmail =
            users.find(function (user) {

                if (!user) {

                    return false;

                }


                const role =
                    String(
                        user.role || ""
                    ).toLowerCase();


                if (role !== "student") {

                    return false;

                }


                return (
                    String(
                        user.email || ""
                    ).toLowerCase() ===
                    String(
                        childEmail
                    ).toLowerCase()
                );

            });


        if (studentByEmail) {

            console.log(
                "Linked student found by email:",
                studentByEmail
            );

            return studentByEmail;

        }

    }


    /*
       Last fallback:
       Some parent accounts may store childName.
    */

    const childName =
        parent.childName ||
        parent.studentName ||
        parent.child_name;


    if (childName) {

        const studentByName =
            users.find(function (user) {

                if (!user) {

                    return false;

                }


                const role =
                    String(
                        user.role || ""
                    ).toLowerCase();


                if (role !== "student") {

                    return false;

                }


                const name =
                    user.name ||
                    user.fullName ||
                    "";


                return (
                    String(name)
                        .trim()
                        .toLowerCase() ===
                    String(childName)
                        .trim()
                        .toLowerCase()
                );

            });


        if (studentByName) {

            console.log(
                "Linked student found by name:",
                studentByName
            );

            return studentByName;

        }

    }


    console.warn(
        "No linked student found for parent:",
        parent
    );


    return null;

}


/* =========================================================
   CURRENT PAGE
========================================================= */

function getCurrentPage() {

    return window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

}


/* =========================================================
   REDIRECT LOGIN
========================================================= */

function redirectToLogin() {

    window.location.href =
        "../login.html";

}


/* =========================================================
   REDIRECT ROLE
========================================================= */

function redirectToCorrectRole(user) {

    const role =
        String(
            user.role || ""
        ).toLowerCase();


    if (role === "student") {

        window.location.href =
            "../students/dashboard.html";

        return;
    }


    if (role === "teacher") {

        window.location.href =
            "../teacher/dashboard.html";

        return;
    }


    window.location.href =
        "../login.html";

}


/* =========================================================
   PARENT INFORMATION
========================================================= */

function renderParentInformation() {

    if (!currentParent) {

        return;

    }


    const name =
        currentParent.name ||
        currentParent.fullName ||
        "Parent";


    setText(
        "sidebarParentName",
        name
    );


    setText(
        "topbarParentName",
        name
    );


    setText(
        "welcomeParentName",
        name
    );


    setText(
        "parentEmail",
        currentParent.email ||
        "—"
    );


    const initials =
        getInitials(name);


    setText(
        "sidebarParentAvatar",
        initials
    );


    setText(
        "topbarParentAvatar",
        initials
    );

}


/* =========================================================
   CHILD INFORMATION
========================================================= */

function renderChildInformation() {

    if (!currentChild) {

        return;

    }


    const childName =
        currentChild.name ||
        currentChild.fullName ||
        "Student";


    const childEmail =
        currentChild.email ||
        "—";


    const academic =
        getAcademicData();


    const program =
        academic.program ||
        currentChild.program ||
        currentChild.degree ||
        "Student";


    const semester =
        academic.semester ||
        currentChild.semester ||
        "—";


    const studentId =
        currentChild.studentId ||
        currentChild.id ||
        "—";


    setText(
        "sidebarChildName",
        childName
    );


    setText(
        "childNameHeading",
        childName
    );


    setText(
        "childNameMini",
        childName
    );


    setText(
        "childName",
        childName
    );


    setText(
        "childEmail",
        childEmail
    );


    setText(
        "childProgram",
        program
    );


    setText(
        "childProgramMini",
        program
    );


    setText(
        "welcomeChildProgram",
        program
    );


    setText(
        "childSemester",
        semester
    );


    setText(
        "childStudentId",
        studentId
    );


    setText(
        "dataChildName",
        childName
    );


    setText(
        "welcomeChildNameCard",
        childName
    );


    setText(
        "welcomeChildName",
        childName
    );


    const initials =
        getInitials(childName);


    setText(
        "childAvatar",
        initials
    );


    setText(
        "childLargeAvatar",
        initials
    );


    setText(
        "welcomeChildAvatar",
        initials
    );

}


/* =========================================================
   ACADEMIC DATA
========================================================= */

function getAcademicData() {

    if (!currentChild) {

        return {};

    }


    if (
        currentChild.academicData &&
        typeof currentChild.academicData === "object"
    ) {

        return currentChild.academicData;

    }


    return currentChild;

}


/* =========================================================
   RESULTS
========================================================= */

function getResults() {

    const academic =
        getAcademicData();


    const results =
        academic.results ||
        currentChild.results ||
        [];


    return Array.isArray(results)
        ? results
        : [];

}


/* =========================================================
   COURSES
========================================================= */

function getCourses() {

    const academic =
        getAcademicData();


    const courses =
        academic.courses ||
        currentChild.courses ||
        currentChild.enrolledCourses ||
        [];


    return Array.isArray(courses)
        ? courses
        : [];

}


/* =========================================================
   EXAMS
========================================================= */

function getExams() {

    const academic =
        getAcademicData();


    const exams =
        academic.exams ||
        academic.examSchedule ||
        academic.schedule ||
        currentChild.exams ||
        currentChild.examSchedule ||
        currentChild.schedule ||
        [];


    return Array.isArray(exams)
        ? exams
        : [];

}


/* =========================================================
   ATTENDANCE
   IMPORTANT FIX
========================================================= */

function getAttendance() {

    if (!currentChild) {

        return null;

    }


    const academic =
        getAcademicData();


    /*
       -----------------------------------------------------
       1. DIRECT CHILD DATA
       -----------------------------------------------------
    */

    const directAttendanceSources = [

        academic.attendance,

        academic.attendanceData,

        academic.attendanceRecords,

        academic.attendanceHistory,

        currentChild.attendance,

        currentChild.attendanceData,

        currentChild.attendanceRecords,

        currentChild.attendanceHistory

    ];


    for (
        let i = 0;
        i < directAttendanceSources.length;
        i++
    ) {

        const source =
            directAttendanceSources[i];


        if (
            source !== undefined &&
            source !== null
        ) {

            const normalized =
                normalizeAttendanceContainer(
                    source
                );


            if (
                hasUsableAttendance(
                    normalized
                )
            ) {

                console.log(
                    "Attendance loaded from child object."
                );


                return normalized;

            }

        }

    }


    /*
       -----------------------------------------------------
       2. CHECK LOCAL STORAGE
       -----------------------------------------------------
    */

    const localStorageAttendance =
        getAttendanceFromLocalStorage();


    if (
        localStorageAttendance
    ) {

        return localStorageAttendance;

    }


    /*
       -----------------------------------------------------
       3. FALLBACK ATTENDANCE PERCENTAGE
       -----------------------------------------------------
    */

    const fallbackPercentage =
        academic.attendancePercentage ??
        academic.overallAttendance ??
        academic.attendanceRate ??
        currentChild.attendancePercentage ??
        currentChild.overallAttendance ??
        currentChild.attendanceRate;


    if (
        fallbackPercentage !== undefined &&
        fallbackPercentage !== null
    ) {

        return {

            percentage:
                parsePercentage(
                    fallbackPercentage
                ),

            present: 0,

            absent: 0,

            leave: 0,

            total: 0

        };

    }


    console.warn(
        "No attendance data found for child:",
        {
            id:
                currentChild.id ||
                currentChild.studentId,

            email:
                currentChild.email,

            name:
                currentChild.name ||
                currentChild.fullName
        }
    );


    return null;

}


/* =========================================================
   GET ATTENDANCE FROM LOCAL STORAGE
========================================================= */

function getAttendanceFromLocalStorage() {

    if (!currentChild) {

        return null;

    }


    const childEmail =
        String(
            currentChild.email || ""
        ).trim();


    const childId =
        String(
            currentChild.id ||
            currentChild.studentId ||
            currentChild.userId ||
            ""
        ).trim();


    const childName =
        String(
            currentChild.name ||
            currentChild.fullName ||
            ""
        ).trim();


    /*
       -----------------------------------------------------
       Generate possible storage keys.
       -----------------------------------------------------
    */

    const possibleKeys = [];


    function addKey(key) {

        if (!key) {

            return;

        }


        if (
            !possibleKeys.includes(
                key
            )
        ) {

            possibleKeys.push(
                key
            );

        }

    }


    if (childEmail) {

        const emailLower =
            childEmail.toLowerCase();


        addKey(
            `attendance_records_${childEmail}`
        );

        addKey(
            `attendance_records_${emailLower}`
        );

        addKey(
            `attendance_${childEmail}`
        );

        addKey(
            `attendance_${emailLower}`
        );

        addKey(
            `learnora_attendance_${childEmail}`
        );

        addKey(
            `learnora_attendance_${emailLower}`
        );

        addKey(
            `student_attendance_${childEmail}`
        );

        addKey(
            `student_attendance_${emailLower}`
        );

        addKey(
            `attendanceRecords_${childEmail}`
        );

        addKey(
            `attendanceRecords_${emailLower}`
        );

    }


    if (childId) {

        addKey(
            `attendance_records_${childId}`
        );

        addKey(
            `attendance_${childId}`
        );

        addKey(
            `learnora_attendance_${childId}`
        );

        addKey(
            `student_attendance_${childId}`
        );

        addKey(
            `attendanceRecords_${childId}`
        );

    }


    /*
       -----------------------------------------------------
       First check exact known keys.
       -----------------------------------------------------
    */

    for (
        let i = 0;
        i < possibleKeys.length;
        i++
    ) {

        const key =
            possibleKeys[i];


        const parsed =
            readJSONFromStorage(
                key
            );


        if (
            parsed === null ||
            parsed === undefined
        ) {

            continue;

        }


        const normalized =
            normalizeAttendanceContainer(
                parsed
            );


        if (
            hasUsableAttendance(
                normalized
            )
        ) {

            console.log(
                "Attendance loaded from localStorage key:",
                key
            );


            return normalized;

        }

    }


    /*
       -----------------------------------------------------
       Second:
       Search attendance-related keys.
       This catches keys whose exact naming is different.
       -----------------------------------------------------
    */

    try {

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);


            if (!key) {

                continue;

            }


            const lowerKey =
                key.toLowerCase();


            if (
                !lowerKey.includes(
                    "attendance"
                )
            ) {

                continue;

            }


            /*
               If key is clearly for another student,
               don't use it.
            */

            const keyContainsEmail =
                childEmail &&
                lowerKey.includes(
                    childEmail.toLowerCase()
                );


            const keyContainsId =
                childId &&
                lowerKey.includes(
                    childId.toLowerCase()
                );


            const keyContainsName =
                childName &&
                lowerKey.includes(
                    childName
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                );


            /*
               Exact child match.
            */

            if (
                keyContainsEmail ||
                keyContainsId ||
                keyContainsName
            ) {

                const parsed =
                    readJSONFromStorage(
                        key
                    );


                if (
                    parsed === null ||
                    parsed === undefined
                ) {

                    continue;

                }


                const normalized =
                    normalizeAttendanceContainer(
                        parsed
                    );


                if (
                    hasUsableAttendance(
                        normalized
                    )
                ) {

                    console.log(
                        "Attendance found using attendance-key search:",
                        key
                    );


                    return normalized;

                }

            }

        }

    } catch (error) {

        console.error(
            "Attendance localStorage search failed:",
            error
        );

    }


    /*
       -----------------------------------------------------
       Third:
       Check global attendance object.
       Example:
       localStorage["attendance_records"]
       {
          "student@email.com": [...]
       }
       -----------------------------------------------------
    */

    const globalKeys = [

        "attendance_records",

        "attendance",

        "attendanceData",

        "attendanceRecords",

        "learnora_attendance",

        "student_attendance"

    ];


    for (
        let i = 0;
        i < globalKeys.length;
        i++
    ) {

        const key =
            globalKeys[i];


        const parsed =
            readJSONFromStorage(
                key
            );


        if (
            parsed === null ||
            parsed === undefined
        ) {

            continue;

        }


        const childData =
            extractChildAttendanceFromGlobalObject(
                parsed
            );


        if (
            childData !== null
        ) {

            console.log(
                "Attendance loaded from global attendance storage:",
                key
            );


            return childData;

        }

    }


    return null;

}


/* =========================================================
   READ JSON STORAGE
========================================================= */

function readJSONFromStorage(
    key
) {

    try {

        const value =
            localStorage.getItem(
                key
            );


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null;

        }


        try {

            return JSON.parse(
                value
            );

        } catch (jsonError) {

            /*
               Sometimes storage may contain
               a simple numeric percentage.
            */

            const number =
                Number(
                    String(value)
                        .replace(
                            "%",
                            ""
                        )
                        .trim()
                );


            if (
                !Number.isNaN(
                    number
                )
            ) {

                return number;

            }


            return null;

        }

    } catch (error) {

        console.error(
            "Unable to read storage key:",
            key,
            error
        );

        return null;

    }

}


/* =========================================================
   EXTRACT CHILD ATTENDANCE FROM GLOBAL OBJECT
========================================================= */

function extractChildAttendanceFromGlobalObject(
    data
) {

    if (!data) {

        return null;

    }


    /*
       If global data itself is an array,
       only use it if records belong to current child.
    */

    if (Array.isArray(data)) {

        const filtered =
            data.filter(
                function (record) {

                    return attendanceRecordBelongsToChild(
                        record
                    );

                }
            );


        if (filtered.length) {

            return filtered;

        }


        return null;

    }


    if (
        typeof data !== "object"
    ) {

        return null;

    }


    const childEmail =
        String(
            currentChild?.email || ""
        ).toLowerCase();


    const childId =
        String(
            currentChild?.id ||
            currentChild?.studentId ||
            currentChild?.userId ||
            ""
        );


    /*
       Try direct properties using email.
    */

    const emailKeys = [

        currentChild?.email,

        childEmail

    ];


    for (
        let i = 0;
        i < emailKeys.length;
        i++
    ) {

        const key =
            emailKeys[i];


        if (!key) {

            continue;

        }


        if (
            Object.prototype.hasOwnProperty.call(
                data,
                key
            )
        ) {

            return normalizeAttendanceContainer(
                data[key]
            );

        }

    }


    /*
       Try ID.
    */

    if (
        childId &&
        Object.prototype.hasOwnProperty.call(
            data,
            childId
        )
    ) {

        return normalizeAttendanceContainer(
            data[childId]
        );

    }


    /*
       Try matching object values.
    */

    const values =
        Object.values(
            data
        );


    for (
        let i = 0;
        i < values.length;
        i++
    ) {

        const value =
            values[i];


        if (
            !value ||
            typeof value !== "object"
        ) {

            continue;

        }


        const ownerEmail =
            String(
                value.email ||
                value.studentEmail ||
                value.childEmail ||
                value.userEmail ||
                ""
            ).toLowerCase();


        const ownerId =
            String(
                value.studentId ||
                value.student_id ||
                value.userId ||
                value.childId ||
                value.id ||
                ""
            );


        if (
            (
                childEmail &&
                ownerEmail === childEmail
            ) ||
            (
                childId &&
                ownerId === childId
            )
        ) {

            return normalizeAttendanceContainer(
                value.attendance ||
                value.attendanceData ||
                value.records ||
                value
            );

        }

    }


    return null;

}


/* =========================================================
   CHECK RECORD BELONGS TO CURRENT CHILD
========================================================= */

function attendanceRecordBelongsToChild(
    record
) {

    if (!record || !currentChild) {

        return false;

    }


    const childEmail =
        String(
            currentChild.email || ""
        ).toLowerCase();


    const childId =
        String(
            currentChild.id ||
            currentChild.studentId ||
            currentChild.userId ||
            ""
        );


    const recordEmail =
        String(
            record.email ||
            record.studentEmail ||
            record.childEmail ||
            record.userEmail ||
            ""
        ).toLowerCase();


    const recordId =
        String(
            record.studentId ||
            record.student_id ||
            record.childId ||
            record.userId ||
            record.user_id ||
            ""
        );


    /*
       If record has no owner information,
       don't claim it belongs to child.
    */

    if (
        !recordEmail &&
        !recordId
    ) {

        return false;

    }


    return (
        (
            childEmail &&
            recordEmail === childEmail
        ) ||
        (
            childId &&
            recordId === childId
        )
    );

}


/* =========================================================
   NORMALIZE ATTENDANCE CONTAINER
========================================================= */

function normalizeAttendanceContainer(
    data
) {

    if (
        data === null ||
        data === undefined
    ) {

        return null;

    }


    /*
       Number
    */

    if (
        typeof data === "number"
    ) {

        return data;

    }


    /*
       String
    */

    if (
        typeof data === "string"
    ) {

        const value =
            data.trim();


        if (!value) {

            return null;

        }


        const numeric =
            Number(
                value.replace(
                    "%",
                    ""
                )
            );


        if (
            !Number.isNaN(
                numeric
            )
        ) {

            return numeric;

        }


        return null;

    }


    /*
       Array
    */

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    /*
       Object
    */

    if (
        typeof data === "object"
    ) {

        /*
           Common wrappers.
        */

        const wrapperKeys = [

            "records",

            "attendance",

            "attendanceRecords",

            "attendanceData",

            "attendanceHistory",

            "data",

            "items",

            "entries"

        ];


        for (
            let i = 0;
            i < wrapperKeys.length;
            i++
        ) {

            const key =
                wrapperKeys[i];


            if (
                data[key] !== undefined &&
                data[key] !== null
            ) {

                const nested =
                    data[key];


                if (
                    Array.isArray(
                        nested
                    )
                ) {

                    /*
                       Preserve courseWise/summary
                       if present.
                    */

                    const copy =
                        Object.assign(
                            {},
                            data
                        );


                    copy.records =
                        nested;


                    return copy;

                }


                if (
                    typeof nested === "object"
                ) {

                    return normalizeAttendanceContainer(
                        nested
                    );

                }

            }

        }


        /*
           Course-wise attendance.
        */

        if (
            Array.isArray(
                data.courseWise
            )
        ) {

            return data;

        }


        if (
            Array.isArray(
                data.courses
            )
        ) {

            return data;

        }


        if (
            Array.isArray(
                data.subjects
            )
        ) {

            return data;

        }


        /*
           Object map by date.
           Example:
           {
              "2026-10-01": "present",
              "2026-10-02": "absent"
           }
        */

        const convertedRecords =
            convertDateMapToAttendanceRecords(
                data
            );


        if (
            convertedRecords.length
        ) {

            return convertedRecords;

        }


        return data;

    }


    return null;

}


/* =========================================================
   CONVERT DATE MAP
========================================================= */

function convertDateMapToAttendanceRecords(
    data
) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {

        return [];

    }


    const keys =
        Object.keys(
            data
        );


    if (!keys.length) {

        return [];

    }


    const records = [];


    keys.forEach(
        function (key) {

            const value =
                data[key];


            /*
               Only treat date-like keys as records.
            */

            const isDateKey =
                /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(
                    key
                );


            if (!isDateKey) {

                return;

            }


            if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean"
            ) {

                records.push({

                    date: key,

                    status: value

                });

            } else if (
                value &&
                typeof value === "object"
            ) {

                records.push(
                    Object.assign(
                        {
                            date: key
                        },
                        value
                    )
                );

            }

        }
    );


    return records;

}


/* =========================================================
   HAS USABLE ATTENDANCE
========================================================= */

function hasUsableAttendance(
    attendance
) {

    if (
        attendance === null ||
        attendance === undefined
    ) {

        return false;

    }


    if (
        typeof attendance === "number"
    ) {

        return !Number.isNaN(
            attendance
        );

    }


    if (
        Array.isArray(attendance)
    ) {

        return attendance.length > 0;

    }


    if (
        typeof attendance === "object"
    ) {

        const nested =
            attendance.records ||
            attendance.attendance ||
            attendance.attendanceRecords ||
            attendance.attendanceData ||
            attendance.courseWise ||
            attendance.courses ||
            attendance.subjects;


        if (
            Array.isArray(
                nested
            ) &&
            nested.length
        ) {

            return true;

        }


        const percentage =
            attendance.percentage ??
            attendance.attendancePercentage ??
            attendance.overall ??
            attendance.overallAttendance ??
            attendance.rate ??
            attendance.percent;


        const present =
            attendance.present ??
            attendance.presentDays ??
            attendance.presentCount;


        const absent =
            attendance.absent ??
            attendance.absentDays ??
            attendance.absentCount;


        const total =
            attendance.total ??
            attendance.totalClasses ??
            attendance.totalDays;


        return (
            percentage !== undefined ||
            present !== undefined ||
            absent !== undefined ||
            total !== undefined
        );

    }


    return false;

}


/* =========================================================
   ATTENDANCE RECORDS EXTRACTION
========================================================= */

function getAttendanceRecords(
    attendance
) {

    if (!attendance) {

        return [];

    }


    if (
        Array.isArray(
            attendance
        )
    ) {

        return attendance;

    }


    if (
        typeof attendance !== "object"
    ) {

        return [];

    }


    const possibleArrays = [

        attendance.records,

        attendance.attendance,

        attendance.attendanceRecords,

        attendance.attendanceData,

        attendance.attendanceHistory,

        attendance.data,

        attendance.items,

        attendance.entries,

        attendance.courseWise,

        attendance.courses,

        attendance.subjects

    ];


    for (
        let i = 0;
        i < possibleArrays.length;
        i++
    ) {

        if (
            Array.isArray(
                possibleArrays[i]
            )
        ) {

            return possibleArrays[i];

        }

    }


    return [];

}


/* =========================================================
   ASSIGNMENTS
========================================================= */

function getAssignments() {

    const academic =
        getAcademicData();


    const assignments =
        academic.assignments ||
        currentChild.assignments ||
        [];


    return Array.isArray(assignments)
        ? assignments
        : [];

}


/* =========================================================
   QUIZZES
========================================================= */

function getQuizzes() {

    const academic =
        getAcademicData();


    const quizzes =
        academic.quizzes ||
        currentChild.quizzes ||
        [];


    return Array.isArray(quizzes)
        ? quizzes
        : [];

}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

function getAnnouncements() {

    const academic =
        getAcademicData();


    const announcements =
        academic.announcements ||
        currentChild.announcements ||
        [];


    return Array.isArray(announcements)
        ? announcements
        : [];

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    renderDashboardStats();

    renderDashboardAttendance();

    renderDashboardExams();

    renderDashboardResults();

    renderDashboardAssignments();

    renderDashboardQuizzes();

    renderDashboardCourses();

    renderDashboardAnnouncements();

}


/* =========================================================
   DASHBOARD STATS
========================================================= */

function renderDashboardStats() {

    const academic =
        getAcademicData();


    const results =
        getResults();


    const courses =
        getCourses();


    const assignments =
        getAssignments();


    const quizzes =
        getQuizzes();


    const cgpa =
        academic.cgpa ??
        currentChild.cgpa ??
        "—";


    setText(
        "cgpaValue",
        cgpa
    );


    setText(
        "coursesValue",
        courses.length
    );


    const pendingAssignments =
        assignments.filter(
            function (item) {

                return !isSubmitted(
                    item
                );

            }
        ).length;


    const pendingQuizzes =
        quizzes.filter(
            function (item) {

                return !isQuizAttempted(
                    item
                );

            }
        ).length;


    setText(
        "pendingValue",
        pendingAssignments +
        pendingQuizzes
    );


    const gpa =
        academic.semesterGPA ??
        academic.gpa ??
        calculateGPA(
            results
        );


    setText(
        "semesterGPA",
        gpa !== null
            ? formatNumber(gpa)
            : "—"
    );

}


/* =========================================================
   DASHBOARD ATTENDANCE
========================================================= */

function renderDashboardAttendance() {

    const attendance =
        getAttendance();


    const summary =
        calculateAttendanceSummary(
            attendance
        );


    setText(
        "attendanceValue",
        summary.percentage !== null
            ? formatPercentage(
                summary.percentage
            )
            : "—"
    );


    setText(
        "attendanceCircleValue",
        summary.percentage !== null
            ? formatPercentage(
                summary.percentage
            )
            : "—"
    );


    setText(
        "presentCount",
        summary.present
    );


    setText(
        "absentCount",
        summary.absent
    );


    setText(
        "leaveCount",
        summary.leave
    );


    const circle =
        document.getElementById(
            "attendanceCircle"
        );


    if (circle) {

        const percentage =
            summary.percentage !== null
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            summary.percentage
                        )
                    )
                )
                : 0;


        circle.style.setProperty(
            "--attendance",
            `${percentage}%`
        );

    }


    const status =
        document.getElementById(
            "attendanceStatus"
        );


    if (status) {

        if (
            summary.percentage === null
        ) {

            status.textContent =
                "Attendance data unavailable";

        } else if (
            summary.percentage >= 90
        ) {

            status.textContent =
                "Excellent Attendance";

        } else if (
            summary.percentage >= 80
        ) {

            status.textContent =
                "Good Attendance";

        } else if (
            summary.percentage >= 75
        ) {

            status.textContent =
                "Satisfactory Attendance";

        } else {

            status.textContent =
                "Below Required Level";

        }

    }

}


/* =========================================================
   DASHBOARD EXAMS
========================================================= */

function renderDashboardExams() {

    const container =
        document.getElementById(
            "upcomingExams"
        );


    if (!container) {

        return;

    }


    const exams =
        getUpcomingExams();


    if (!exams.length) {

        container.innerHTML =
            emptyState(
                "fa-regular fa-calendar",
                "No upcoming exams found."
            );

        return;

    }


    container.innerHTML =
        exams
            .slice(0, 5)
            .map(
                createExamCard
            )
            .join("");

}


/* =========================================================
   DASHBOARD RESULTS
========================================================= */

function renderDashboardResults() {

    const tbody =
        document.getElementById(
            "recentResults"
        );


    if (!tbody) {

        return;

    }


    const results =
        getResults();


    if (!results.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No results available.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        results
            .slice()
            .reverse()
            .slice(0, 5)
            .map(
                function (result) {

                    const course =
                        result.course ||
                        result.courseName ||
                        result.subject ||
                        "—";


                    const code =
                        result.code ||
                        result.courseCode ||
                        "—";


                    const marks =
                        result.marks ??
                        result.score ??
                        "—";


                    const grade =
                        result.grade ||
                        calculateGrade(
                            result.marks ??
                            result.score
                        );


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    course
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    code
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(
                                        marks
                                    )
                                )}
                            </td>

                            <td>
                                ${createGradeBadge(
                                    grade
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   DASHBOARD ASSIGNMENTS
========================================================= */

function renderDashboardAssignments() {

    const container =
        document.getElementById(
            "assignmentList"
        );


    if (!container) {

        return;

    }


    const assignments =
        getAssignments();


    if (!assignments.length) {

        container.innerHTML =
            emptyState(
                "fa-solid fa-file-pen",
                "No assignments available."
            );

        return;

    }


    container.innerHTML =
        assignments
            .slice(0, 5)
            .map(
                createAssignmentItem
            )
            .join("");

}


/* =========================================================
   DASHBOARD QUIZZES
========================================================= */

function renderDashboardQuizzes() {

    const container =
        document.getElementById(
            "quizList"
        );


    if (!container) {

        return;

    }


    const quizzes =
        getQuizzes();


    if (!quizzes.length) {

        container.innerHTML =
            emptyState(
                "fa-solid fa-circle-question",
                "No quizzes available."
            );

        return;

    }


    container.innerHTML =
        quizzes
            .slice(0, 5)
            .map(
                createQuizItem
            )
            .join("");

}


/* =========================================================
   DASHBOARD COURSES
========================================================= */

function renderDashboardCourses() {

    const container =
        document.getElementById(
            "courseList"
        );


    if (!container) {

        return;

    }


    const courses =
        getCourses();


    if (!courses.length) {

        container.innerHTML =
            emptyState(
                "fa-solid fa-book",
                "No courses available."
            );

        return;

    }


    container.innerHTML =
        courses
            .slice(0, 6)
            .map(
                function (course) {

                    const name =
                        typeof course === "string"
                            ? course
                            : (
                                course.name ||
                                course.title ||
                                course.courseName ||
                                "Course"
                            );


                    const code =
                        typeof course === "object"
                            ? (
                                course.code ||
                                course.courseCode ||
                                ""
                            )
                            : "";


                    return `
                        <div class="course-item">

                            <div class="course-item-icon">
                                <i class="fa-solid fa-book-open"></i>
                            </div>

                            <div class="course-item-info">

                                <strong>
                                    ${escapeHTML(
                                        name
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        code
                                    )}
                                </span>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   DASHBOARD ANNOUNCEMENTS
========================================================= */

function renderDashboardAnnouncements() {

    const container =
        document.getElementById(
            "announcementList"
        );


    if (!container) {

        return;

    }


    const announcements =
        getAnnouncements();


    const badge =
        document.getElementById(
            "announcementCount"
        );


    if (badge) {

        badge.textContent =
            announcements.length;

    }


    if (!announcements.length) {

        container.innerHTML =
            emptyState(
                "fa-regular fa-bell",
                "No announcements available."
            );

        return;

    }


    container.innerHTML =
        announcements
            .slice(0, 5)
            .map(
                function (item) {

                    return `
                        <div class="announcement-item">

                            <div class="announcement-icon">
                                <i class="fa-regular fa-bell"></i>
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        item.title ||
                                        "Announcement"
                                    )}
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        item.message ||
                                        item.description ||
                                        ""
                                    )}
                                </p>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   RESULTS PAGE
========================================================= */

function renderResultsPage() {

    const results =
        getResults();


    const academic =
        getAcademicData();


    setText(
        "currentCGPA",
        academic.cgpa ||
        currentChild.cgpa ||
        "—"
    );


    const gpa =
        academic.semesterGPA ||
        academic.gpa ||
        calculateGPA(
            results
        );


    setText(
        "semesterGPA",
        gpa !== null
            ? formatNumber(gpa)
            : "—"
    );


    setText(
        "completedCourses",
        results.length
    );


    const credits =
        results.reduce(
            function (total, result) {

                return total +
                    Number(
                        result.creditHours ||
                        result.credits ||
                        0
                    );

            },
            0
        );


    setText(
        "creditHours",
        credits
    );


    renderResultsTable(
        results
    );


    renderResultSummary(
        results
    );

}


/* =========================================================
   RESULTS TABLE
========================================================= */

function renderResultsTable(
    results
) {

    const tbody =
        document.getElementById(
            "resultsTableBody"
        );


    if (!tbody) {

        return;

    }


    if (!results.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    No academic results available.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        results
            .map(
                function (result) {

                    const course =
                        result.course ||
                        result.courseName ||
                        result.subject ||
                        "—";


                    const code =
                        result.code ||
                        result.courseCode ||
                        "—";


                    const credits =
                        result.creditHours ||
                        result.credits ||
                        "—";


                    const marks =
                        result.marks ??
                        result.score ??
                        "—";


                    const grade =
                        result.grade ||
                        calculateGrade(
                            result.marks ??
                            result.score
                        );


                    const point =
                        result.gradePoint ??
                        result.gpa ??
                        calculateGradePoint(
                            grade
                        );


                    const semester =
                        result.semester ||
                        result.term ||
                        "—";


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        course
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    code
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(
                                        credits
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(
                                        marks
                                    )
                                )}
                            </td>

                            <td>
                                ${createGradeBadge(
                                    grade
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(
                                        point
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    String(
                                        semester
                                    )
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   RESULT SUMMARY
========================================================= */

function renderResultSummary(
    results
) {

    if (!results.length) {

        setText(
            "highestGrade",
            "—"
        );

        setText(
            "averageMarks",
            "—"
        );

        setText(
            "passedCourses",
            "0"
        );

        setText(
            "failedCourses",
            "0"
        );

        return;

    }


    const marks =
        results
            .map(
                function (item) {

                    return Number(
                        item.marks ??
                        item.score
                    );

                }
            )
            .filter(
                function (value) {

                    return !Number.isNaN(
                        value
                    );

                }
            );


    const average =
        marks.length
            ? marks.reduce(
                (
                    a,
                    b
                ) => a + b,
                0
            ) / marks.length
            : null;


    setText(
        "averageMarks",
        average !== null
            ? `${formatNumber(
                average
            )}%`
            : "—"
    );


    const passed =
        results.filter(
            function (item) {

                const marks =
                    Number(
                        item.marks ??
                        item.score ??
                        0
                    );


                return marks >= 50;

            }
        ).length;


    setText(
        "passedCourses",
        passed
    );


    setText(
        "failedCourses",
        results.length -
        passed
    );

}


/* =========================================================
   SCHEDULE PAGE
========================================================= */

function renderSchedulePage() {

    const exams =
        getExams();


    const upcoming =
        getUpcomingExams();


    renderExamList(
        upcoming
    );


    renderScheduleTable(
        exams
    );


    populateSemesterFilter(
        exams
    );


    setText(
        "scheduleChildName",
        currentChild?.name ||
        currentChild?.fullName ||
        "Student"
    );


    setText(
        "scheduleExamTotal",
        exams.length
    );

}


/* =========================================================
   UPCOMING EXAMS
========================================================= */

function getUpcomingExams() {

    const exams =
        getExams();


    if (!exams.length) {

        return [];

    }


    const now =
        new Date();


    return exams
        .filter(
            function (exam) {

                if (!exam.date) {

                    return true;

                }


                const date =
                    new Date(
                        exam.date
                    );


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return true;

                }


                return date >= now;

            }
        )
        .sort(
            function (a, b) {

                const dateA =
                    a.date
                        ? new Date(
                            a.date
                        )
                        : new Date(
                            "2999-12-31"
                        );


                const dateB =
                    b.date
                        ? new Date(
                            b.date
                        )
                        : new Date(
                            "2999-12-31"
                        );


                return (
                    dateA.getTime() -
                    dateB.getTime()
                );

            }
        );

}


/* =========================================================
   EXAM LIST
========================================================= */

function renderExamList(
    exams
) {

    const container =
        document.getElementById(
            "examList"
        );


    if (!container) {

        return;

    }


    if (!exams.length) {

        container.innerHTML =
            emptyState(
                "fa-regular fa-calendar",
                "No upcoming exams."
            );

        return;

    }


    container.innerHTML =
        exams
            .slice(0, 5)
            .map(
                createExamCard
            )
            .join("");

}


/* =========================================================
   EXAM CARD
========================================================= */

function createExamCard(
    exam
) {

    const course =
        exam.course ||
        exam.courseName ||
        exam.subject ||
        "Exam";


    const code =
        exam.code ||
        exam.courseCode ||
        "";


    const time =
        exam.time ||
        "Time not specified";


    const room =
        exam.room ||
        exam.location ||
        "Room not specified";


    return `
        <div class="exam-item">

            <div class="exam-date">

                <strong>
                    ${escapeHTML(
                        getDateDay(
                            exam.date
                        )
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        getDateMonth(
                            exam.date
                        )
                    )}
                </span>

            </div>

            <div class="exam-details">

                <strong>
                    ${escapeHTML(
                        course
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        code
                    )}
                </span>

                <small>

                    <i class="fa-regular fa-clock"></i>

                    ${escapeHTML(
                        time
                    )}

                    &nbsp; • &nbsp;

                    ${escapeHTML(
                        room
                    )}

                </small>

            </div>

        </div>
    `;

}


/* =========================================================
   SCHEDULE TABLE
========================================================= */

function renderScheduleTable(
    exams
) {

    const tbody =
        document.getElementById(
            "scheduleTableBody"
        );


    if (!tbody) {

        return;

    }


    if (!exams.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No exam schedule available.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        exams
            .map(
                function (exam) {

                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        exam.date
                                    )
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        exam.course ||
                                        exam.courseName ||
                                        exam.subject ||
                                        "—"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    exam.code ||
                                    exam.courseCode ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    exam.time ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    exam.room ||
                                    exam.location ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${createStatusBadge(
                                    exam.status ||
                                    "Upcoming"
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   SEMESTER FILTER
========================================================= */

function populateSemesterFilter(
    exams
) {

    const select =
        document.getElementById(
            "semesterFilter"
        );


    if (!select) {

        return;

    }


    const semesters =
        [
            ...new Set(
                exams
                    .map(
                        function (exam) {

                            return (
                                exam.semester ||
                                exam.term
                            );

                        }
                    )
                    .filter(Boolean)
            )
        ];


    semesters.forEach(
        function (semester) {

            const exists =
                Array.from(
                    select.options
                ).some(
                    function (option) {

                        return (
                            option.value ===
                            String(
                                semester
                            )
                        );

                    }
                );


            if (exists) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                semester;


            option.textContent =
                semester;


            select.appendChild(
                option
            );

        }
    );


    if (
        select.dataset.listenerAttached ===
        "true"
    ) {

        return;

    }


    select.dataset.listenerAttached =
        "true";


    select.addEventListener(
        "change",
        function () {

            const value =
                this.value;


            const filtered =
                value === "all"
                    ? exams
                    : exams.filter(
                        function (exam) {

                            return String(
                                exam.semester ||
                                exam.term ||
                                ""
                            ) ===
                            String(
                                value
                            );

                        }
                    );


            renderScheduleTable(
                filtered
            );


            setText(
                "scheduleExamTotal",
                filtered.length
            );

        }
    );

}


/* =========================================================
   ATTENDANCE PAGE
========================================================= */

function renderAttendancePage() {

    console.log(
        "===== PARENT ATTENDANCE PAGE ====="
    );


    console.log(
        "Current parent:",
        currentParent
    );


    console.log(
        "Current child:",
        currentChild
    );


    const attendance =
        getAttendance();


    console.log(
        "Attendance data received:",
        attendance
    );


    const summary =
        calculateAttendanceSummary(
            attendance
        );


    console.log(
        "Attendance summary:",
        summary
    );


    /*
       Overall percentage
    */

    setText(
        "overallAttendance",
        summary.percentage !== null
            ? formatPercentage(
                summary.percentage
            )
            : "—"
    );


    /*
       Circle
    */

    setText(
        "attendanceCircleValue",
        summary.percentage !== null
            ? formatPercentage(
                summary.percentage
            )
            : "—"
    );


    /*
       Present
    */

    setText(
        "presentDays",
        summary.present
    );


    /*
       Absent
    */

    setText(
        "absentDays",
        summary.absent
    );


    /*
       Total
    */

    setText(
        "totalClasses",
        summary.total
    );


    /*
       Optional dashboard values
    */

    setText(
        "leaveCount",
        summary.leave
    );


    setText(
        "presentCount",
        summary.present
    );


    setText(
        "absentCount",
        summary.absent
    );


    /*
       Message
    */

    const message =
        document.getElementById(
            "attendanceMessage"
        );


    if (message) {

        if (
            summary.percentage === null
        ) {

            message.textContent =
                "Attendance data is not available.";

        } else if (
            summary.percentage >= 90
        ) {

            message.textContent =
                "Excellent attendance record.";

        } else if (
            summary.percentage >= 80
        ) {

            message.textContent =
                "Good attendance record.";

        } else if (
            summary.percentage >= 75
        ) {

            message.textContent =
                "Attendance is satisfactory.";

        } else {

            message.textContent =
                "Attendance is below the required level.";

        }

    }


    /*
       Circle progress
    */

    const circle =
        document.getElementById(
            "attendanceCircle"
        );


    if (circle) {

        const percentage =
            summary.percentage !== null
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            summary.percentage
                        )
                    )
                )
                : 0;


        circle.style.setProperty(
            "--attendance",
            `${percentage}%`
        );

    }


    /*
       Course-wise table
    */

    renderAttendanceTable(
        attendance
    );

}


/* =========================================================
   CALCULATE ATTENDANCE
========================================================= */

function calculateAttendance() {

    const attendance =
        getAttendance();


    if (
        typeof attendance === "number" &&
        !Number.isNaN(
            attendance
        )
    ) {

        return Number(
            attendance
        );

    }


    if (
        typeof attendance === "string" &&
        attendance.trim() !== ""
    ) {

        const numericValue =
            Number(
                attendance
                    .replace(
                        "%",
                        ""
                    )
                    .trim()
            );


        if (
            !Number.isNaN(
                numericValue
            )
        ) {

            return numericValue;

        }

    }


    if (
        attendance &&
        typeof attendance === "object"
    ) {

        const percentage =
            attendance.percentage ??
            attendance.attendancePercentage ??
            attendance.overall ??
            attendance.overallAttendance ??
            attendance.rate ??
            attendance.percent;


        if (
            percentage !== undefined &&
            percentage !== null
        ) {

            return parsePercentage(
                percentage
            );

        }


        const nestedRecords =
            getAttendanceRecords(
                attendance
            );


        if (
            nestedRecords.length
        ) {

            return calculateAttendanceSummary(
                nestedRecords
            ).percentage;

        }

    }


    return null;

}


/* =========================================================
   CALCULATE ATTENDANCE SUMMARY
========================================================= */

function calculateAttendanceSummary(
    attendance
) {

    let present = 0;

    let absent = 0;

    let leave = 0;

    let total = 0;

    let percentage = null;


    if (
        attendance === null ||
        attendance === undefined
    ) {

        return {

            present: 0,

            absent: 0,

            leave: 0,

            total: 0,

            percentage: null

        };

    }


    /*
       NUMBER
    */

    if (
        typeof attendance === "number" &&
        !Number.isNaN(
            attendance
        )
    ) {

        percentage =
            Number(
                attendance
            );

    }


    /*
       STRING
    */

    if (
        typeof attendance === "string" &&
        attendance.trim() !== ""
    ) {

        const numericValue =
            Number(
                attendance
                    .replace(
                        "%",
                        ""
                    )
                    .trim()
            );


        if (
            !Number.isNaN(
                numericValue
            )
        ) {

            percentage =
                numericValue;

        }

    }


    /*
       OBJECT
    */

    if (
        attendance &&
        typeof attendance === "object" &&
        !Array.isArray(
            attendance
        )
    ) {

        present =
            toSafeNumber(
                attendance.present ??
                attendance.presentDays ??
                attendance.classesPresent ??
                attendance.attended ??
                attendance.presentCount ??
                attendance.attendedClasses
            );


        absent =
            toSafeNumber(
                attendance.absent ??
                attendance.absentDays ??
                attendance.classesAbsent ??
                attendance.missed ??
                attendance.absentCount ??
                attendance.missedClasses
            );


        leave =
            toSafeNumber(
                attendance.leave ??
                attendance.leaves ??
                attendance.leaveDays ??
                attendance.leaveCount
            );


        total =
            toSafeNumber(
                attendance.total ??
                attendance.totalClasses ??
                attendance.classes ??
                attendance.recordedClasses ??
                attendance.totalDays ??
                attendance.totalCount
            );


        const directPercentage =
            attendance.percentage ??
            attendance.attendancePercentage ??
            attendance.overall ??
            attendance.overallAttendance ??
            attendance.rate ??
            attendance.percent;


        if (
            directPercentage !== undefined &&
            directPercentage !== null
        ) {

            percentage =
                parsePercentage(
                    directPercentage
                );

        }


        /*
           IMPORTANT:
           If object contains nested records,
           calculate from those records.
        */

        const nestedRecords =
            getAttendanceRecords(
                attendance
            );


        if (
            nestedRecords.length
        ) {

            const nestedSummary =
                calculateAttendanceSummary(
                    nestedRecords
                );


            /*
               Prefer actual records.
            */

            if (
                nestedSummary.total > 0
            ) {

                present =
                    nestedSummary.present;


                absent =
                    nestedSummary.absent;


                leave =
                    nestedSummary.leave;


                total =
                    nestedSummary.total;


                if (
                    percentage === null
                ) {

                    percentage =
                        nestedSummary.percentage;

                }

            }

        }


        /*
           If total isn't supplied,
           calculate from present/absent/leave.
        */

        if (
            total <= 0 &&
            (
                present > 0 ||
                absent > 0 ||
                leave > 0
            )
        ) {

            total =
                present +
                absent +
                leave;

        }


        /*
           Calculate percentage if missing.
        */

        if (
            percentage === null &&
            total > 0
        ) {

            percentage =
                (
                    present /
                    total
                ) * 100;

        }

    }


    /*
       ARRAY
    */

    if (
        Array.isArray(
            attendance
        )
    ) {

        present = 0;

        absent = 0;

        leave = 0;


        attendance.forEach(
            function (record) {

                if (
                    record === null ||
                    record === undefined
                ) {

                    return;

                }


                const status =
                    getAttendanceStatus(
                        record
                    );


                if (
                    isPresentStatus(
                        status
                    )
                ) {

                    present++;

                } else if (
                    isAbsentStatus(
                        status
                    )
                ) {

                    absent++;

                } else if (
                    isLeaveStatus(
                        status
                    )
                ) {

                    leave++;

                }

            }
        );


        total =
            present +
            absent +
            leave;


        percentage =
            total > 0
                ? (
                    present /
                    total
                ) * 100
                : null;

    }


    /*
       Child fallback
    */

    if (
        percentage === null &&
        currentChild
    ) {

        const fallback =
            currentChild.attendancePercentage ??
            currentChild.overallAttendance ??
            currentChild.attendanceRate;


        if (
            fallback !== undefined &&
            fallback !== null
        ) {

            const numericFallback =
                parsePercentage(
                    fallback
                );


            if (
                numericFallback !== null
            ) {

                percentage =
                    numericFallback;

            }

        }

    }


    /*
       Clean values
    */

    present =
        toSafeNumber(
            present
        );


    absent =
        toSafeNumber(
            absent
        );


    leave =
        toSafeNumber(
            leave
        );


    total =
        toSafeNumber(
            total
        );


    return {

        present,

        absent,

        leave,

        total,

        percentage

    };

}


/* =========================================================
   ATTENDANCE STATUS
========================================================= */

function getAttendanceStatus(
    record
) {

    if (
        record === null ||
        record === undefined
    ) {

        return "";

    }


    /*
       Primitive record.
    */

    if (
        typeof record !== "object"
    ) {

        return String(
            record
        )
        .trim()
        .toLowerCase();

    }


    const value =
        record.status ??
        record.attendance ??
        record.attendanceStatus ??
        record.statusType ??
        record.state ??
        record.presentStatus ??
        record.markedStatus ??
        record.value;


    /*
       Boolean.
    */

    if (
        typeof value === "boolean"
    ) {

        return value
            ? "present"
            : "absent";

    }


    return String(
        value ?? ""
    )
    .trim()
    .toLowerCase();

}


/* =========================================================
   PRESENT STATUS
========================================================= */

function isPresentStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    return (

        value === "present" ||

        value === "p" ||

        value === "1" ||

        value === "true" ||

        value === "yes" ||

        value === "attended" ||

        value === "on time"

    );

}


/* =========================================================
   ABSENT STATUS
========================================================= */

function isAbsentStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    return (

        value === "absent" ||

        value === "a" ||

        value === "0" ||

        value === "false" ||

        value === "no" ||

        value === "missed"

    );

}


/* =========================================================
   LEAVE STATUS
========================================================= */

function isLeaveStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    return (

        value === "leave" ||

        value === "l" ||

        value === "on leave" ||

        value === "excused" ||

        value === "holiday"

    );

}


/* =========================================================
   ATTENDANCE TABLE
========================================================= */

function renderAttendanceTable(
    attendance
) {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tbody) {

        return;

    }


    const courseMap = {};


    /*
       -----------------------------------------------------
       Get actual records.
       -----------------------------------------------------
    */

    const records =
        getAttendanceRecords(
            attendance
        );


    /*
       -----------------------------------------------------
       ARRAY / RECORD ATTENDANCE
       -----------------------------------------------------
    */

    if (
        records.length
    ) {

        records.forEach(
            function (record) {

                if (!record) {

                    return;

                }


                /*
                   If this is a course summary object,
                   handle numeric counts.
                */

                const course =
                    record.course ||
                    record.courseName ||
                    record.subject ||
                    record.courseTitle ||
                    record.name ||
                    "Other";


                const code =
                    record.code ||
                    record.courseCode ||
                    record.subjectCode ||
                    "—";


                const key =
                    `${course}|${code}`;


                if (
                    !courseMap[key]
                ) {

                    courseMap[key] = {

                        course,

                        code,

                        present: 0,

                        absent: 0,

                        leave: 0

                    };

                }


                const numericPresent =
                    record.present ??
                    record.presentDays ??
                    record.classesPresent ??
                    record.attended ??
                    record.presentCount;


                const numericAbsent =
                    record.absent ??
                    record.absentDays ??
                    record.classesAbsent ??
                    record.missed ??
                    record.absentCount;


                const numericLeave =
                    record.leave ??
                    record.leaveDays ??
                    record.leaveCount;


                /*
                   If numeric summary fields exist,
                   use them.
                */

                if (
                    numericPresent !== undefined ||
                    numericAbsent !== undefined ||
                    numericLeave !== undefined
                ) {

                    courseMap[key].present +=
                        toSafeNumber(
                            numericPresent
                        );


                    courseMap[key].absent +=
                        toSafeNumber(
                            numericAbsent
                        );


                    courseMap[key].leave +=
                        toSafeNumber(
                            numericLeave
                        );


                    return;

                }


                /*
                   Otherwise it is a daily attendance record.
                */

                const status =
                    getAttendanceStatus(
                        record
                    );


                if (
                    isPresentStatus(
                        status
                    )
                ) {

                    courseMap[key].present++;

                } else if (
                    isAbsentStatus(
                        status
                    )
                ) {

                    courseMap[key].absent++;

                } else if (
                    isLeaveStatus(
                        status
                    )
                ) {

                    courseMap[key].leave++;

                }

            }
        );

    }


    /*
       -----------------------------------------------------
       If attendance itself is course-wise but records
       extraction didn't catch it.
       -----------------------------------------------------
    */

    if (
        attendance &&
        typeof attendance === "object" &&
        !Array.isArray(
            attendance
        )
    ) {

        const courseWise =
            attendance.courseWise ||
            attendance.courses ||
            attendance.subjects;


        if (
            Array.isArray(
                courseWise
            )
        ) {

            courseWise.forEach(
                function (item) {

                    if (!item) {

                        return;

                    }


                    const course =
                        item.course ||
                        item.courseName ||
                        item.subject ||
                        item.courseTitle ||
                        item.name ||
                        "Other";


                    const code =
                        item.code ||
                        item.courseCode ||
                        item.subjectCode ||
                        "—";


                    const key =
                        `${course}|${code}`;


                    if (
                        !courseMap[key]
                    ) {

                        courseMap[key] = {

                            course,

                            code,

                            present: 0,

                            absent: 0,

                            leave: 0

                        };

                    }


                    courseMap[key].present +=
                        toSafeNumber(
                            item.present ??
                            item.presentDays ??
                            item.classesPresent ??
                            item.attended ??
                            item.presentCount
                        );


                    courseMap[key].absent +=
                        toSafeNumber(
                            item.absent ??
                            item.absentDays ??
                            item.classesAbsent ??
                            item.missed ??
                            item.absentCount
                        );


                    courseMap[key].leave +=
                        toSafeNumber(
                            item.leave ??
                            item.leaveDays ??
                            item.leaveCount
                        );

                }
            );

        }

    }


    const courses =
        Object.values(
            courseMap
        );


    /*
       -----------------------------------------------------
       No course records
       -----------------------------------------------------
    */

    if (!courses.length) {

        /*
           If we have an overall summary but no course
           information, show a meaningful row.
        */

        const summary =
            calculateAttendanceSummary(
                attendance
            );


        if (
            summary.total > 0
        ) {

            tbody.innerHTML = `
                <tr>

                    <td>
                        <strong>
                            Overall Attendance
                        </strong>
                    </td>

                    <td>
                        —
                    </td>

                    <td>
                        ${summary.present}
                    </td>

                    <td>
                        ${summary.absent}
                    </td>

                    <td>
                        ${summary.total}
                    </td>

                    <td>
                        ${formatPercentage(
                            summary.percentage
                        )}
                    </td>

                    <td>
                        ${createStatusBadge(
                            getAttendanceLevel(
                                summary.percentage
                            )
                        )}
                    </td>

                </tr>
            `;

            return;

        }


        tbody.innerHTML = `
            <tr>

                <td colspan="7">

                    No course-wise attendance available.

                </td>

            </tr>
        `;

        return;

    }


    /*
       -----------------------------------------------------
       Render course rows
       -----------------------------------------------------
    */

    tbody.innerHTML =
        courses
            .map(
                function (item) {

                    const total =
                        item.present +
                        item.absent +
                        item.leave;


                    const percentage =
                        total > 0
                            ? (
                                item.present /
                                total
                            ) * 100
                            : 0;


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        item.course
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.code
                                )}
                            </td>

                            <td>
                                ${item.present}
                            </td>

                            <td>
                                ${item.absent}
                            </td>

                            <td>
                                ${total}
                            </td>

                            <td>
                                ${formatPercentage(
                                    percentage
                                )}
                            </td>

                            <td>
                                ${createStatusBadge(
                                    getAttendanceLevel(
                                        percentage
                                    )
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   ATTENDANCE LEVEL
========================================================= */

function getAttendanceLevel(
    percentage
) {

    if (
        percentage === null ||
        percentage === undefined ||
        Number.isNaN(
            Number(
                percentage
            )
        )
    ) {

        return "No Data";

    }


    const value =
        Number(
            percentage
        );


    if (
        value >= 90
    ) {

        return "Excellent";

    }


    if (
        value >= 75
    ) {

        return "Good";

    }


    return "Low";

}


/* =========================================================
   ASSIGNMENTS PAGE
========================================================= */

function renderAssignmentsPage() {

    const assignments =
        getAssignments();


    renderAssignmentStats(
        assignments
    );


    renderAssignmentTable(
        assignments
    );

}


/* =========================================================
   ASSIGNMENT STATS
========================================================= */

function renderAssignmentStats(
    assignments
) {

    const total =
        assignments.length;


    const submitted =
        assignments.filter(
            isSubmitted
        ).length;


    const pending =
        total -
        submitted;


    const graded =
        assignments.filter(
            function (item) {

                return (
                    item.grade !== undefined ||
                    item.marks !== undefined
                );

            }
        ).length;


    setText(
        "totalAssignments",
        total
    );


    setText(
        "submittedAssignments",
        submitted
    );


    setText(
        "pendingAssignments",
        pending
    );


    setText(
        "gradedAssignments",
        graded
    );

}


/* =========================================================
   ASSIGNMENT TABLE
========================================================= */

function renderAssignmentTable(
    assignments,
    filter = "all"
) {

    const tbody =
        document.getElementById(
            "assignmentTableBody"
        );


    if (!tbody) {

        return;

    }


    let filtered =
        assignments;


    if (
        filter === "pending"
    ) {

        filtered =
            assignments.filter(
                function (item) {

                    return !isSubmitted(
                        item
                    );

                }
            );

    }


    if (
        filter === "submitted"
    ) {

        filtered =
            assignments.filter(
                isSubmitted
            );

    }


    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No assignments found.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered
            .map(
                function (item) {

                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        item.title ||
                                        item.name ||
                                        "Assignment"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.course ||
                                    item.courseName ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        item.dueDate ||
                                        item.deadline
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        item.submittedAt ||
                                        item.submissionDate
                                    )
                                )}
                            </td>

                            <td>
                                ${
                                    item.marks ??
                                    item.score ??
                                    "—"
                                }
                            </td>

                            <td>
                                ${createStatusBadge(
                                    getAssignmentStatus(
                                        item
                                    )
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   QUIZZES PAGE
========================================================= */

function renderQuizzesPage() {

    const quizzes =
        getQuizzes();


    renderQuizStats(
        quizzes
    );


    renderQuizTable(
        quizzes
    );


    renderRecentQuizList(
        quizzes
    );

}


/* =========================================================
   QUIZ STATS
========================================================= */

function renderQuizStats(
    quizzes
) {

    const total =
        quizzes.length;


    const attempted =
        quizzes.filter(
            isQuizAttempted
        ).length;


    const pending =
        total -
        attempted;


    const scores =
        quizzes
            .map(
                getQuizPercentage
            )
            .filter(
                function (value) {

                    return value !== null;

                }
            );


    const average =
        scores.length
            ? scores.reduce(
                (
                    a,
                    b
                ) => a + b,
                0
            ) / scores.length
            : null;


    setText(
        "totalQuizzes",
        total
    );


    setText(
        "attemptedQuizzes",
        attempted
    );


    setText(
        "pendingQuizzes",
        pending
    );


    setText(
        "averageQuizScore",
        average !== null
            ? `${formatNumber(
                average
            )}%`
            : "—"
    );

}


/* =========================================================
   QUIZ TABLE
========================================================= */

function renderQuizTable(
    quizzes,
    filter = "all"
) {

    const tbody =
        document.getElementById(
            "quizTableBody"
        );


    if (!tbody) {

        return;

    }


    let filtered =
        quizzes;


    if (
        filter === "attempted"
    ) {

        filtered =
            quizzes.filter(
                isQuizAttempted
            );

    }


    if (
        filter === "pending"
    ) {

        filtered =
            quizzes.filter(
                function (quiz) {

                    return !isQuizAttempted(
                        quiz
                    );

                }
            );

    }


    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    No quizzes found.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered
            .map(
                function (quiz) {

                    const percentage =
                        getQuizPercentage(
                            quiz
                        );


                    return `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        quiz.title ||
                                        quiz.name ||
                                        "Quiz"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHTML(
                                    quiz.course ||
                                    quiz.courseName ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        quiz.date ||
                                        quiz.quizDate
                                    )
                                )}
                            </td>

                            <td>
                                ${
                                    quiz.score ??
                                    quiz.marks ??
                                    "—"
                                }
                            </td>

                            <td>
                                ${
                                    percentage !== null
                                        ? formatNumber(
                                            percentage
                                        ) + "%"
                                        : "—"
                                }
                            </td>

                            <td>
                                ${createStatusBadge(
                                    isQuizAttempted(
                                        quiz
                                    )
                                        ? "Attempted"
                                        : "Pending"
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   RECENT QUIZZES
========================================================= */

function renderRecentQuizList(
    quizzes
) {

    const container =
        document.getElementById(
            "recentQuizList"
        );


    if (!container) {

        return;

    }


    const attempted =
        quizzes.filter(
            isQuizAttempted
        );


    if (!attempted.length) {

        container.innerHTML =
            emptyState(
                "fa-solid fa-chart-line",
                "No completed quizzes available."
            );

        return;

    }


    container.innerHTML =
        attempted
            .slice()
            .reverse()
            .slice(0, 5)
            .map(
                function (quiz) {

                    const percentage =
                        getQuizPercentage(
                            quiz
                        );


                    return `
                        <div class="quiz-item">

                            <div class="quiz-icon">

                                <i class="fa-solid fa-circle-question"></i>

                            </div>

                            <div class="quiz-info">

                                <strong>
                                    ${escapeHTML(
                                        quiz.title ||
                                        quiz.name ||
                                        "Quiz"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        quiz.course ||
                                        quiz.courseName ||
                                        "Course"
                                    )}
                                </span>

                            </div>

                            <div class="quiz-score">

                                <strong>
                                    ${
                                        quiz.score ??
                                        quiz.marks ??
                                        "—"
                                    }
                                </strong>

                                <span>
                                    ${
                                        percentage !== null
                                            ? formatNumber(
                                                percentage
                                            ) + "%"
                                            : ""
                                    }
                                </span>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   PROFILE
========================================================= */

function renderParentProfile() {

    if (!currentParent) {

        return;

    }


    setText(
        "profileParentName",
        currentParent.name ||
        "Parent"
    );


    setText(
        "profileParentEmail",
        currentParent.email ||
        "—"
    );


    setText(
        "profileParentPhone",
        currentParent.phone ||
        "—"
    );


    setText(
        "profileParentRole",
        "Parent"
    );


    if (currentChild) {

        setText(
            "profileChildName",
            currentChild.name ||
            "Student"
        );


        setText(
            "profileChildEmail",
            currentChild.email ||
            "—"
        );

    }

}


/* =========================================================
   CHILD NOT FOUND
========================================================= */

function showChildNotFoundState() {

    console.error(
        "No linked student found for parent.",
        currentParent
    );


    const containers = [

        "resultsTableBody",

        "scheduleTableBody",

        "attendanceTableBody",

        "assignmentTableBody",

        "quizTableBody"

    ];


    containers.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            element.innerHTML = `
                <tr>

                    <td colspan="10">

                        No student is linked
                        to this parent account.

                    </td>

                </tr>
            `;

        }
    );

}


/* =========================================================
   ASSIGNMENT HELPERS
========================================================= */

function isSubmitted(
    assignment
) {

    const status =
        String(
            assignment.status ||
            ""
        ).toLowerCase();


    return (

        assignment.submitted === true ||

        status === "submitted" ||

        status === "graded" ||

        Boolean(
            assignment.submittedAt ||
            assignment.submissionDate
        )

    );

}


function getAssignmentStatus(
    assignment
) {

    const status =
        String(
            assignment.status ||
            ""
        ).toLowerCase();


    if (
        status === "graded" ||
        assignment.grade !== undefined ||
        assignment.marks !== undefined
    ) {

        return "Graded";

    }


    if (
        status === "submitted" ||
        isSubmitted(
            assignment
        )
    ) {

        return "Submitted";

    }


    return "Pending";

}


/* =========================================================
   QUIZ HELPERS
========================================================= */

function isQuizAttempted(
    quiz
) {

    const status =
        String(
            quiz.status ||
            ""
        ).toLowerCase();


    return (

        quiz.attempted === true ||

        status === "attempted" ||

        status === "completed" ||

        quiz.score !== undefined ||

        quiz.marks !== undefined

    );

}


function getQuizPercentage(
    quiz
) {

    const percentage =
        quiz.percentage ??
        quiz.percent;


    if (
        percentage !== undefined &&
        percentage !== null
    ) {

        return Number(
            percentage
        );

    }


    const score =
        Number(
            quiz.score ??
            quiz.marks
        );


    const total =
        Number(
            quiz.total ??
            quiz.totalMarks ??
            quiz.maxMarks
        );


    if (
        !Number.isNaN(score) &&
        !Number.isNaN(total) &&
        total > 0
    ) {

        return (
            score /
            total *
            100
        );

    }


    return null;

}


/* =========================================================
   GPA
========================================================= */

function calculateGPA(
    results
) {

    if (!results.length) {

        return null;

    }


    let totalPoints = 0;

    let totalCredits = 0;


    results.forEach(
        function (result) {

            const grade =
                result.grade ||
                calculateGrade(
                    result.marks ??
                    result.score
                );


            const point =
                Number(
                    result.gradePoint ??
                    result.gpa ??
                    calculateGradePoint(
                        grade
                    )
                );


            const credits =
                Number(
                    result.creditHours ||
                    result.credits ||
                    1
                );


            if (
                !Number.isNaN(
                    point
                )
            ) {

                totalPoints +=
                    point *
                    credits;


                totalCredits +=
                    credits;

            }

        }
    );


    if (!totalCredits) {

        return null;

    }


    return (
        totalPoints /
        totalCredits
    );

}


/* =========================================================
   GRADE
========================================================= */

function calculateGrade(
    marks
) {

    const value =
        Number(
            marks
        );


    if (
        Number.isNaN(
            value
        )
    ) {

        return "—";

    }


    if (value >= 90) return "A+";

    if (value >= 85) return "A";

    if (value >= 80) return "A-";

    if (value >= 75) return "B+";

    if (value >= 70) return "B";

    if (value >= 65) return "B-";

    if (value >= 60) return "C+";

    if (value >= 55) return "C";

    if (value >= 50) return "D";


    return "F";

}


/* =========================================================
   GRADE POINT
========================================================= */

function calculateGradePoint(
    grade
) {

    const points = {

        "A+": 4.00,

        "A": 4.00,

        "A-": 3.67,

        "B+": 3.33,

        "B": 3.00,

        "B-": 2.67,

        "C+": 2.33,

        "C": 2.00,

        "C-": 1.67,

        "D": 1.00,

        "F": 0.00

    };


    return (
        points[
            String(
                grade || ""
            ).toUpperCase()
        ] ?? "—"
    );

}


/* =========================================================
   UI HELPERS
========================================================= */

function createGradeBadge(
    grade
) {

    return `
        <span class="grade-badge">
            ${escapeHTML(
                String(
                    grade || "—"
                )
            )}
        </span>
    `;

}


function createStatusBadge(
    status
) {

    return `
        <span class="status-badge">
            ${escapeHTML(
                String(
                    status || "Pending"
                )
            )}
        </span>
    `;

}


function createAssignmentItem(
    assignment
) {

    return `
        <div class="assignment-item">

            <div class="assignment-icon">

                <i class="fa-solid fa-file-pen"></i>

            </div>

            <div class="assignment-info">

                <strong>
                    ${escapeHTML(
                        assignment.title ||
                        assignment.name ||
                        "Assignment"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        assignment.course ||
                        assignment.courseName ||
                        "Course"
                    )}
                </span>

                <small>
                    Due:
                    ${escapeHTML(
                        formatDate(
                            assignment.dueDate ||
                            assignment.deadline
                        )
                    )}
                </small>

            </div>

            ${createStatusBadge(
                getAssignmentStatus(
                    assignment
                )
            )}

        </div>
    `;

}


function createQuizItem(
    quiz
) {

    const percentage =
        getQuizPercentage(
            quiz
        );


    return `
        <div class="quiz-item">

            <div class="quiz-icon">

                <i class="fa-solid fa-circle-question"></i>

            </div>

            <div class="quiz-info">

                <strong>
                    ${escapeHTML(
                        quiz.title ||
                        quiz.name ||
                        "Quiz"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        quiz.course ||
                        quiz.courseName ||
                        "Course"
                    )}
                </span>

            </div>

            <div class="quiz-score">

                <strong>
                    ${
                        quiz.score ??
                        quiz.marks ??
                        "—"
                    }
                </strong>

                <span>
                    ${
                        percentage !== null
                            ? formatNumber(
                                percentage
                            ) + "%"
                            : ""
                    }
                </span>

            </div>

        </div>
    `;

}


function emptyState(
    icon,
    message
) {

    return `
        <div class="empty-state">

            <i class="${icon}"></i>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

        </div>
    `;

}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value !== undefined &&
        value !== null
            ? value
            : "—";

}


/* =========================================================
   SAFE NUMBER
========================================================= */

function toSafeNumber(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(
            value
        );


    return Number.isNaN(
        number
    )
        ? 0
        : number;

}


/* =========================================================
   PARSE PERCENTAGE
========================================================= */

function parsePercentage(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(
            String(
                value
            )
            .replace(
                "%",
                ""
            )
            .trim()
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return null;

    }


    return number;

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    if (!name) {

        return "P";

    }


    const words =
        String(
            name
        )
        .trim()
        .split(
            /\s+/
        );


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[
            words.length - 1
        ][0]
    ).toUpperCase();

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleDateString(
        "en-US",
        {

            month: "short",

            day: "numeric",

            year: "numeric"

        }
    );

}


/* =========================================================
   DATE DAY
========================================================= */

function getDateDay(
    value
) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.getDate();

}


/* =========================================================
   DATE MONTH
========================================================= */

function getDateMonth(
    value
) {

    if (!value) {

        return "---";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "---";

    }


    return date
        .toLocaleDateString(
            "en-US",
            {

                month: "short"

            }
        )
        .toUpperCase();

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return "—";

    }


    return number.toFixed(
        2
    );

}


/* =========================================================
   FORMAT PERCENTAGE
========================================================= */

function formatPercentage(
    value
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(
            Number(
                value
            )
        )
    ) {

        return "—";

    }


    return (
        Number(
            value
        ).toFixed(
            1
        ) +
        "%"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}

/* =========================================================
   TEACHER-PUBLISHED RESULTS & QUIZZES
   Only the linked child's enrolled subjects are included.
========================================================= */
function parentNormalizeCourse(value) {
    return String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}
function parentChildIdentifiers(child) {
    return [child && child.id, child && child.userId, child && child.user_id,
        child && child.studentId, child && child.student_id, child && child.email,
        child && child.username].filter(Boolean).map(v => String(v).trim().toLowerCase());
}
function parentChildCourses(child) {
    const out = [];
    const add = source => {
        if (!source) return;
        if (typeof source === "string") { source.split(",").forEach(v => v.trim() && out.push(v.trim())); return; }
        if (Array.isArray(source)) { source.forEach(item => {
            if (typeof item === "string") out.push(item);
            else if (item && typeof item === "object") out.push(item.code || item.courseCode || item.course_code || item.name || item.title || item.subject || "");
        }); return; }
        if (typeof source === "object") Object.values(source).forEach(add);
    };
    [child && child.courses, child && child.enrolledCourses, child && child.enrolled_courses,
     child && child.subjects, child && child.academicData && child.academicData.courses].forEach(add);
    return [...new Set(out.map(v => String(v || "").trim()).filter(Boolean))];
}
function parentIsEnrolled(child, course) {
    const target = parentNormalizeCourse(course);
    return !!target && parentChildCourses(child).some(value => {
        const normalized = parentNormalizeCourse(value);
        return normalized === target || (normalized.length >= 4 && (normalized.includes(target) || target.includes(normalized)));
    });
}
function parentPublishedTeacherResults() {
    if (!currentChild) return [];
    let items = [];
    try { items = JSON.parse(localStorage.getItem("learnora_teacher_results") || "[]"); } catch (_) {}
    if (!Array.isArray(items)) return [];
    const ids = parentChildIdentifiers(currentChild);
    return items.filter(item =>
        String(item.status || "").toLowerCase() === "published" &&
        ids.includes(String(item.studentId || "").trim().toLowerCase()) &&
        parentIsEnrolled(currentChild, item.course)
    ).map(item => ({
        ...item,
        course: item.course || item.courseName || item.subject || "—",
        code: item.courseCode || item.course || "—",
        creditHours: item.creditHours || item.credits || 0,
        marks: Number(item.percentage ?? ((Number(item.obtainedMarks) / (Number(item.totalMarks) || 1)) * 100)),
        score: Number(item.percentage ?? 0),
        grade: item.grade || "—",
        semester: "Latest published",
        updatedAt: item.updatedAt || item.createdAt || ""
    })).sort((a,b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}
function getResults() {
    const academic = getAcademicData();
    const existing = academic.results || currentChild.results || [];
    const oldResults = Array.isArray(existing) ? existing : [];
    const teacherResults = parentPublishedTeacherResults();
    const teacherIds = new Set(teacherResults.map(r => String(r.id)));
    const combined = [...teacherResults, ...oldResults.filter(r => !teacherIds.has(String(r.id)))];
    return combined;
}
function getQuizzes() {
    const academic = getAcademicData();
    const existing = academic.quizzes || currentChild.quizzes || [];
    const oldQuizzes = Array.isArray(existing) ? existing : [];
    let shared = [];
    try {
        const data = JSON.parse(localStorage.getItem("learnora_academic_data") || "{}");
        shared = Array.isArray(data.quizzes) ? data.quizzes : [];
    } catch (_) {}
    const ids = parentChildIdentifiers(currentChild);
    const published = shared.filter(q =>
        (q.published === true || String(q.status || "").toLowerCase() === "published") &&
        parentIsEnrolled(currentChild, q.subject || q.course || q.courseName)
    ).map(q => ({
        ...q,
        course: q.subject || q.course || q.courseName || "—",
        date: q.dueDate || q.updatedAt || q.createdAt || "",
        score: q.score ?? q.marks,
        status: q.status || "Published"
    })).sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    const known = new Set(oldQuizzes.map(q => String(q.id || q.title || q.name)));
    return [...published.filter(q => !known.has(String(q.id || q.title || q.name))), ...oldQuizzes];
}
window.addEventListener("storage", function(event) {
    if (event.key === "learnora_teacher_results" || event.key === "learnora_academic_data") {
        const page = getCurrentPage();
        if (page === "results.html") renderResultsPage();
        if (page === "quizzes.html") renderQuizzesPage();
    }
});
