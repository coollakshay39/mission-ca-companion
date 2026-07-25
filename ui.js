// =======================================================
// ui.js
// COMPLETE REPLACEMENT
// PART 1 / 2
// =======================================================

function renderProgressRing(progress){

    const radius=72;

    const circumference=2*Math.PI*radius;

    const offset=

        circumference-

        (progress/100)*circumference;

    return `

    <div class="progress-ring-wrapper">

        <svg
            class="progress-ring"
            width="180"
            height="180"
        >

            <circle

                class="progress-ring-bg"

                cx="90"

                cy="90"

                r="${radius}"

            ></circle>

            <circle

                class="progress-ring-fill
                ${progress>=100?"completed":""}"

                cx="90"

                cy="90"

                r="${radius}"

                stroke-dasharray="${circumference}"

                stroke-dashoffset="${offset}"

            ></circle>

        </svg>

        <div class="progress-ring-text">

            <h2>

                ${progress}%

            </h2>

        </div>

    </div>

    `;

}

function renderQuote(progress){

    if(

        state.settings &&

        state.settings.motivationalQuotes===false

    ){

        return "";

    }

    let message="";

    if(progress>=100){

        message=getCompletedMessage();

    }

    else if(progress>=90){

        message=getAheadMessage();

    }

    else if(progress>=60){

        message=getOnTrackMessage();

    }

    else{

        message=getBehindMessage();

    }

    return `

    <div class="quote-card">

        <p>

            ${message}

        </p>

    </div>

    `;

}

function renderMotivationImages(){

    const images=[

        "calculator-cat.jpeg",

        "cat-study.jpeg",

        "degree-girl.jpeg",

        "hello-kitty.jpeg",

        "shant-girl.jpeg"

    ];

    const image=

        images[

            Math.floor(

                Math.random()*images.length

            )

        ];

    return `

    <div class="motivation-image">

        <img

            src="assets/motivation/${image}"

            alt="Motivation"

        >

    </div>

    `;

}

function showLoader(){

    const loader=document.createElement(

        "div"

    );

    loader.id="globalLoader";

    loader.className="loader-overlay";

    loader.innerHTML=`

        <div class="spinner"></div>

    `;

    document.body.appendChild(

        loader

    );

}

function hideLoader(){

    const loader=document.getElementById(

        "globalLoader"

    );

    if(loader){

        loader.remove();

    }

}

function createButton(

    text,

    className,

    onclick

){

    const button=document.createElement(

        "button"

    );

    button.className=className;

    button.textContent=text;

    button.onclick=onclick;

    return button;

}

function createGlassCard(content){

    const card=document.createElement(

        "div"

    );

    card.className="glass-card";

    card.innerHTML=content;

    return card;

}

function scrollToTop(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

function scrollToBottom(){

    window.scrollTo({

        top:document.body.scrollHeight,

        behavior:"smooth"

    });

}

/* ==========================================
   UI HELPERS
========================================== */

function createInput(

    id,

    placeholder,

    value=""

){

    return `

        <input

            id="${id}"

            class="text-input"

            placeholder="${placeholder}"

            value="${value}"

        >

    `;

}

function createSectionTitle(title){

    return `

        <h2>

            ${title}

        </h2>

    `;

}

function createEmptyState(

    emoji,

    title,

    message

){

    return `

    <div class="empty-state">

        <div class="empty-icon">

            ${emoji}

        </div>

        <h3>

            ${title}

        </h3>

        <p>

            ${message}

        </p>

    </div>

    `;

}

function showToast(

    message,

    duration=2500

){

    const oldToast=document.querySelector(

        ".toast"

    );

    if(oldToast){

        oldToast.remove();

    }

    const toast=document.createElement(

        "div"

    );

    toast.className="toast";

    toast.textContent=message;

    document.body.appendChild(

        toast

    );

    requestAnimationFrame(()=>{

        toast.classList.add(

            "show"

        );

    });

    setTimeout(()=>{

        toast.classList.remove(

            "show"

        );

        setTimeout(()=>{

            toast.remove();

        },300);

    },duration);

}

function showConfirm(

    message,

    onConfirm

){

    if(confirm(message)){

        onConfirm();

    }

}

function showPrompt(

    title,

    defaultValue=""

){

    return prompt(

        title,

        defaultValue

    );

}

/* Tablet-friendly replacement for browser prompt dialogs. */
function showEditDialog({title, label, value="", type="text", min, max, onSave}){
    const existing=document.querySelector(".edit-dialog-backdrop");
    if(existing) existing.remove();

    const backdrop=document.createElement("div");
    backdrop.className="edit-dialog-backdrop";
    backdrop.innerHTML=`
        <section class="edit-dialog" role="dialog" aria-modal="true" aria-labelledby="editDialogTitle">
            <button class="edit-dialog-close" type="button" aria-label="Close">×</button>
            <p class="eyebrow">EDIT DETAILS</p>
            <h2 id="editDialogTitle">${escapeHtml(title)}</h2>
            <label for="editDialogInput">${escapeHtml(label)}</label>
            <input id="editDialogInput" class="text-input" type="${type}" value="${escapeHtml(value)}" ${min!==undefined?`min="${min}"`:""} ${max!==undefined?`max="${max}"`:""} ${type==="number"?"step=\"1\"":""}>
            <p class="edit-dialog-error" aria-live="polite"></p>
            <div class="edit-dialog-actions">
                <button class="secondary-btn" type="button" data-action="cancel">Cancel</button>
                <button class="primary-btn" type="button" data-action="save">Save changes</button>
            </div>
        </section>
    `;
    document.body.appendChild(backdrop);

    const input=backdrop.querySelector("#editDialogInput");
    const error=backdrop.querySelector(".edit-dialog-error");
    const close=()=>backdrop.remove();
    const save=()=>{
        const nextValue=input.value.trim();
        if(!nextValue){ error.textContent=`${label} cannot be empty.`; return; }
        if(type==="number" && (!Number.isFinite(Number(nextValue)) || (min!==undefined && Number(nextValue)<min) || (max!==undefined && Number(nextValue)>max))){
            error.textContent=`Enter a value between ${min} and ${max}.`;
            return;
        }
        onSave(nextValue);
        close();
    };

    backdrop.querySelector(".edit-dialog-close").onclick=close;
    backdrop.querySelector("[data-action='cancel']").onclick=close;
    backdrop.querySelector("[data-action='save']").onclick=save;
    backdrop.onclick=event=>{ if(event.target===backdrop) close(); };
    input.onkeydown=event=>{ if(event.key==="Enter") save(); if(event.key==="Escape") close(); };
    requestAnimationFrame(()=>{ backdrop.classList.add("is-open"); input.focus(); input.select(); });
}

function formatPercentage(value){

    return `${

        Math.round(value)

    }%`;

}

function formatDate(date){

    return new Date(date).toLocaleDateString(

        "en-IN",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}

function formatDateTime(date){

    return new Date(date).toLocaleString(

        "en-IN"

    );

}

function randomMotivationImage(){

    const images=[

        "calculator-cat.jpeg",

        "cat-study.jpeg",

        "degree-girl.jpeg",

        "hello-kitty.jpeg",

        "shant-girl.jpeg"

    ];

    return `assets/motivation/${
        images[
            Math.floor(
                Math.random()*images.length
            )
        ]
    }`;

}

function animateNumber(

    element,

    start,

    end,

    duration=700

){

    const startTime=performance.now();

    function update(now){

        const progress=Math.min(

            (now-startTime)/duration,

            1

        );

        const value=Math.round(

            start+

            (end-start)*progress

        );

        element.textContent=`${value}%`;

        if(progress<1){

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}

function debounce(

    callback,

    delay=300

){

    let timeout;

    return(...args)=>{

        clearTimeout(timeout);

        timeout=setTimeout(

            ()=>callback(...args),

            delay

        );

    };

}

function uuid(){

    return(

        Date.now().toString(36)+

        Math.random()

        .toString(36)

        .substring(2,9)

    );

}

function clamp(

    value,

    min,

    max

){

    return Math.min(

        Math.max(value,min),

        max

    );

}

function sleep(ms){

    return new Promise(resolve=>{

        setTimeout(resolve,ms);

    });

}

function capitalize(text){

    if(!text){

        return "";

    }

    return text.charAt(0).toUpperCase()

        +text.slice(1);

}

function escapeHtml(text){

    const div=document.createElement("div");

    div.textContent=text;

    return div.innerHTML;

}

function copyToClipboard(text){

    navigator.clipboard.writeText(text);

    showToast(

        "Copied to clipboard"

    );

}
