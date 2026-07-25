// =======================================================
// router.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

console.log("router loaded");
console.log(typeof renderWelcomeScreen);
console.log(typeof renderDashboardScreen);

const routes = {

    welcome: () => renderWelcomeScreen(),

    dashboard: () => renderDashboardScreen(),

    subject: () => renderSubjectScreen(),

    mission: () => renderMissionScreen(),

    charts: () => renderChartsScreen(),

    settings: () => renderSettingsScreen(),

    history: () => renderHistoryScreen()


};

function navigate(screen){

    if(!routes[screen]){

        console.error(

            "Unknown Route:",

            screen

        );

        return;

    }

    state.currentScreen=screen;

    saveState();

    routes[screen]();

}

function initializeRouter(){

    if(!state.currentScreen){

        state.currentScreen="welcome";

    }

    navigate(

        state.currentScreen

    );

}

function backToDashboard(){

    navigate(

        "dashboard"

    );

}

function openSubject(subjectId){

    selectSubject(

        subjectId

    );

    navigate(

        "subject"

    );

}

function openMission(){

    navigate(

        "mission"

    );

}

function openCharts(){

    navigate(

        "charts"

    );

}

function openHistory(){

    navigate(

        "history"

    );

}

function openSettings(){

    navigate(

        "settings"

    );

}

function openWelcome(){

    navigate(

        "welcome"

    );

}

function refreshCurrentScreen(){

    if(

        routes[state.currentScreen]

    ){

        routes[

            state.currentScreen

        ]();

    }

}

function routeExists(name){

    return Boolean(

        routes[name]

    );

}

function getCurrentRoute(){

    return state.currentScreen;

}

/* ==========================================
   ROUTER HELPERS
========================================== */

function replaceRoute(screen){

    if(!routeExists(screen)){

        console.error(

            "Unknown Route:",

            screen

        );

        return;

    }

    state.currentScreen=screen;

    saveState();

    routes[screen]();

}

function goBack(){

    switch(state.currentScreen){

        case "subject":

            navigate("dashboard");
            break;

        case "mission":

            navigate("dashboard");
            break;

        case "charts":

            navigate("dashboard");
            break;

        case "history":

            navigate("dashboard");
            break;

        case "settings":

            navigate("dashboard");
            break;

        default:

            navigate("welcome");

    }

}

function resetNavigation(){

    state.currentScreen="welcome";

    saveState();

    navigate(

        "welcome"

    );

}

function isDashboard(){

    return state.currentScreen==="dashboard";

}

function isWelcome(){

    return state.currentScreen==="welcome";

}

function isSubject(){

    return state.currentScreen==="subject";

}

function isMission(){

    return state.currentScreen==="mission";

}

function isCharts(){

    return state.currentScreen==="charts";

}

function isHistory(){

    return state.currentScreen==="history";

}

function isSettings(){

    return state.currentScreen==="settings";

}

function safeNavigate(screen){

    if(

        !routeExists(screen)

    ){

        console.warn(

            "Attempted navigation to invalid route:",

            screen

        );

        return;

    }

    navigate(screen);

}

window.addEventListener(

    "load",

    ()=>{

        loadState();

        initializeRouter();

    }

);

window.addEventListener(

    "beforeunload",

    ()=>{

        saveState();

    }

);