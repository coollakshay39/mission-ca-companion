// Home tools: a lightweight notepad and daily study-hours journal.

function openTodoPlanner(){
    const backdrop=createPlannerBackdrop("todo-planner");
    document.body.appendChild(backdrop);
    renderTodoPlanner(backdrop);
}

function renderTodoPlanner(backdrop){
    const openTasks=state.todos.filter(todo=>!todo.completed);
    const completedTasks=state.todos.filter(todo=>todo.completed);
    const weekDates=getTodoWeekDates();
    const today=getDateKey();
    const unscheduledTasks=openTasks.filter(todo=>!todo.scheduledDate);

    backdrop.innerHTML=`
        <section class="planner-dialog" role="dialog" aria-modal="true" aria-labelledby="todoPlannerTitle">
            <button class="planner-close" type="button" aria-label="Close">×</button>
            <p class="eyebrow">YOUR NOTEPAD</p>
            <h2 id="todoPlannerTitle">Next steps</h2>
            <p class="planner-subtitle">Keep the small things out of your head and in one calm place.</p>
            <div class="planner-add-row todo-add-row">
                <input id="todoInput" class="text-input" placeholder="Add something to do…" autocomplete="off">
                <input id="todoEstimatedHours" class="text-input" type="number" min="0" step="0.25" placeholder="Est. hours" aria-label="Estimated hours">
                <select id="todoDate" class="planner-select" aria-label="Schedule for">
                    ${weekDates.map(day=>`<option value="${day.date}" ${day.date===today?"selected":""}>${day.fullLabel}</option>`).join("")}
                </select>
                <button id="addTodoBtn" class="primary-btn" type="button">Add</button>
            </div>
            <div class="todo-week-scroll" aria-label="Weekly to-do list">
                <div class="todo-week-board">
                    ${weekDates.map(day=>renderTodoDay(day,today)).join("")}
                </div>
            </div>
            ${unscheduledTasks.length?`<section class="todo-unscheduled"><h3>Unscheduled</h3><div class="todo-list">${unscheduledTasks.map(renderTodo).join("")}</div></section>`:""}
            ${completedTasks.length?`<details class="completed-todos"><summary>${completedTasks.length} completed</summary><div class="todo-list">${completedTasks.map(renderTodo).join("")}</div></details>`:""}
        </section>
    `;

    bindPlannerClose(backdrop);
    const input=backdrop.querySelector("#todoInput");
    const estimatedInput=backdrop.querySelector("#todoEstimatedHours");
    const dateInput=backdrop.querySelector("#todoDate");
    const add=()=>{
        const todo=addTodo(input.value,estimatedInput.value,dateInput.value);
        if(!todo){ input.focus(); return; }
        renderTodoPlanner(backdrop);
    };
    backdrop.querySelector("#addTodoBtn").onclick=add;
    input.onkeydown=event=>{ if(event.key==="Enter") add(); };
    backdrop.querySelectorAll(".todo-toggle").forEach(button=>{
        button.onclick=()=>{ toggleTodo(button.dataset.id); renderTodoPlanner(backdrop); renderWelcomeScreen(); };
    });
    backdrop.querySelectorAll(".todo-delete").forEach(button=>{
        button.onclick=()=>{ deleteTodo(button.dataset.id); renderTodoPlanner(backdrop); renderWelcomeScreen(); };
    });
    backdrop.querySelectorAll(".todo-hours-input").forEach(input=>{
        input.onchange=()=>{
            updateTodoHours(input.dataset.id,input.dataset.field,input.value);
            renderTodoPlanner(backdrop);
        };
    });
    requestAnimationFrame(()=>{ backdrop.classList.add("is-open"); input.focus(); });
}

function getTodoWeekDates(){
    const today=new Date();
    const start=new Date(today.getFullYear(),today.getMonth(),today.getDate());
    const mondayOffset=(start.getDay()+6)%7;
    start.setDate(start.getDate()-mondayOffset);
    return Array.from({length:7},(_,index)=>{
        const date=new Date(start);
        date.setDate(start.getDate()+index);
        const dateKey=getDateKey(date);
        return {
            date:dateKey,
            label:date.toLocaleDateString("en-IN",{weekday:"short"}),
            fullLabel:date.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"}),
            dateLabel:date.toLocaleDateString("en-IN",{day:"numeric",month:"short"})
        };
    });
}

function renderTodoDay(day,today){
    const tasks=getTodosForDate(day.date);
    return `<section class="todo-day-column ${day.date===today?"is-today":""}">
        <h3 class="todo-day-heading">${day.label}<small>${day.dateLabel}${day.date===today?" · Today":""}</small></h3>
        ${tasks.length?tasks.map(renderTodo).join(""):`<p class="todo-day-empty">Nothing planned</p>`}
    </section>`;
}

function openChapterSchedulePlanner(chapter){
    const backdrop=createPlannerBackdrop("schedule-planner");
    const weekDates=getTodoWeekDates();
    backdrop.innerHTML=`
        <section class="planner-dialog schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="scheduleChapterTitle">
            <button class="planner-close" type="button" aria-label="Close">×</button>
            <p class="eyebrow">ADD TO YOUR WEEK</p>
            <h2 id="scheduleChapterTitle">${escapeHtml(chapter.name)}</h2>
            <p class="planner-subtitle">Choose the day you want to work on this chapter.</p>
            <div class="schedule-options">
                ${weekDates.map(day=>`<button class="schedule-day-btn" data-date="${day.date}" type="button"><strong>${day.label}</strong><span>${day.dateLabel}</span></button>`).join("")}
            </div>
        </section>`;
    document.body.appendChild(backdrop);
    bindPlannerClose(backdrop);
    backdrop.querySelectorAll(".schedule-day-btn").forEach(button=>{
        button.onclick=()=>{
            addTodo(chapter.name,"",button.dataset.date,chapter.id);
            backdrop.remove();
            showToast(`${chapter.name} added to your to-do list.`);
            if(isWelcome()) renderWelcomeScreen();
        };
    });
    requestAnimationFrame(()=>backdrop.classList.add("is-open"));
}

function renderTodo(todo){
    const estimated=number(todo.estimatedHours);
    const actual=todo.actualHours===null||todo.actualHours===undefined?null:number(todo.actualHours);
    const difference=actual===null||!estimated?"":actual-estimated;
    const comparison=difference===""?"":difference===0?"On estimate":difference<0?`${Math.abs(difference)}h saved`:`${difference}h over`;
    return `<article class="todo-item ${todo.completed?"is-complete":""}">
        <button class="todo-toggle" data-id="${todo.id}" type="button" aria-label="Mark ${escapeHtml(todo.title)} ${todo.completed?"incomplete":"complete"}">${todo.completed?"✓":""}</button>
        <div class="todo-content"><strong>${escapeHtml(todo.title)}</strong>
            <div class="todo-hours">
                <label>Est.<input class="todo-hours-input" data-id="${todo.id}" data-field="estimatedHours" type="number" min="0" step="0.25" value="${estimated||""}" placeholder="hrs"></label>
                <label>Actual<input class="todo-hours-input" data-id="${todo.id}" data-field="actualHours" type="number" min="0" step="0.25" value="${actual===null?"":actual}" placeholder="hrs"></label>
                ${comparison?`<span class="todo-comparison ${difference>0?"is-over":"is-saved"}">${comparison}</span>`:""}
            </div>
        </div>
        <button class="todo-delete" data-id="${todo.id}" type="button" aria-label="Delete ${escapeHtml(todo.title)}">×</button>
    </article>`;
}

function openHoursPlanner(){
    const backdrop=createPlannerBackdrop("hours-planner");
    backdrop.dataset.weekOffset="0";
    backdrop.dataset.selectedDate=getDateKey();
    backdrop.dataset.calendarMonth=getDateKey().slice(0,7);
    document.body.appendChild(backdrop);
    renderHoursPlanner(backdrop);
}

function renderHoursPlanner(backdrop){
    const offset=Number(backdrop.dataset.weekOffset||0);
    const range=getWeekRange(offset);
    const entries=getStudyHoursForWeek(offset);
    const isCurrentWeek=offset===0;
    const selectedDate=getHoursPlannerSelectedDate(backdrop,range,isCurrentWeek);
    const selectedHours=getStudyHoursForDate(selectedDate);

    backdrop.innerHTML=`
        <section class="planner-dialog" role="dialog" aria-modal="true" aria-labelledby="hoursPlannerTitle">
            <button class="planner-close" type="button" aria-label="Close">×</button>
            <p class="eyebrow">STUDY JOURNAL</p>
            <h2 id="hoursPlannerTitle">Study hours</h2>
            <div class="hours-total"><div><strong>${getWeekStudyHours(offset)}</strong><span>hours this week</span></div><div><strong>${formatHoursAndMinutes(getWeekStudyAverage(offset))}</strong><span>average / logged day</span></div></div>
            <div class="week-nav">
                <button id="previousWeekBtn" class="secondary-btn" type="button">← Previous</button>
                <span>${formatWeekRange(range)}</span>
                <button id="nextWeekBtn" class="secondary-btn" type="button" ${isCurrentWeek?"disabled":""}>Next →</button>
            </div>
            <p class="hours-editor-note">Choose any day in this week. Saving replaces that day’s total; use 0 to clear it.</p>
            <div class="planner-add-row hours-add-row">
                <input id="hoursDate" class="text-input" type="date" value="${selectedDate}" max="${getDateKey()}">
                <input id="hoursInput" class="text-input" type="number" min="0" step="0.25" value="${selectedHours||""}" placeholder="Hours studied">
                <button id="saveHoursBtn" class="primary-btn" type="button">Save hours</button>
            </div>
            ${renderHoursCalendar(backdrop.dataset.calendarMonth,selectedDate)}
            <div class="hours-list">
                ${entries.length?entries.map(entry=>`<article class="hours-item"><span>${formatEntryDate(entry.date)}</span><strong>${entry.hours} h</strong><button class="hours-edit secondary-btn" data-date="${entry.date}" type="button">Edit</button></article>`).join(""):`<p class="planner-empty">${isCurrentWeek?"No study hours logged this week yet.":"No study hours were logged this week."}</p>`}
            </div>
        </section>
    `;

    bindPlannerClose(backdrop);
    backdrop.querySelector("#previousWeekBtn").onclick=()=>{
        backdrop.dataset.weekOffset=String(offset-1);
        backdrop.dataset.selectedDate=getWeekRange(offset-1).end;
        renderHoursPlanner(backdrop);
    };
    const next=backdrop.querySelector("#nextWeekBtn");
    if(next&&!isCurrentWeek) next.onclick=()=>{
        const nextOffset=offset+1;
        backdrop.dataset.weekOffset=String(nextOffset);
        backdrop.dataset.selectedDate=nextOffset===0?getDateKey():getWeekRange(nextOffset).end;
        renderHoursPlanner(backdrop);
    };

    const dateInput=backdrop.querySelector("#hoursDate");
    const hoursInput=backdrop.querySelector("#hoursInput");
    dateInput.onchange=()=>{
        backdrop.dataset.selectedDate=dateInput.value;
        renderHoursPlanner(backdrop);
    };

    const saveButton=backdrop.querySelector("#saveHoursBtn");
    if(saveButton){
        const save=()=>{
            if(!setStudyHours(hoursInput.value,dateInput.value)){ hoursInput.focus(); return; }
            renderHoursPlanner(backdrop);
            renderWelcomeScreen();
        };
        saveButton.onclick=save;
        hoursInput.onkeydown=event=>{ if(event.key==="Enter") save(); };
    }
    backdrop.querySelectorAll(".hours-edit").forEach(button=>{
        button.onclick=()=>{
            backdrop.dataset.selectedDate=button.dataset.date;
            renderHoursPlanner(backdrop);
        };
    });
    backdrop.querySelector("#calendarPreviousBtn").onclick=()=>{
        backdrop.dataset.calendarMonth=shiftCalendarMonth(backdrop.dataset.calendarMonth,-1);
        renderHoursPlanner(backdrop);
    };
    const calendarNext=backdrop.querySelector("#calendarNextBtn");
    if(calendarNext) calendarNext.onclick=()=>{
        backdrop.dataset.calendarMonth=shiftCalendarMonth(backdrop.dataset.calendarMonth,1);
        renderHoursPlanner(backdrop);
    };
    backdrop.querySelectorAll(".hours-calendar-day:not(:disabled)").forEach(button=>{
        button.onclick=()=>{
            backdrop.dataset.selectedDate=button.dataset.date;
            renderHoursPlanner(backdrop);
        };
    });
    requestAnimationFrame(()=>backdrop.classList.add("is-open"));
}

function renderHoursCalendar(monthKey,selectedDate){
    const [year,month]=monthKey.split("-").map(Number);
    const firstDay=new Date(year,month-1,1);
    const daysInMonth=new Date(year,month,0).getDate();
    const startOffset=firstDay.getDay();
    const today=getDateKey();
    const cells=[];
    for(let index=0;index<startOffset;index++) cells.push('<span class="hours-calendar-blank"></span>');
    for(let day=1;day<=daysInMonth;day++){
        const dateKey=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const hours=getStudyHoursForDate(dateKey);
        const future=dateKey>today;
        const status=getHoursColorClass(hours);
        cells.push(`<button class="hours-calendar-day ${status} ${dateKey===selectedDate?"is-selected":""}" data-date="${dateKey}" type="button" ${future?"disabled":""} aria-label="${formatEntryDate(dateKey)}${hours?`, ${hours} hours`:""}"><span>${day}</span>${hours?`<b>${hours}h</b>`:""}</button>`);
    }
    const monthLabel=firstDay.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    const canMoveForward=shiftCalendarMonth(monthKey,1)<=today.slice(0,7);
    return `<section class="hours-calendar" aria-label="Study hours calendar">
        <div class="hours-calendar-header"><button id="calendarPreviousBtn" class="secondary-btn" type="button" aria-label="Previous month">←</button><h3>${monthLabel}</h3><button id="calendarNextBtn" class="secondary-btn" type="button" aria-label="Next month" ${canMoveForward?"":"disabled"}>→</button></div>
        <div class="hours-calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
        <div class="hours-calendar-grid">${cells.join("")}</div>
        <p class="hours-calendar-key"><i class="hours-0-4"></i> 0–4 <i class="hours-4-6"></i> 4–6 <i class="hours-6-8"></i> 6–8 <i class="hours-8-10"></i> 8–10 <i class="hours-10-12"></i> 10–12 <i class="hours-12-plus"></i> 12+</p>
    </section>`;
}

function shiftCalendarMonth(monthKey,amount){
    const [year,month]=monthKey.split("-").map(Number);
    const date=new Date(year,month-1+amount,1);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
}

function getHoursColorClass(hours){
    if(hours<4) return "hours-0-4";
    if(hours<6) return "hours-4-6";
    if(hours<8) return "hours-6-8";
    if(hours<10) return "hours-8-10";
    if(hours<12) return "hours-10-12";
    return "hours-12-plus";
}

function getHoursPlannerSelectedDate(backdrop,range,isCurrentWeek){
    const selected=backdrop.dataset.selectedDate;
    const latest=isCurrentWeek?getDateKey():range.end;
    if(selected&&selected>=range.start&&selected<=latest) return selected;
    const fallback=isCurrentWeek?getDateKey():range.end;
    backdrop.dataset.selectedDate=fallback;
    return fallback;
}

function createPlannerBackdrop(type){
    const existing=document.querySelector(".planner-backdrop");
    if(existing) existing.remove();
    const backdrop=document.createElement("div");
    backdrop.className=`planner-backdrop ${type}`;
    return backdrop;
}

function bindPlannerClose(backdrop){
    backdrop.querySelector(".planner-close").onclick=()=>backdrop.remove();
    backdrop.onclick=event=>{ if(event.target===backdrop) backdrop.remove(); };
}

function formatEntryDate(dateKey){
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
}

function formatWeekRange(range){
    const start=new Date(`${range.start}T12:00:00`);
    const end=new Date(`${range.end}T12:00:00`);
    const options={day:"numeric",month:"short"};
    return `${start.toLocaleDateString("en-IN",options)} – ${end.toLocaleDateString("en-IN",options)}`;
}

function formatHoursAndMinutes(hours){
    const totalMinutes=Math.round(number(hours)*60);
    const wholeHours=Math.floor(totalMinutes/60);
    const minutes=totalMinutes%60;
    if(!minutes) return `${wholeHours} hour${wholeHours===1?"":"s"}`;
    return `${wholeHours} hour${wholeHours===1?"":"s"} ${minutes} minute${minutes===1?"":"s"}`;
}
