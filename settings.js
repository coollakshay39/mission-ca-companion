// =======================================================
// settings.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

function renderSettingsScreen(){

    const app=document.getElementById("app");

    if(!state.settings){

        initializeSettings();

    }

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

                    Settings

                </h1>

                <p>

                    Customize your experience

                </p>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Appearance

            </h2>

            <div class="setting-row">

                <span>

                    🌙 Dark Mode

                </span>

                <label class="switch">

                    <input

                        id="darkMode"

                        type="checkbox"

                        ${state.settings.darkMode?"checked":""}

                    >

                    <span class="slider"></span>

                </label>

            </div>

            <div class="setting-row">

                <span>

                    ✨ Animations

                </span>

                <label class="switch">

                    <input

                        id="animations"

                        type="checkbox"

                        ${state.settings.animations?"checked":""}

                    >

                    <span class="slider"></span>

                </label>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Study

            </h2>

            <div class="setting-row">

                <span>

                    💬 Motivational Quotes

                </span>

                <label class="switch">

                    <input

                        id="quotes"

                        type="checkbox"

                        ${state.settings.motivationalQuotes?"checked":""}

                    >

                    <span class="slider"></span>

                </label>

            </div>

            <div class="setting-row">

                <span>

                    💾 Auto Save

                </span>

                <label class="switch">

                    <input

                        id="autosave"

                        type="checkbox"

                        ${state.settings.autoSave?"checked":""}

                    >

                    <span class="slider"></span>

                </label>

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Backup

            </h2>

            <div class="button-group">

                <button

                    id="exportBtn"

                    class="primary-btn"

                >

                    Export Backup

                </button>

                <label

                    class="primary-btn"

                    for="importFile"

                >

                    Import Backup

                </label>

                <input

                    id="importFile"

                    type="file"

                    accept=".json"

                    hidden

                >

            </div>

        </div>

        <div class="glass-card">

            <h2>

                Danger Zone

            </h2>

            <button

                id="clearData"

                class="danger-btn"

            >

                Delete All Progress

            </button>

            <button

                id="clearHistory"

                class="secondary-btn"

            >

                Clear Weekly History

            </button>

        </div>

        <div class="glass-card">

            <h2>

                About

            </h2>

            <p>

                <strong>

                    Mission CA Companion

                </strong>

            </p>

            <p>

                Version ${version()}

            </p>

            <p>

                Crafted by Lakshay Kothari

            </p>

        </div>

    </div>

    `;

    attachSettingsEvents();

}

function attachSettingsEvents(){

    document.getElementById(

        "dashboardBtn"

    ).onclick=()=>{

        navigate(

            "dashboard"

        );

    };

    document.getElementById(

        "darkMode"

    ).onchange=()=>{

        toggleTheme();

    };

    document.getElementById(

        "animations"

    ).onchange=()=>{

        toggleAnimations();

    };

    document.getElementById(

        "quotes"

    ).onchange=()=>{

        toggleQuotes();

    };

    document.getElementById(

        "autosave"

    ).onchange=()=>{

        toggleAutoSave();

    };

        document.getElementById(

        "exportBtn"

    ).onclick=()=>{

        exportBackup();

        showToast(

            "Backup exported successfully."

        );

    };

    document.getElementById(

        "importFile"

    ).onchange=(event)=>{

        const file=

            event.target.files[0];

        if(!file){

            return;

        }

        importBackup(file);

        showToast(

            "Backup imported."

        );

    };

    document.getElementById(

        "clearData"

    ).onclick=()=>{

        clearApplication();

    };

    document.getElementById(

        "clearHistory"

    ).onclick=()=>{

        resetWeeklyHistory();

        showToast(

            "Weekly history cleared."

        );

    };

}

/* ==========================================
   SETTINGS HELPERS
========================================== */

function refreshSettings(){

    saveState();

    renderSettingsScreen();

}

function updateAccentColor(color){

    state.settings.accentColor=color;

    document.documentElement.style.setProperty(

        "--accent-color",

        color

    );

    saveState();

}

function restoreDefaultSettings(){

    state.settings={

        darkMode:true,

        animations:true,

        motivationalQuotes:true,

        autoSave:true,

        weeklyReminder:false,

        accentColor:"#4CAF50"

    };

    initializeTheme();

    saveState();

    renderSettingsScreen();

}

function enableAllSettings(){

    state.settings.darkMode=true;

    state.settings.animations=true;

    state.settings.motivationalQuotes=true;

    state.settings.autoSave=true;

    saveState();

    initializeTheme();

    renderSettingsScreen();

}

function disableAnimations(){

    state.settings.animations=false;

    saveState();

}

function disableQuotes(){

    state.settings.motivationalQuotes=false;

    saveState();

}

function getSetting(name){

    return state.settings[name];

}

function setSetting(name,value){

    state.settings[name]=value;

    saveState();

}

function settingsVersion(){

    return "1.0";

}

function hasDarkMode(){

    return state.settings.darkMode;

}

function hasAnimations(){

    return state.settings.animations;

}

function hasQuotes(){

    return state.settings.motivationalQuotes;

}

function hasAutoSave(){

    return state.settings.autoSave;

}

function getAccentColor(){

    return state.settings.accentColor;

}