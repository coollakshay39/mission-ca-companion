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
            <div class="planner-add-row">
                <input id="todoInput" class="text-input" placeholder="Add something to do…" autocomplete="off">
                <select id="todoTimeframe" class="planner-select" aria-label="When is this task for">
                    <option value="next-day">Next day</option>
                    <option value="next-week" selected>Next week</option>
                </select>
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
    const add=()=>{
        const todo=addTodo(input.value,backdrop.querySelector("#todoTimeframe").value);
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
    requestAnimationFrame(()=>{ backdrop.classList.add("is-open"); input.focus(); });
}

function renderTodo(todo){
    const timeframe=todo.timeframe==="next-day"?"Next day":"Next week";
    return `<article class="todo-item ${todo.completed?"is-complete":""}">
        <button class="todo-toggle" data-id="${todo.id}" type="button" aria-label="Mark ${escapeHtml(todo.title)} ${todo.completed?"incomplete":"complete"}">${todo.completed?"✓":""}</button>
        <div><strong>${escapeHtml(todo.title)}</strong><span>${timeframe}</span></div>
        <button class="todo-delete" data-id="${todo.id}" type="button" aria-label="Delete ${escapeHtml(todo.title)}">×</button>
    </article>`;
}

function openHoursPlanner(){
    const backdrop=createPlannerBackdrop("hours-planner");
    backdrop.dataset.weekOffset="0";
    document.body.appendChild(backdrop);
    renderHoursPlanner(backdrop);
}

function renderHoursPlanner(backdrop){
    const offset=Number(backdrop.dataset.weekOffset||0);
    const range=getWeekRange(offset);
    const entries=getStudyHoursForWeek(offset);
    const isCurrentWeek=offset===0;

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
            ${isCurrentWeek?`<div class="planner-add-row hours-add-row"><input id="hoursInput" class="text-input" type="number" min="0.25" step="0.25" placeholder="Hours studied today"><button id="addHoursBtn" class="primary-btn" type="button">Add hours</button></div>`:""}
            <div class="hours-list">
                ${entries.length?entries.map(entry=>`<article class="hours-item"><span>${formatEntryDate(entry.date)}</span><strong>${entry.hours} h</strong></article>`).join(""):`<p class="planner-empty">${isCurrentWeek?"No study hours logged this week yet.":"No study hours were logged this week."}</p>`}
            </div>
        </section>
    `;

    bindPlannerClose(backdrop);
    backdrop.querySelector("#previousWeekBtn").onclick=()=>{ backdrop.dataset.weekOffset=String(offset-1); renderHoursPlanner(backdrop); };
    const next=backdrop.querySelector("#nextWeekBtn");
    if(next&&!isCurrentWeek) next.onclick=()=>{ backdrop.dataset.weekOffset=String(offset+1); renderHoursPlanner(backdrop); };

    const addButton=backdrop.querySelector("#addHoursBtn");
    if(addButton){
        const input=backdrop.querySelector("#hoursInput");
        const add=()=>{
            if(!addStudyHours(input.value)){ input.focus(); return; }
            renderHoursPlanner(backdrop);
            renderWelcomeScreen();
        };
        addButton.onclick=add;
        input.onkeydown=event=>{ if(event.key==="Enter") add(); };
        requestAnimationFrame(()=>input.focus());
    }
    requestAnimationFrame(()=>backdrop.classList.add("is-open"));
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
