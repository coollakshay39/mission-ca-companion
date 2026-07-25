// storage.js

const STORAGE_KEY = "mission-ca-companion";

/* ==========================================
SAVE
========================================== */

function saveState(){

    try{

        calculateMissionProgress();

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(state)

        );

        return true;

    }

    catch(error){

        console.error(

            "Unable to save data.",

            error

        );

        return false;

    }

}

/* ==========================================
LOAD
========================================== */

function loadState(){

    const data=localStorage.getItem(STORAGE_KEY);

    if(!data){

        return false;

    }

    try{

        const saved=JSON.parse(data);

        state.currentScreen=saved.currentScreen??"welcome";

        state.selectedMissionId=saved.selectedMissionId??null;

        state.selectedPlanId=saved.selectedPlanId??null;

        state.selectedSubjectId=saved.selectedSubjectId??null;

        state.missions=saved.missions??[];

        state.todos=saved.todos??[];

        state.studyHours=saved.studyHours??[];

        if("settings" in state){

            state.settings=saved.settings??

                state.settings;

        }

        if("history" in state){

            state.history=saved.history??

                state.history;

        }

        return true;

    }

    catch(error){

        console.error(

            "Unable to load saved data.",

            error

        );

        clearState();

        return false;

    }

}

/* ==========================================
RESET
========================================== */

function resetStorage(){

    localStorage.removeItem(

        STORAGE_KEY

    );

    clearState();

}

/* ==========================================
EXPORT
========================================== */

function exportData(){

    calculateMissionProgress();

    return JSON.stringify(

        state,

        null,

        2

    );

}

/* ==========================================
IMPORT
========================================== */

function importData(json){

    try{

        const imported=JSON.parse(json);

        if(!imported.missions){

            throw new Error(

                "Invalid backup."

            );

        }

        state.currentScreen=

            imported.currentScreen??

            "welcome";

        state.selectedMissionId=

            imported.selectedMissionId??

            null;

        state.selectedPlanId=

            imported.selectedPlanId??

            null;

        state.selectedSubjectId=

            imported.selectedSubjectId??

            null;

        state.missions=

            imported.missions??

            [];

        state.todos=imported.todos??[];

        state.studyHours=imported.studyHours??[];

        if("settings" in state){

            state.settings=

                imported.settings??

                state.settings;

        }

        if("history" in state){

            state.history=

                imported.history??

                state.history;

        }

        saveState();

        return true;

    }

    catch(error){

        console.error(error);

        return false;

    }

}

/* ==========================================
AUTO SAVE
========================================== */

window.addEventListener(

    "beforeunload",

    saveState

);
