// =======================================================
// forms.js
// COMPLETE REPLACEMENT
// =======================================================

function getInputValue(id){

    const element=document.getElementById(id);

    if(!element){

        return "";

    }

    return element.value.trim();

}

function getNumberValue(id){

    const element=document.getElementById(id);

    if(!element){

        return 0;

    }

    const value=Number(element.value);

    return Number.isNaN(value)?0:value;

}

function clearInput(id){

    const element=document.getElementById(id);

    if(element){

        element.value="";

    }

}

function clearInputs(...ids){

    ids.forEach(clearInput);

}

function validateRequired(value,name){

    if(!value){

        alert(`${name} is required.`);

        return false;

    }

    return true;

}

function validateWeight(weight){

    if(

        Number.isNaN(weight)||
        weight<=0||
        weight>100

    ){

        alert(

            "Weight must be between 1 and 100."

        );

        return false;

    }

    return true;

}

function validateMissionName(){

    const name=getInputValue(

        "missionName"

    );

    return validateRequired(

        name,

        "Mission Name"

    );

}

function validatePlanName(){

    const name=getInputValue(

        "planName"

    );

    return validateRequired(

        name,

        "Study Plan"

    );

}

function validateSubjectForm(){

    const name=getInputValue(

        "subjectName"

    );

    const weight=getNumberValue(

        "subjectWeight"

    );

    return(

        validateRequired(

            name,

            "Subject"

        )&&

        validateWeight(

            weight

        )

    );

}

function validateChapterForm(){

    const name=getInputValue(

        "chapterName"

    );

    const weight=getNumberValue(

        "chapterWeight"

    );

    return(

        validateRequired(

            name,

            "Chapter"

        )&&

        validateWeight(

            weight

        )

    );

}

function resetSubjectForm(){

    clearInputs(

        "subjectName",

        "subjectWeight"

    );

}

function resetChapterForm(){

    clearInputs(

        "chapterName",

        "chapterWeight"

    );

}

function resetMissionForm(){

    clearInputs(

        "missionName",

        "planName"

    );

}

function focusInput(id){

    const input=document.getElementById(id);

    if(input){

        input.focus();

    }

}

function disableButton(id){

    const button=document.getElementById(id);

    if(button){

        button.disabled=true;

    }

}

function enableButton(id){

    const button=document.getElementById(id);

    if(button){

        button.disabled=false;

    }

}

function disableForm(){

    document

        .querySelectorAll(

            "input,button"

        )

        .forEach(element=>{

            element.disabled=true;

        });

}

function enableForm(){

    document

        .querySelectorAll(

            "input,button"

        )

        .forEach(element=>{

            element.disabled=false;

        });

}