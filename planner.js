// Home tools: a lightweight notepad and daily study-hours journal.

function openTodoPlanner(){
    const backdrop=createPlannerBackdrop("todo-planner");
    document.body.appendChild(backdrop);
    renderTodoPlanner(backdrop);
}

function renderTodoPlanner(backdrop){
    const openTasks=state.todos.filter(todo=>!todo.completed);
    const completedTasks=state.todos.filter(todo=>todo.completed);

    backdrop.innerHTML=`
        <section class="planner-dialog" role="dialog" aria-modal="true" aria-labelledby="todoPlannerTitle">
            <button class="planner-close" type="button" aria-label="Close">×</button>
            <p class="eyebrow">YOUR NOTEPAD</p>
            <h2 id="todoPlannerTitle">Next steps</h2>
            <p class="planner-subtitle">Keep the small things out of your head and in one calm place.</p>
            <div class="planner-add-row todo-add-row">
                <input id="todoInput" class="text-input" placeholder="Add something to do…" autocomplete="off">
                <input id="todoEstimatedHours" class="text-input" type="number" min="0" step="0.25" placeholder="Est. hours" aria-label="Estimated hours">
                <button id="addTodoBtn" class="primary-btn" type="button">Add</button>
            </div>
            <div class="todo-list">
                ${openTasks.length?openTasks.map(renderTodo).join(""):`<p class="planner-empty">Nothing planned yet. Add one small next step.</p>`}
            </div>
            ${completedTasks.length?`<details class="completed-todos"><summary>${completedTasks.length} completed</summary><div class="todo-list">${completedTasks.map(renderTodo).join("")}</div></details>`:""}
        </section>
    `;

    bindPlannerClose(backdrop);
    const input=backdrop.querySelector("#todoInput");
    const estimatedInput=backdrop.querySelector("#todoEstimatedHours");
    const add=()=>{
        const todo=addTodo(input.value,estimatedInput.value);
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
            <div class="hours-total"><strong>${getWeekStudyHours(offset)}</strong><span>hours this week</span></div>
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
    const startOffset=(firstDay.getDay()+6)%7;
    const today=getDateKey();
    const cells=[];
    for(let index=0;index<startOffset;index++) cells.push('<span class="hours-calendar-blank"></span>');
    for(let day=1;day<=daysInMonth;day++){
        const dateKey=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const hours=getStudyHoursForDate(dateKey);
        const future=dateKey>today;
        const status=hours>0?getHoursColorClass(hours):"";
        cells.push(`<button class="hours-calendar-day ${status} ${dateKey===selectedDate?"is-selected":""}" data-date="${dateKey}" type="button" ${future?"disabled":""} aria-label="${formatEntryDate(dateKey)}${hours?`, ${hours} hours`:""}"><span>${day}</span>${hours?`<b>${hours}h</b>`:""}</button>`);
    }
    const monthLabel=firstDay.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    const canMoveForward=shiftCalendarMonth(monthKey,1)<=today.slice(0,7);
    return `<section class="hours-calendar" aria-label="Study hours calendar">
        <div class="hours-calendar-header"><button id="calendarPreviousBtn" class="secondary-btn" type="button" aria-label="Previous month">←</button><h3>${monthLabel}</h3><button id="calendarNextBtn" class="secondary-btn" type="button" aria-label="Next month" ${canMoveForward?"":"disabled"}>→</button></div>
        <div class="hours-calendar-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        <div class="hours-calendar-grid">${cells.join("")}</div>
        <p class="hours-calendar-key"><i class="under-five"></i> Under 5h <i class="five-plus"></i> 5h+ (darker = more hours)</p>
    </section>`;
}

function shiftCalendarMonth(monthKey,amount){
    const [year,month]=monthKey.split("-").map(Number);
    const date=new Date(year,month-1+amount,1);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
}

function getHoursColorClass(hours){
    if(hours<5) return "hours-under-five";
    if(hours<7) return "hours-pink-light";
    if(hours<9) return "hours-pink-medium";
    return "hours-pink-deep";
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
