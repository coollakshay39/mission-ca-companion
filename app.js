// =======================================================
// app.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeApp

);

async function initializeApp(){

    try{

        loadState();

        initializeSettings();

        initializeTheme();

        applyDynamicBackground();

        initializeHistory();

        registerServiceWorker();

        setupInstallPrompt();

        initializeRouter();

        startAutoSave();

        startHistoryTracking();

        console.log(

            "Mission CA Companion Ready"

        );

    }

    catch(error){

        console.error(

            "Initialization Failed",

            error

        );

    }

}

function initializeSettings(){

    if(!state.settings){

        state.settings={

            darkMode:true,

            animations:true,

            motivationalQuotes:true,

            autoSave:true,

            weeklyReminder:false,

            accentColor:"#4CAF50"

        };

    }

}

function initializeTheme(){

    if(

        state.settings.darkMode

    ){

        document.body.classList.add(

            "dark"

        );

    }

    else{

        document.body.classList.remove(

            "dark"

        );

    }

}

async function registerServiceWorker(){

    if(

        "serviceWorker" in navigator

    ){

        try{

            await navigator.serviceWorker.register(

                "./service-worker.js"

            );

            console.log(

                "Service Worker Registered"

            );

        }

        catch(error){

            console.error(

                error

            );

        }

    }

}

let deferredPrompt=null;

function setupInstallPrompt(){

    window.addEventListener(

        "beforeinstallprompt",

        event=>{

            event.preventDefault();

            deferredPrompt=event;

        }

    );

}

async function installApp(){

    if(

        !deferredPrompt

    ){

        return;

    }

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt=null;

}

function initializeHistory(){

    if(

        !state.history

    ){

        state.history=[];

    }

}

function startAutoSave(){

    if(

        !state.settings.autoSave

    ){

        return;

    }

    setInterval(

        ()=>{

            saveState();

        },

        30000

    );

}

function startHistoryTracking(){

    setInterval(

        ()=>{

            addWeeklyHistory();

        },

        1000*60*60*24*7

    );

}

// =======================================================
// app.js
// COMPLETE REPLACEMENT
// PART 2 / 2
// =======================================================

function toggleTheme(){

    state.settings.darkMode=

        !state.settings.darkMode;

    initializeTheme();

    saveState();

}

/*=========================================================
  DYNAMIC BACKGROUND
=========================================================*/

function applyDynamicBackground(){
    const hour=new Date().getHours();
    const themes={
        morning:[
            ["#fff8ee","#f1c5e6","#fff0b2","#b266b4"], ["#f8f5ff","#d9c9ff","#d8f3ff","#7451c8"], ["#fff8f5","#ffd6b9","#ffe9a9","#c87949"], ["#f3fbf8","#c6eee5","#daf0ff","#4f9c90"], ["#fffaf2","#f6dfb4","#ffe1d0","#b77b48"]
        ],
        afternoon:[
            ["#fff7fc","#ffcae3","#e8d5ff","#c85698"], ["#f7f8ff","#ccd9ff","#d7f5ff","#4e73c4"], ["#fff9f4","#ffd5a7","#ffeaba","#c47431"], ["#f5fff9","#bfead6","#d4f4ed","#3d9874"], ["#fff7f8","#ffd0d8","#ffe7bd","#c65f79"]
        ],
        evening:[
            ["#fff4f6","#f5bdcf","#f5d5b8","#b65373"], ["#f8f5ff","#cabef2","#f1cde1","#7658b7"], ["#fff7f0","#ffd3ae","#f7c5be","#bd694f"], ["#f6f3ff","#c6c1f4","#d9d4ff","#6354b7"], ["#fff4f3","#f2c2b8","#f6d0c9","#ae5c58"]
        ],
        night:[
            ["#f2efff","#bfb5ef","#d1c7ff","#6651b3"], ["#f5f0ff","#d5bde9","#c7d3ff","#7855b1"], ["#f0f4ff","#b8c9ef","#c5d9ff","#4e70ae"], ["#f6f0f7","#dcbfe1","#c9c1eb","#8c5f91"], ["#f1f4f9","#becbe0","#c7d4e8","#547491"]
        ]
    };
    const period=hour>=6&&hour<12?"morning":hour<17?"afternoon":hour<20?"evening":"night";
    const [background,washOne,washTwo,primary]=themes[period][Math.floor(Math.random()*5)];
    const root=document.documentElement.style;
    root.setProperty("--theme-bg",background);
    root.setProperty("--theme-wash-one",washOne);
    root.setProperty("--theme-wash-two",washTwo);
    root.setProperty("--primary",primary);
    root.setProperty("--primary-dark",primary);
    root.setProperty("--accent",primary);

}

function toggleAnimations(){

    state.settings.animations=

        !state.settings.animations;

    saveState();

}

function toggleQuotes(){

    state.settings.motivationalQuotes=

        !state.settings.motivationalQuotes;

    saveState();

}

function toggleAutoSave(){

    state.settings.autoSave=

        !state.settings.autoSave;

    saveState();

}

function exportBackup(){

    const data=JSON.stringify(

        state,

        null,

        2

    );

    const blob=new Blob(

        [data],

        {

            type:"application/json"

        }

    );

    const url=URL.createObjectURL(

        blob

    );

    const link=document.createElement(

        "a"

    );

    link.href=url;

    link.download=

        "mission-ca-backup.json";

    link.click();

    URL.revokeObjectURL(

        url

    );

}

function importBackup(file){

    const reader=new FileReader();

    reader.onload=event=>{

        try{

            state=JSON.parse(

                event.target.result

            );

            saveState();

            refreshCurrentScreen();

        }

        catch{

            alert(

                "Invalid backup file."

            );

        }

    };

    reader.readAsText(file);

}

function clearApplication(){

    if(

        !confirm(

            "Delete all saved progress?"

        )

    ){

        return;

    }

    clearState();

    saveState();

    navigate(

        "welcome"

    );

}

function resetWeeklyHistory(){

    if(

        !confirm(

            "Clear weekly history?"

        )

    ){

        return;

    }

    state.history=[];

    saveState();

}

function showToast(message){

    const toast=document.createElement(

        "div"

    );

    toast.className="toast";

    toast.textContent=message;

    document.body.appendChild(

        toast

    );

    setTimeout(

        ()=>{

            toast.classList.add(

                "show"

            );

        },

        50

    );

    setTimeout(

        ()=>{

            toast.remove();

        },

        2500

    );

}

function version(){

    return "1.0.0";

}

function appName(){

    return "Mission CA Companion";

}

function appSubtitle(){

    return "Small progress every day. Big results in November.";

}

window.onerror=function(

    message,

    source,

    line,

    column,

    error

){

    console.error(

        message,

        source,

        line,

        column,

        error

    );

};

console.log(

    `${appName()} ${version()} Loaded`

);
