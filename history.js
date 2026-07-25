// =======================================================
// history.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

function renderHistoryScreen(){

    const app=document.getElementById("app");

    const history=getWeeklyHistory();

    app.innerHTML=`

    <div class="screen history-screen">

        <div class="page-header">

            <button
                id="dashboardBtn"
                class="secondary-btn"
            >

                ← Dashboard

            </button>

            <div>

                <h1>

                    Weekly History

                </h1>

                <p>

                    Track your study consistency

                </p>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Weekly Timeline

            </h2>

            ${
                history.length===0

                ?

                historyEmptyState()

                :

                `

                <div class="history-list">

                    ${history
                        .map(renderHistoryCard)
                        .join("")}

                </div>

                `

            }

        </div>

        <div class="glass-card">

            <h2>

                Statistics

            </h2>

            <div class="stats-grid">

                <div class="stat-card">

                    <h3>

                        Records

                    </h3>

                    <span>

                        ${history.length}

                    </span>

                </div>

                <div class="stat-card">

                    <h3>

                        Highest

                    </h3>

                    <span>

                        ${getHighestHistoryProgress()}%

                    </span>

                </div>

                <div class="stat-card">

                    <h3>

                        Average

                    </h3>

                    <span>

                        ${getAverageHistoryProgress()}%

                    </span>

                </div>

                <div class="stat-card">

                    <h3>

                        Current

                    </h3>

                    <span>

                        ${getMission().progress}%

                    </span>

                </div>

            </div>

        </div>

        <div class="glass-card">

            <button

                id="addSnapshotBtn"

                class="primary-btn"

            >

                Save Weekly Snapshot

            </button>

            <button

                id="exportHistoryBtn"

                class="secondary-btn"

            >

                Export History

            </button>

            <button

                id="clearHistoryBtn"

                class="danger-btn"

            >

                Clear History

            </button>

        </div>

    </div>

    `;

    attachHistoryEvents();

}

function renderHistoryCard(item,index){

    return`

    <div class="history-card">

        <div>

            <h3>

                Week ${index+1}

            </h3>

            <p>

                ${item.date}

            </p>

        </div>

        <div>

            <strong>

                ${item.progress}%

            </strong>

        </div>

    </div>

    `;

}

function attachHistoryEvents(){

    document.getElementById(

        "dashboardBtn"

    ).onclick=()=>{

        navigate(

            "dashboard"

        );

    };

    document.getElementById(

        "addSnapshotBtn"

    ).onclick=()=>{

        addWeeklyHistory();

        refreshHistoryScreen();

    };

    document.getElementById(

        "exportHistoryBtn"

    ).onclick=()=>{

        const file=exportHistory();

        console.log(file);

        showToast(

            "History exported."

        );

    };

    document.getElementById(

        "clearHistoryBtn"

    ).onclick=()=>{

        if(

            !confirm(

                "Delete all history?"

            )

        ){

            return;

        }

        clearHistory();

    };

}

/* ==========================================
   HISTORY HELPERS
========================================== */

function refreshHistoryScreen(){

    saveState();

    renderHistoryScreen();

}

function historyEmptyState(){

    return `

    <div class="empty-state">

        <h3>

            📈 No History Yet

        </h3>

        <p>

            Save your first weekly snapshot to start tracking your progress.

        </p>

    </div>

    `;

}

function getHighestHistoryProgress(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return 0;

    }

    return Math.max(

        ...history.map(

            item=>item.progress

        )

    );

}

function getLowestHistoryProgress(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return 0;

    }

    return Math.min(

        ...history.map(

            item=>item.progress

        )

    );

}

function getAverageHistoryProgress(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return 0;

    }

    const total=history.reduce(

        (sum,item)=>

            sum+item.progress,

        0

    );

    return Math.round(

        total/history.length

    );

}

function getLatestHistory(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return null;

    }

    return history[history.length-1];

}

function getFirstHistory(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return null;

    }

    return history[0];

}

function hasHistory(){

    return getWeeklyHistory().length>0;

}

function getHistoryGrowth(){

    const history=getWeeklyHistory();

    if(history.length<2){

        return 0;

    }

    return (

        history[history.length-1].progress-

        history[0].progress

    );

}

function getHistoryTrend(){

    const growth=getHistoryGrowth();

    if(growth>0){

        return "up";

    }

    if(growth<0){

        return "down";

    }

    return "stable";

}

function getBestHistoryRecord(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return null;

    }

    return history.reduce(

        (best,item)=>

            item.progress>

            best.progress

                ?item

                :best

    );

}

function getWorstHistoryRecord(){

    const history=getWeeklyHistory();

    if(history.length===0){

        return null;

    }

    return history.reduce(

        (worst,item)=>

            item.progress<

            worst.progress

                ?item

                :worst

    );

}

function deleteHistoryRecord(index){

    if(

        index<0||

        index>=state.history.length

    ){

        return;

    }

    state.history.splice(

        index,

        1

    );

    saveState();

    renderHistoryScreen();

}

function clearAllHistory(){

    state.history=[];

    saveState();

    renderHistoryScreen();

}

function sortHistoryNewest(){

    state.history.sort(

        (a,b)=>

            new Date(b.date)-new Date(a.date)

    );

    saveState();

    renderHistoryScreen();

}

function sortHistoryOldest(){

    state.history.sort(

        (a,b)=>

            new Date(a.date)-new Date(b.date)

    );

    saveState();

    renderHistoryScreen();

}