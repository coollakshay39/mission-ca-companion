// =======================================================
// dashboard.js
// PART 1 / 2
// =======================================================

function renderDashboardScreen() {

    const app = document.getElementById("app");

    const mission = getMission();
    const plan = getPlan();

    if (!mission || !plan) {
        navigate("welcome");
        return;
    }

    calculateMissionProgress();

    const totalSubjects = plan.subjects.length;

    const completedSubjects = plan.subjects.filter(
        subject => subject.progress >= 100
    ).length;

    const completedChapters =
        getCompletedOverallChapterCount();

    const totalChapters =
        getOverallChapterCount();

    app.innerHTML = `

    <div class="screen dashboard-screen">

        <!-- ==========================
             HEADER
        =========================== -->

        <div class="page-header">

            <button
                id="homeBtn"
                class="secondary-btn"
            >
                🏠 Home
            </button>

            <div class="header-text">

                <h1>

                    ${plan.name}

                </h1>

                <p>

                    ${mission.name}

                </p>

            </div>

        </div>

        <!-- ==========================
             HERO
        =========================== -->

        <section class="glass-card dashboard-hero">

            <div class="hero-left">

                ${renderProgressRing(
                    plan.progress
                )}

            </div>

            <div class="hero-right">

                <span class="hero-badge">

                    📈 Progress Overview

                </span>

                <h2>

                    ${plan.progress}% Complete

                </h2>

                <div class="hero-stats">

                    <div>

                        <strong>

                            ${completedChapters}

                        </strong>

                        <span>

                            Chapters Done

                        </span>

                    </div>

                    <div>

                        <strong>

                            ${completedSubjects}

                        </strong>

                        <span>

                            Subjects Finished

                        </span>

                    </div>

                </div>

                <div class="hero-message">

                    ${getDashboardMotivation(
                        plan.progress
                    )}

                </div>

            </div>

        </section>

        <!-- ==========================
             QUICK STATS
        =========================== -->

        <section class="stats-grid">

            <div class="glass-card stat-card">

                <h3>

                    Subjects

                </h3>

                <span>

                    ${totalSubjects}

                </span>

            </div>

            <div class="glass-card stat-card">

                <h3>

                    Completed

                </h3>

                <span>

                    ${completedSubjects}

                </span>

            </div>

            <div class="glass-card stat-card">

                <h3>

                    Chapters

                </h3>

                <span>

                    ${completedChapters}

                </span>

            </div>

            <div class="glass-card stat-card">

                <h3>

                    Remaining

                </h3>

                <span>

                    ${Math.max(
                        totalChapters -
                        completedChapters,
                        0
                    )}

                </span>

            </div>

        </section>

        <!-- ==========================
             SUBJECTS
        =========================== -->

        <section class="glass-card subjects-card">

            <div class="section-header">

                <div>

                    <h2>

                        Subjects

                    </h2>

                    <p class="section-subtitle">

                        Track every subject separately.

                    </p>

                </div>

            </div>

            ${

                plan.subjects.length === 0

                ?

                dashboardEmptyState()

                :

                `

                <div class="subject-list">

                    ${plan.subjects
                        .map(
                            renderDashboardSubjectCard
                        )
                        .join("")}

                </div>

                `

            }

        </section>

        <!-- ==========================
             ADD SUBJECT
        =========================== -->

        <section class="glass-card add-subject-card">

            <h2>

                Add Subject

            </h2>

            <p class="section-subtitle">

                Create a new subject for this study plan.

            </p>

            <div class="row">

                <input

                    id="subjectName"

                    class="text-input"

                    placeholder="Financial Reporting"

                >

                <input

                    id="subjectWeight"

                    class="text-input"

                    type="number"

                    min="1"

                    max="100"

                    placeholder="%"

                >

            </div>

            <button

                id="addSubjectBtn"

                class="primary-btn"

            >

                + Add Subject

            </button>

        </section>

    </div>

    `;

    attachDashboardEvents();

}

/* =======================================================
   SUBJECT CARD
======================================================= */

function renderDashboardSubjectCard(subject){

    return `

    <article class="subject-card">

        <div class="subject-header">

            <div class="subject-info">

                <h3>

                    ${subject.name}

                </h3>

                <p>

                    Weight • ${subject.weight}%

                </p>

            </div>

            <div class="subject-progress">

                ${subject.progress}%

            </div>

        </div>

        <div class="progress-bar">

            <div

                class="progress-fill"

                style="width:${subject.progress}%"

            ></div>

        </div>

        <div class="subject-footer">

            <button

                class="secondary-btn open-subject"

                data-id="${subject.id}"

            >

                📖 Open

            </button>

            <button

                class="secondary-btn rename-subject"

                data-id="${subject.id}"

            >

                ✏️ Rename

            </button>

            <button

                class="secondary-btn weight-subject"

                data-id="${subject.id}"

            >

                ⚖️ Weight

            </button>

            <button

                class="danger-btn delete-subject"

                data-id="${subject.id}"

            >

                🗑 Delete

            </button>

        </div>

    </article>

    `;

}

/* =======================================================
   EVENTS
======================================================= */

function attachDashboardEvents(){

    document
        .getElementById("homeBtn")
        .onclick=()=>{

            navigate("welcome");

        };

    document
        .getElementById("addSubjectBtn")
        .onclick=()=>{

            const name=document
                .getElementById("subjectName")
                .value
                .trim();

            const weight=Number(

                document
                    .getElementById("subjectWeight")
                    .value

            );

            if(!name){

                alert(

                    "Please enter a subject name."

                );

                return;

            }

            if(

                Number.isNaN(weight) ||

                weight<=0 ||

                weight>100

            ){

                alert(

                    "Weight must be between 1 and 100."

                );

                return;

            }

            addSubject(

                name,

                weight

            );

            refreshDashboardData();

        };

    document

        .querySelectorAll(".open-subject")

        .forEach(button=>{

            button.onclick=()=>{

                selectSubject(

                    button.dataset.id

                );

                saveState();

                navigate(

                    "subject"

                );

            };

        });

    document

        .querySelectorAll(".rename-subject")

        .forEach(button=>{

            button.onclick=()=>{

                const subject=getSubject(

                    button.dataset.id

                );

                if(!subject){

                    return;

                }

                showEditDialog({
                    title:"Rename subject",
                    label:"Subject name",
                    value:subject.name,
                    onSave:newName=>{
                        renameSubject(subject.id,newName);
                        refreshDashboardData();
                    }
                });

            };

        });

    document

        .querySelectorAll(".weight-subject")

        .forEach(button=>{

            button.onclick=()=>{

                const subject=getSubject(

                    button.dataset.id

                );

                if(!subject){

                    return;

                }

                showEditDialog({
                    title:"Change subject weight",
                    label:"Weight (%)",
                    value:subject.weight,
                    type:"number",
                    min:1,
                    max:100,
                    onSave:weight=>{
                        updateSubjectWeight(subject.id,Number(weight));
                        refreshDashboardData();
                    }
                });

            };

        });

    document

        .querySelectorAll(".delete-subject")

        .forEach(button=>{

            button.onclick=()=>{

                if(

                    !confirm(

                        "Delete this subject?"

                    )

                ){

                    return;

                }

                deleteSubject(

                    button.dataset.id

                );

                refreshDashboardData();

            };

        });

}

/* =======================================================
   HELPERS
======================================================= */

function refreshDashboardData(){

    calculateMissionProgress();

    saveState();

    renderDashboardScreen();

}

function dashboardEmptyState(){

    return `

    <div class="dashboard-empty">

        <h3>

            📚 No Subjects Yet

        </h3>

        <p>

            Add your first subject to begin tracking your progress.

        </p>

    </div>

    `;

}

function getDashboardMotivation(progress){

    if(progress>=100){

        return getCompletedMessage();

    }

    if(progress>=90){

        return getAheadMessage();

    }

    if(progress>=60){

        return getOnTrackMessage();

    }

    return getBehindMessage();

}

function getDashboardCompletionMessage(){

    const progress=getPlanProgress();

    if(progress===100){

        return "🎉 Amazing! This study plan is complete.";

    }

    if(progress>=90){

        return "🔥 Almost done. Keep pushing!";

    }

    if(progress>=75){

        return "💪 Excellent progress.";

    }

    if(progress>=50){

        return "📚 Halfway there.";

    }

    if(progress>=25){

        return "🚀 Good start. Stay consistent.";

    }

    return "🌱 Every completed chapter counts.";

}

function getCompletedSubjectCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.filter(

        subject=>subject.progress>=100

    ).length;

}

function getRemainingSubjectCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.filter(

        subject=>subject.progress<100

    ).length;

}

function getAverageSubjectProgress(){

    const plan=getPlan();

    if(

        !plan ||

        plan.subjects.length===0

    ){

        return 0;

    }

    const total=

        plan.subjects.reduce(

            (sum,subject)=>

                sum+subject.progress,

            0

        );

    return Math.round(

        total/

        plan.subjects.length

    );

}
