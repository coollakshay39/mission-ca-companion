// =======================================================
// mission.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

function renderMissionScreen(){

    const app=document.getElementById("app");

    const mission=getMission();

    if(!mission){

        navigate("welcome");

        return;

    }

    calculateMissionProgress();

    app.innerHTML=`

    <div class="screen">

        <div class="page-header">

            <button
                id="dashboardBtn"
                class="secondary-btn"
            >

                ← Dashboard

            </button>

            <div>

                <h1>

                    ${mission.name}

                </h1>

                <p>

                    Overall Mission

                </p>

            </div>

        </div>

        <div class="glass-card dashboard-summary">

            <div>

                ${renderProgressRing(mission.progress)}

            </div>

            <div>

                <h2>

                    ${mission.progress}% Complete

                </h2>

                <p>

                    ${getCompletedSubjectCount()} / ${getPlan().subjects.length} Subjects Completed

                </p>

                <div class="hero-message">

                    ${getMissionCompletionMessage()}

                </div>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Subjects

            </h2>

            <div class="mission-subject-list">

                ${getPlan().subjects
                    .map(renderMissionSubject)
                    .join("")}

            </div>

        </div>

    </div>

    `;

    attachMissionEvents();

}

function renderMissionSubject(subject){

    return`

    <div class="subject-card">

        <div class="subject-header">

            <div>

                <h3>

                    ${subject.name}

                </h3>

                <p>

                    Weight : ${subject.weight}%

                </p>

            </div>

            <strong>

                ${subject.progress}%

            </strong>

        </div>

        <div class="progress-bar">

            <div

                class="progress-fill"

                style="width:${subject.progress}%"

            ></div>

        </div>

    </div>

    `;

}

function attachMissionEvents(){

    document.getElementById(

        "dashboardBtn"

    ).onclick=()=>{

        navigate(

            "dashboard"

        );

    };

}

/* ==========================================
   MISSION HELPERS
========================================== */

function refreshMissionPage(){

    calculateMissionProgress();

    saveState();

    renderMissionScreen();

}

function getMissionCompletionMessage(){

    const progress=getMissionProgress();

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

function getMissionProgress(){

    const mission=getMission();

    if(!mission){

        return 0;

    }

    calculateMissionProgress();

    return mission.progress;

}

function getMissionSubjectCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.length;

}

function getMissionCompletedSubjectCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.filter(

        subject=>subject.progress>=100

    ).length;

}

function getMissionRemainingSubjectCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.filter(

        subject=>subject.progress<100

    ).length;

}

function getMissionAverageProgress(){

    const plan=getPlan();

    if(

        !plan||

        plan.subjects.length===0

    ){

        return 0;

    }

    const total=plan.subjects.reduce(

        (sum,subject)=>sum+subject.progress,

        0

    );

    return Math.round(

        total/plan.subjects.length

    );

}

function getMissionCompletedWeight(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.reduce(

        (sum,subject)=>{

            return sum+

            (

                Number(subject.weight) *

                (subject.progress/100)

            );

        },

        0

    );

}

function getMissionRemainingWeight(){

    return Math.max(

        100-getMissionCompletedWeight(),

        0

    );

}

function findMissionSubject(subjectId){

    const plan=getPlan();

    if(!plan){

        return null;

    }

    return plan.subjects.find(

        subject=>subject.id===subjectId

    );

}