// state.js (Part 1/2)
//
// Replace your existing state.js completely.
// Part 2 will continue immediately after the last line below.

// ==========================================
// Mission CA Companion
// ==========================================

const state={
    currentScreen:"welcome",
    selectedMissionId:null,
    selectedPlanId:null,
    selectedSubjectId:null,
    missions:[],
    todos:[],
    studyHours:[],
    settings:{

    darkMode:false,

    animations:true,

    quoteRotation:true,

    history:[]

}
};

// ==========================================
// Generic Helpers
// ==========================================

function uuid(){
    return crypto.randomUUID();
}

function number(value){
    const n=Number(value);
    return Number.isFinite(n)?n:0;
}

function text(value){
    return String(value??"").trim();
}

function getMission(id=state.selectedMissionId){
    return state.missions.find(
        mission=>mission.id===id
    )||null;
}

function getPlan(id=state.selectedPlanId){
    const mission=getMission();
    if(!mission) return null;

    return mission.plans.find(
        plan=>plan.id===id
    )||null;
}

function getSubject(id=state.selectedSubjectId){
    const plan=getPlan();
    if(!plan) return null;

    return plan.subjects.find(
        subject=>subject.id===id
    )||null;
}

function getChapter(chapterId){

    const plan=getPlan();

    if(!plan) return null;

    for(const subject of plan.subjects){

        const chapter=subject.chapters.find(
            chapter=>chapter.id===chapterId
        );

        if(chapter) return chapter;

    }

    return null;

}

// ==========================================
// Selection
// ==========================================

function selectMission(id){

    state.selectedMissionId=id;
    state.selectedPlanId=null;
    state.selectedSubjectId=null;

}

function selectPlan(id){

    state.selectedPlanId=id;
    state.selectedSubjectId=null;

}

function selectSubject(id){

    state.selectedSubjectId=id;

}

// ==========================================
// Exists
// ==========================================

function hasMission(){

    return state.missions.length>0;

}

function hasPlans(){

    const mission=getMission();

    return !!(mission&&mission.plans.length);

}

function hasSubjects(){

    const plan=getPlan();

    return !!(plan&&plan.subjects.length);

}

// ==========================================
// Factory Objects
// ==========================================

function newMission(name){

    return{

        id:uuid(),

        name:text(name),

        progress:0,

        createdOn:Date.now(),

        plans:[]

    };

}

function newPlan(name){

    return{

        id:uuid(),

        name:text(name),

        progress:0,

        createdOn:Date.now(),

        subjects:[]

    };

}

function newSubject(name="",weight=0){

    return{

        id:uuid(),

        name:text(name),

        weight:number(weight),

        progress:0,

        chapters:[]

    };

}

function newChapter(name="",weight=0){

    return{

    id:uuid(),

    name:text(name),

    weight:number(weight),

    completed:false,

    completedOn:null,

    notes:""

    };

}

// ==========================================
// Mission CRUD
// ==========================================

function createMission(name){

    const mission=newMission(name);

    state.missions.push(mission);

    state.selectedMissionId=mission.id;

    state.selectedPlanId=null;

    state.selectedSubjectId=null;

    saveState();

    return mission;

}

function renameMission(name){

    const mission=getMission();

    if(!mission) return;

    mission.name=text(name);

    saveState();

}

function deleteMission(id){

    state.missions=state.missions.filter(

        mission=>mission.id!==id

    );

    if(state.selectedMissionId===id){

        state.selectedMissionId=null;
        state.selectedPlanId=null;
        state.selectedSubjectId=null;

    }

    saveState();

}

function duplicateMission(id){

    const mission=getMission(id);

    if(!mission) return null;

    const copy=structuredClone(mission);

    copy.id=uuid();

    copy.name+=" Copy";

    copy.createdOn=Date.now();

    state.missions.push(copy);

    saveState();

    return copy;

}

// ==========================================
// Plan CRUD
// ==========================================

function createPlan(name){

    const mission=getMission();

    if(!mission) return null;

    const plan=newPlan(name);

    mission.plans.push(plan);

    state.selectedPlanId=plan.id;

    state.selectedSubjectId=null;

    saveState();

    return plan;

}

function renamePlan(id,name){

    const plan=getPlan(id);

    if(!plan) return;

    plan.name=text(name);

    saveState();

}

function deletePlan(id){

    const mission=getMission();

    if(!mission) return;

    mission.plans=mission.plans.filter(

        plan=>plan.id!==id

    );

    if(state.selectedPlanId===id){

        state.selectedPlanId=null;
        state.selectedSubjectId=null;

    }

    saveState();

}

function duplicatePlan(id){

    const mission=getMission();

    if(!mission) return null;

    const plan=getPlan(id);

    if(!plan) return null;

    const copy=structuredClone(plan);

    copy.id=uuid();

    copy.name+=" Copy";

    copy.createdOn=Date.now();

    mission.plans.push(copy);

    saveState();

    return copy;

}

// ==========================================
// Subject CRUD
// ==========================================

function addSubject(name="",weight=0){

    const plan=getPlan();

    if(!plan) return;

    plan.subjects.push(

        newSubject(name,weight)

    );

    saveState();

}

function renameSubject(id,name){

    const subject=getSubject(id);

    if(!subject) return;

    subject.name=text(name);

    saveState();

}

function updateSubjectWeight(id,weight){

    const subject=getSubject(id);

    if(!subject) return;

    subject.weight=number(weight);

    calculateMissionProgress();

    saveState();

}

function deleteSubject(id){

    const plan=getPlan();

    if(!plan) return;

    plan.subjects=plan.subjects.filter(

        subject=>subject.id!==id

    );

    if(state.selectedSubjectId===id){

        state.selectedSubjectId=null;

    }

    calculateMissionProgress();

    saveState();

}

function getTotalSubjectWeight(){

    const plan=getPlan();

    if(!plan) return 0;

    return plan.subjects.reduce(

        (total,subject)=>total+number(subject.weight),

        0

    );

}

// ==========================================
// Chapter CRUD
// ==========================================

function addChapter(subjectId,name="",weight=0){

    const subject=getSubject(subjectId);

    if(!subject) return;

    subject.chapters.push(

        newChapter(name,weight)

    );

    calculateMissionProgress();

    saveState();

}

function renameChapter(chapterId,name){

    const chapter=getChapter(chapterId);

    if(!chapter) return;

    chapter.name=text(name);

    saveState();

}

function updateChapterWeight(chapterId,weight){

    const chapter=getChapter(chapterId);

    if(!chapter) return;

    chapter.weight=number(weight);

    calculateMissionProgress();

    saveState();

}

function toggleChapterComplete(chapterId){

    const chapter=getChapter(chapterId);

    if(!chapter) return;

    chapter.completed=!chapter.completed;

chapter.completedOn=

    chapter.completed

        ? Date.now()

        : null;

    calculateMissionProgress();

    saveState();

}

function deleteChapter(chapterId){

    const plan=getPlan();

    if(!plan) return;

    for(const subject of plan.subjects){

        subject.chapters=subject.chapters.filter(

            chapter=>chapter.id!==chapterId

        );

    }

    calculateMissionProgress();

    saveState();

}

// ==========================================
// Counts
// ==========================================

function getMissionCount(){

    return state.missions.length;

}

function getPlanCount(){

    const mission=getMission();

    return mission?mission.plans.length:0;

}

function getSubjectCount(){

    const plan=getPlan();

    return plan?plan.subjects.length:0;

}

function getChapterCount(subjectId){

    const subject=getSubject(subjectId);

    return subject?subject.chapters.length:0;

}

function getCompletedChapterCount(subjectId){

    const subject=getSubject(subjectId);

    if(!subject) return 0;

    return subject.chapters.filter(

        chapter=>chapter.completed

    ).length;

}

function getOverallChapterCount(){

    const plan=getPlan();

    if(!plan) return 0;

    let total=0;

    for(const subject of plan.subjects){

        total+=subject.chapters.length;

    }

    return total;

}

function getCompletedOverallChapterCount(){

    const plan=getPlan();

    if(!plan) return 0;

    let total=0;

    for(const subject of plan.subjects){

        total+=subject.chapters.filter(

            chapter=>chapter.completed

        ).length;

    }

    return total;

}

// ==========================================
// Progress
// ==========================================

function calculateSubjectProgress(subject){

    if(!subject){

        return 0;

    }

    if(subject.chapters.length===0){

        subject.progress=0;

        return 0;

    }

    const totalWeight=subject.chapters.reduce(

        (sum,chapter)=>sum+number(chapter.weight),

        0

    );

    if(totalWeight===0){

        subject.progress=0;

        return 0;

    }

    const completedWeight=subject.chapters.reduce(

        (sum,chapter)=>{

            if(chapter.completed){

                return sum+number(chapter.weight);

            }

            return sum;

        },

        0

    );

    subject.progress=Math.round(

        completedWeight*100/totalWeight

    );

    return subject.progress;

}

function calculatePlanProgress(plan){

    if(!plan){

        return 0;

    }

    let progress=0;

    plan.subjects.forEach(subject=>{

        calculateSubjectProgress(subject);

        progress+=(

            number(subject.weight)*subject.progress

        )/100;

    });

    plan.progress=Math.round(progress);

    return plan.progress;

}

function calculateMissionProgress(){

    const mission=getMission();

    if(!mission){

        return 0;

    }

    if(mission.plans.length===0){

        mission.progress=0;

        return 0;

    }

    let total=0;

    mission.plans.forEach(plan=>{

        total+=calculatePlanProgress(plan);

    });

    mission.progress=Math.round(

        total/mission.plans.length

    );

    return mission.progress;

}

// ==========================================
// Reset
// ==========================================

function resetMission(){

    const mission=getMission();

    if(!mission) return;

    mission.plans.forEach(plan=>{

        plan.subjects.forEach(subject=>{

            subject.progress=0;

            subject.chapters.forEach(chapter=>{

                chapter.completed=false;

                chapter.completedOn=null;

            });

        });

        plan.progress=0;

    });

    mission.progress=0;

    saveState();

}

function clearState(){

    state.currentScreen="welcome";

    state.selectedMissionId=null;

    state.selectedPlanId=null;

    state.selectedSubjectId=null;

    state.missions=[];

    state.todos=[];

    state.studyHours=[];

    saveState();

}

// ==========================================
// Getters
// ==========================================

function getMissionProgress(){

    const mission=getMission();

    return mission?mission.progress:0;

}

function getPlanProgress(){

    const plan=getPlan();

    return plan?plan.progress:0;

}

function getSubjectProgress(){

    const subject=getSubject();

    return subject?subject.progress:0;

}

// ==========================================
// Home planner — persisted with the mission data
// ==========================================

function addTodo(title,timeframe="next-week"){
    const task=text(title);
    if(!task) return null;

    const todo={
        id:uuid(),
        title:task,
        timeframe,
        completed:false,
        createdOn:Date.now()
    };

    state.todos.push(todo);
    saveState();
    return todo;
}

function toggleTodo(todoId){
    const todo=state.todos.find(item=>item.id===todoId);
    if(!todo) return;
    todo.completed=!todo.completed;
    saveState();
}

function deleteTodo(todoId){
    state.todos=state.todos.filter(item=>item.id!==todoId);
    saveState();
}

function getOpenTodoCount(){
    return state.todos.filter(item=>!item.completed).length;
}

function getDateKey(date=new Date()){
    const local=new Date(date);
    return `${local.getFullYear()}-${String(local.getMonth()+1).padStart(2,"0")}-${String(local.getDate()).padStart(2,"0")}`;
}

function getWeekRange(offset=0){
    const date=new Date();
    date.setHours(12,0,0,0);
    date.setDate(date.getDate()-((date.getDay()+6)%7)+(offset*7));
    const start=getDateKey(date);
    date.setDate(date.getDate()+6);
    return {start,end:getDateKey(date)};
}

function addStudyHours(hours,dateKey=getDateKey()){
    const amount=number(hours);
    if(amount<=0) return false;

    const entry=state.studyHours.find(item=>item.date===dateKey);
    if(entry) entry.hours=Math.round((number(entry.hours)+amount)*100)/100;
    else state.studyHours.push({id:uuid(),date:dateKey,hours:amount});

    saveState();
    return true;
}

function getStudyHoursForWeek(offset=0){
    const range=getWeekRange(offset);
    return state.studyHours
        .filter(item=>item.date>=range.start&&item.date<=range.end)
        .sort((a,b)=>a.date.localeCompare(b.date));
}

function getWeekStudyHours(offset=0){
    return Math.round(getStudyHoursForWeek(offset).reduce((sum,item)=>sum+number(item.hours),0)*100)/100;
}
