// =======================================================
// charts.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

let subjectChart=null;
let historyChart=null;

function renderChartsScreen(){

    const app=document.getElementById("app");

    const mission=getMission();
    const plan=getPlan();

    if(!mission||!plan){

        navigate("dashboard");

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

                    Progress Analytics

                </h1>

                <p>

                    Mission Statistics

                </p>

            </div>

        </div>

        <div class="stats-grid">

            <div class="glass-card stat-card">

                <h3>

                    Overall Progress

                </h3>

                <span>

                    ${mission.progress}%

                </span>

            </div>

            <div class="glass-card stat-card">

                <h3>

                    Subjects

                </h3>

                <span>

                    ${plan.subjects.length}

                </span>

            </div>

            <div class="glass-card stat-card">

                <h3>

                    Chapters

                </h3>

                <span>

                    ${getOverallChapterCount()}

                </span>

            </div>

            <div class="glass-card stat-card">

                <h3>

                    Completed

                </h3>

                <span>

                    ${getCompletedOverallChapterCount()}

                </span>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Subject Progress

            </h2>

            <canvas

                id="subjectChart"

                height="320"

            ></canvas>

        </div>

        <div class="glass-card">

            <h2>

                Weekly Progress

            </h2>

            <canvas

                id="historyChart"

                height="320"

            ></canvas>

        </div>

    </div>

    `;

    attachChartsEvents();

    createSubjectChart();

    createHistoryChart();

}

function attachChartsEvents(){

    document.getElementById(

        "dashboardBtn"

    ).onclick=()=>{

        navigate(

            "dashboard"

        );

    };

}

function createSubjectChart(){

    const ctx=document

        .getElementById(

            "subjectChart"

        )

        .getContext("2d");

    if(subjectChart){

        subjectChart.destroy();

    }

    const subjects=getPlan().subjects;

    subjectChart=new Chart(

        ctx,

        {

            type:"doughnut",

            data:{

                labels:subjects.map(

                    subject=>subject.name

                ),

                datasets:[{

                    data:subjects.map(

                        subject=>subject.progress

                    )

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                cutout:"70%",

                plugins:{

                    legend:{

                        position:"bottom"

                    }

                },

                animation:{

                    animateRotate:true,

                    duration:1200

                }

            }

        }

    );

}

function createHistoryChart(){

    const ctx=document

        .getElementById(

            "historyChart"

        )

        .getContext("2d");

    if(historyChart){

        historyChart.destroy();

    }

    const history=getWeeklyHistory();

    historyChart=new Chart(

        ctx,

        {

            type:"line",

            data:{

                labels:history.map(

                    item=>item.date

                ),

                datasets:[

                    {

                        label:"Mission Progress",

                        data:history.map(

                            item=>item.progress

                        ),

                        tension:0.35,

                        fill:false

                    }

                ]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:true

                    }

                },

                scales:{

                    y:{

                        min:0,

                        max:100,

                        ticks:{

                            stepSize:10

                        }

                    }

                },

                animation:{

                    duration:1200

                }

            }

        }

    );

}

/* ==========================================
   HELPERS
========================================== */

function refreshCharts(){

    calculateMissionProgress();

    saveState();

    renderChartsScreen();

}

function getWeeklyHistory(){

    if(

        !state.history||

        state.history.length===0

    ){

        return [

            {

                date:"Week 1",

                progress:0

            }

        ];

    }

    return state.history;

}

function addWeeklyHistory(){

    if(

        !state.history

    ){

        state.history=[];

    }

    state.history.push({

        date:new Date().toLocaleDateString(

            "en-IN",

            {

                day:"2-digit",

                month:"short"

            }

        ),

        progress:getMission().progress

    });

    if(

        state.history.length>12

    ){

        state.history.shift();

    }

    saveState();

}

function clearHistory(){

    state.history=[];

    saveState();

    refreshCharts();

}

function exportHistory(){

    return JSON.stringify(

        getWeeklyHistory(),

        null,

        2

    );

}

function getBestSubject(){

    const subjects=getPlan().subjects;

    if(subjects.length===0){

        return null;

    }

    return subjects.reduce(

        (best,current)=>

            current.progress>

            best.progress

                ?current

                :best

    );

}

function getWeakestSubject(){

    const subjects=getPlan().subjects;

    if(subjects.length===0){

        return null;

    }

    return subjects.reduce(

        (worst,current)=>

            current.progress<

            worst.progress

                ?current

                :worst

    );

}

function getOverallChapterCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.reduce(

        (total,subject)=>

            total+

            subject.chapters.length,

        0

    );

}

function getCompletedOverallChapterCount(){

    const plan=getPlan();

    if(!plan){

        return 0;

    }

    return plan.subjects.reduce(

        (total,subject)=>{

            return total+

            subject.chapters.filter(

                chapter=>

                    chapter.completed

            ).length;

        },

        0

    );

}