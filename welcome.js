// Home screen — Mission CA Companion

let welcomeQuoteTimer = null;

function renderWelcomeScreen(){
    const app = document.getElementById("app");
    const mission = getMission();
    const overallProgress = getOverallProgress();

    app.innerHTML = `
        <main class="welcome-screen" aria-label="Mission CA home">
            <section class="welcome-top">
                <article class="welcome-hero glass-card">
                    <p class="eyebrow">YOUR STUDY SPACE</p>
                    <h1 class="welcome-title">${getGreeting()},<br><span>${getNickname()} <span aria-hidden="true">💛</span></span></h1>
                    <p class="welcome-quote">“${getRandomQuote()}”</p>
                </article>

                <article class="week-progress-card glass-card">
                    ${renderWeekProgressRing(overallProgress)}
                </article>

                ${renderMissionCard(mission)}
            </section>

            ${renderHomeUtilities()}
            ${renderMotivationGallery()}
            ${renderQuoteTicker()}
        </main>
    `;

    attachWelcomeEvents();
    startWelcomeQuoteRotation();
}

function renderHomeUtilities(){
    const todayHours=state.studyHours.find(item=>item.date===getDateKey())?.hours||0;
    return `
        <section class="home-utilities" aria-label="Study tools">
            <button class="home-tool-card" id="todoPlannerBtn" type="button">
                <span class="home-tool-icon">✓</span>
                <span><strong>To-do list</strong><small>${getOpenTodoCount()} open task${getOpenTodoCount()===1?"":"s"}</small></span>
                <b aria-hidden="true">→</b>
            </button>
            <button class="home-tool-card" id="hoursPlannerBtn" type="button">
                <span class="home-tool-icon">◷</span>
                <span><strong>Study hours</strong><small>${todayHours} h today · ${getWeekStudyHours()} h this week</small></span>
                <b aria-hidden="true">→</b>
            </button>
        </section>
    `;
}

/* A weekly completion measure based on chapters checked off in the last 7 days. */
function getCurrentWeekProgress(){
    const plan = getPlan();
    if(!plan) return 0;

    const weekStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
    let totalWeight = 0;
    let completedWeight = 0;

    plan.subjects.forEach(subject => {
        subject.chapters.forEach(chapter => {
            const weight = Number(chapter.weight) || 0;
            totalWeight += weight;
            if(chapter.completed && chapter.completedOn && chapter.completedOn >= weekStart){
                completedWeight += weight;
            }
        });
    });

    return totalWeight ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

function getOverallProgress(){
    if(!state.missions.length) return 0;

    const total=state.missions.reduce((sum,mission)=>{
        const missionProgress=mission.plans.length
            ? Math.round(mission.plans.reduce((planTotal,plan)=>planTotal+calculatePlanProgress(plan),0)/mission.plans.length)
            : 0;
        mission.progress=missionProgress;
        return sum+missionProgress;
    },0);

    return Math.round(total/state.missions.length);
}

function renderWeekProgressRing(progress){
    const radius = 104;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((Math.min(progress, 100) / 100) * circumference);

    return `
        <div class="week-ring-wrapper">
            <svg class="week-ring" width="260" height="260" viewBox="0 0 260 260" aria-label="${progress}% overall progress">
                <circle class="week-ring-bg" cx="130" cy="130" r="${radius}"></circle>
                <circle class="week-ring-progress" cx="130" cy="130" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
            </svg>
            <div class="week-ring-center"><strong>${progress}%</strong><span>Overall Progress</span></div>
        </div>
        <div class="mission-brand">
            <h2>Mission CA Nov 2026</h2>
            <p><span aria-hidden="true">♥</span> Sej's CA Companion <span aria-hidden="true">♥</span></p>
            <small>crafted by Lakshay Kothari</small>
        </div>
    `;
}

function renderMissionCard(mission){
    if(!mission){
        return `
            <article class="glass-card mission-card mission-card--setup">
                <p class="eyebrow">BEGIN YOUR JOURNEY</p>
                <h2>Create your mission</h2>
                <p>Give your CA Final preparation a home.</p>
                <label class="sr-only" for="missionName">Mission name</label>
                <input id="missionName" class="text-input" placeholder="Mission CA Nov 2026" autocomplete="off">
                <button id="createMissionBtn" class="primary-btn">Create Mission <span aria-hidden="true">→</span></button>
            </article>
        `;
    }

    return `
        <article class="glass-card mission-card">
            <p class="eyebrow">YOUR MISSION</p>
            <h2>${escapeHtml(mission.name)}</h2>
            <p class="mission-description">Weekly Progress</p>
            <strong class="mission-percentage">${mission.progress}%</strong>
            <div class="progress-bar" aria-label="${mission.progress}% mission progress"><div class="progress-fill" style="width:${mission.progress}%"></div></div>
            ${renderMissionSwitcher(mission)}
            <button id="openMissionBtn" class="primary-btn">Continue Mission <span aria-hidden="true">→</span></button>
            <button id="newMissionBtn" class="mission-add-btn" type="button">＋ New Mission</button>
        </article>
    `;
}

function renderMissionSwitcher(mission){
    if(state.missions.length<2) return "";
    return `
        <label class="mission-switcher-label" for="missionSwitcher">Viewing mission</label>
        <select id="missionSwitcher" class="mission-switcher">
            ${state.missions.map(item=>`<option value="${item.id}" ${item.id===mission.id?"selected":""}>${escapeHtml(item.name)}</option>`).join("")}
        </select>
    `;
}

function renderMotivationGallery(){
    const images = shuffleImages([
        "assets/motivation/shant-girl.jpeg",
        "assets/motivation/hello-kitty.jpeg",
        "assets/motivation/calculator-cat.jpeg",
        "assets/motivation/cat-study.jpeg",
        "assets/motivation/degree-girl.jpeg"
    ]);

    return `
        <section class="motivation-section">
            <h2 class="motivation-heading">You've got this, Sej! <span aria-hidden="true">✨</span></h2>
            <div class="motivation-strip">
                ${images.map((image, index) => `
                    <figure class="motivation-image-card">
                        <img src="${image}" draggable="false" loading="${index > 1 ? "lazy" : "eager"}" alt="Study motivation ${index + 1}">
                    </figure>
                `).join("")}
            </div>
        </section>
    `;
}

function shuffleImages(images){
    const shuffled=[...images];
    for(let index=shuffled.length-1;index>0;index--){
        const swapIndex=Math.floor(Math.random()*(index+1));
        [shuffled[index],shuffled[swapIndex]]=[shuffled[swapIndex],shuffled[index]];
    }
    return shuffled;
}

function renderQuoteTicker(){
    return `<p class="welcome-ticker" id="welcomeTicker"><span aria-hidden="true">★</span> ${getRandomQuote()} <span aria-hidden="true">★</span></p>`;
}

function startWelcomeQuoteRotation(){
    clearInterval(welcomeQuoteTimer);
    if(state.settings && state.settings.motivationalQuotes === false) return;

    welcomeQuoteTimer = setInterval(() => {
        const ticker = document.getElementById("welcomeTicker");
        if(!ticker) return;
        ticker.classList.add("is-changing");
        setTimeout(() => {
            ticker.innerHTML = `<span aria-hidden="true">★</span> ${getRandomQuote()} <span aria-hidden="true">★</span>`;
            ticker.classList.remove("is-changing");
        }, 180);
    }, 5000);
}

function attachWelcomeEvents(){
    const createMissionBtn = document.getElementById("createMissionBtn");
    if(createMissionBtn){
        createMissionBtn.onclick = () => {
            const input = document.getElementById("missionName");
            const name = input.value.trim();
            if(!name){
                input.focus();
                showToast("Give your mission a name to begin.");
                return;
            }
            createMission(name);
            // A first plan is required by the existing subject and dashboard flows.
            createPlan("CA Final Study Plan");
            saveState();
            renderWelcomeScreen();
        };
    }

    const openMissionBtn = document.getElementById("openMissionBtn");
    if(openMissionBtn){
        openMissionBtn.onclick = () => navigate(getPlan() ? "dashboard" : "mission");
    }

    const missionSwitcher=document.getElementById("missionSwitcher");
    if(missionSwitcher){
        missionSwitcher.onchange=()=>{
            selectMission(missionSwitcher.value);
            const nextMission=getMission();
            selectPlan(nextMission.plans[0]?.id || null);
            saveState();
            renderWelcomeScreen();
        };
    }

    const newMissionBtn=document.getElementById("newMissionBtn");
    if(newMissionBtn){
        newMissionBtn.onclick=()=>{
            showEditDialog({
                title:"Create a new mission",
                label:"Mission name",
                onSave:name=>{
                    createMission(name);
                    createPlan("CA Final Study Plan");
                    saveState();
                    renderWelcomeScreen();
                }
            });
        };
    }

    const todoPlannerBtn=document.getElementById("todoPlannerBtn");
    if(todoPlannerBtn) todoPlannerBtn.onclick=openTodoPlanner;

    const hoursPlannerBtn=document.getElementById("hoursPlannerBtn");
    if(hoursPlannerBtn) hoursPlannerBtn.onclick=openHoursPlanner;
}

function getGreeting(){
    const hour = new Date().getHours();
    if(hour < 12) return "Good Morning";
    if(hour < 17) return "Good Afternoon";
    return "Good Evening";
}

function getNickname(){ return "Sej"; }

function renderEmptyMission(){
    return `<section class="glass-card"><h2>Welcome 💛</h2><p>Create your mission and begin your CA journey.</p></section>`;
}
