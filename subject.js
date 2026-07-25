// =======================================================
// subject.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

function renderSubjectScreen(){

    const app=document.getElementById("app");

    const mission=getMission();
    const plan=getPlan();
    const subject=getSubject();

    if(!mission||!plan||!subject){

        navigate("dashboard");
        return;

    }

    calculateMissionProgress();

    const completed=getCompletedChapterCount(subject.id);
    const total=getChapterCount(subject.id);

    app.innerHTML=`

    <div class="screen subject-screen">

        <div class="page-header">

            <button
                id="dashboardBtn"
                class="secondary-btn"
            >

                ← Dashboard

            </button>

            <div>

                <h1>

                    ${subject.name}

                </h1>

                <p>

                    ${plan.name}

                </p>

            </div>

        </div>

        <div class="glass-card dashboard-summary">

            <div>

                ${renderProgressRing(subject.progress)}

            </div>

            <div>

                <h2>

                    ${subject.progress}% Complete

                </h2>

                <p>

                    ${completed} / ${total} Chapters Completed

                </p>

                <div class="hero-message">

                    ${getSubjectCompletionMessage()}

                </div>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Chapters

            </h2>

            ${
                subject.chapters.length===0

                ?

                subjectEmptyState()

                :

                `

                <div class="chapter-list">

                    ${subject.chapters
                        .map(renderChapterCard)
                        .join("")}

                </div>

                `
            }

        </div>

        <div class="glass-card">

            <h2>

                Add Chapter

            </h2>

            <div class="row">

                <input
                    id="chapterName"
                    class="text-input"
                    placeholder="Chapter Name"
                >

                <input
                    id="chapterWeight"
                    class="text-input"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="%"
                >

            </div>

            <button
                id="addChapterBtn"
                class="primary-btn"
            >

                + Add Chapter

            </button>

        </div>

    </div>

    `;

    attachSubjectEvents();

}

function renderChapterCard(chapter){

    return`

    <div class="chapter-card">

        <div class="chapter-info">

            <div>

                <h3>

                    ${chapter.name}

                </h3>

                <p>

                    Weight : ${chapter.weight}%

                </p>

            </div>

            <label class="chapter-checkbox">

                <input

                    type="checkbox"

                    class="toggle-chapter"

                    data-id="${chapter.id}"

                    ${chapter.completed?"checked":""}

                >

                Completed

            </label>

        </div>

        <div class="chapter-actions">

            <button

                class="secondary-btn rename-chapter"

                data-id="${chapter.id}"

            >

                Rename

            </button>

            <button

                class="secondary-btn weight-chapter"

                data-id="${chapter.id}"

            >

                Weight

            </button>

            <button

                class="danger-btn delete-chapter"

                data-id="${chapter.id}"

            >

                Delete

            </button>

        </div>

    </div>

    `;

}

function attachSubjectEvents(){

    document.getElementById(

        "dashboardBtn"

    ).onclick=()=>{

        navigate(

            "dashboard"

        );

    };

    document.getElementById(

        "addChapterBtn"

    ).onclick=()=>{

        const name=document
            .getElementById(
                "chapterName"
            )
            .value
            .trim();

        const weight=Number(

            document
                .getElementById(
                    "chapterWeight"
                )
                .value

        );

        if(!name){

            alert(

                "Please enter a chapter name."

            );

            return;

        }

        if(

            Number.isNaN(weight)||
            weight<=0||
            weight>100

        ){

            alert(

                "Weight must be between 1 and 100."

            );

            return;

        }

        addChapter(

            state.selectedSubjectId,

            name,

            weight

        );

        refreshSubjectPage();

    };

    document
        .querySelectorAll(
            ".toggle-chapter"
        )
        .forEach(input=>{

            input.onchange=()=>{

                toggleChapterComplete(

                    input.dataset.id

                );

                refreshSubjectPage();

            };

        });

    document
        .querySelectorAll(
            ".rename-chapter"
        )
        .forEach(button=>{

            button.onclick=()=>{

                const chapter=getChapter(

                    button.dataset.id

                );

                if(!chapter){

                    return;

                }

                showEditDialog({
                    title:"Rename chapter",
                    label:"Chapter name",
                    value:chapter.name,
                    onSave:newName=>{
                        renameChapter(chapter.id,newName);
                        refreshSubjectPage();
                    }
                });

            };

        });

            document
        .querySelectorAll(
            ".weight-chapter"
        )
        .forEach(button=>{

            button.onclick=()=>{

                const chapter=getChapter(

                    button.dataset.id

                );

                if(!chapter){

                    return;

                }

                showEditDialog({
                    title:"Change chapter weight",
                    label:"Weight (%)",
                    value:chapter.weight,
                    type:"number",
                    min:1,
                    max:100,
                    onSave:weight=>{
                        updateChapterWeight(chapter.id,Number(weight));
                        refreshSubjectPage();
                    }
                });

            };

        });

    document
        .querySelectorAll(
            ".delete-chapter"
        )
        .forEach(button=>{

            button.onclick=()=>{

                if(

                    !confirm(

                        "Delete this chapter?"

                    )

                ){

                    return;

                }

                deleteChapter(

                    button.dataset.id

                );

                refreshSubjectPage();

            };

        });

}

/* ==========================================
   HELPERS
========================================== */

function refreshSubjectPage(){

    calculateMissionProgress();

    saveState();

    renderSubjectScreen();

}

function subjectEmptyState(){

    return `

    <div class="empty-state">

        <h3>

            📚 No Chapters Yet

        </h3>

        <p>

            Add your first chapter to begin tracking your progress.

        </p>

    </div>

    `;

}

function getSubjectCompletionMessage(){

    const progress=getSubjectProgress();

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

function getCompletedWeight(subject){

    if(!subject){

        return 0;

    }

    return subject.chapters.reduce(

        (sum,chapter)=>{

            if(chapter.completed){

                return sum+Number(chapter.weight);

            }

            return sum;

        },

        0

    );

}

function getRemainingWeight(subject){

    if(!subject){

        return 0;

    }

    return Math.max(

        100-getCompletedWeight(subject),

        0

    );

}

function getCompletionPercentage(subject){

    if(!subject){

        return 0;

    }

    calculateSubjectProgress(subject);

    return subject.progress;

}

function getCompletedChapterCount(subjectId){

    const subject=getSubject(subjectId);

    if(!subject){

        return 0;

    }

    return subject.chapters.filter(

        chapter=>chapter.completed

    ).length;

}

function getChapterCount(subjectId){

    const subject=getSubject(subjectId);

    if(!subject){

        return 0;

    }

    return subject.chapters.length;

}

function getSubjectProgress(){

    const subject=getSubject();

    if(!subject){

        return 0;

    }

    calculateSubjectProgress(subject);

    return subject.progress;

}

function findChapter(chapterId){

    const subject=getSubject();

    if(!subject){

        return null;

    }

    return subject.chapters.find(

        chapter=>chapter.id===chapterId

    );

}
