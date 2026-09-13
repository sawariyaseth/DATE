/* ============================================
   CONFIGURATION
   Edit the text/colors/music here — nothing else
   in this file needs to change for basic tweaks.
   ============================================ */
const config = {

    valentineName: "Barshu",
    pageTitle: "So... do you like me? 👀",

    floatingEmojis: {
        hearts: ["♡", "✦", "♥", "❥"],
        bears: ["🧸"]
    },

    questions: {
        first: {
            text: "Be honest... have I started to become a little more than just a friend to you? 👀",
            yesBtn: "Maybe... yes",
            noBtn: "Not really",
            secretAnswer: "I knew there was something there."
        },
        second: {
            text: "Okay... but how much do you actually like me?",
            startText: "Let me guess...",
            nextBtn: "Okay, next"
        },
        third: {
            text: "So... should we finally meet and see where this goes?",
            yesBtn: "Absolutely",
            noBtn: "Maybe later"
        }
    },

    // Playful alternates the NO buttons occasionally switch to when clicked
    noTeaseTexts: [
        "Are you sure?",
        "Think again",
        "Really?",
        "Hmm...",
        "You sure about that?"
    ],
    noTeaseChance: 0.6, // ~60% of clicks swap the label, so it feels occasional, not constant

    loveMessages: {
        extreme: "Okay... I think you've made your answer pretty obvious.",
        high: "That's definitely more than a little crush.",
        normal: "Hmm... I'll take that as a good sign."
    },

    celebration: {
        title: "Yay! ✦",
        message: "Looks like we have a plan to make.",
        emojis: "" // optional flourish line — leave blank to keep the page clean, like the mockup
    },

    colors: {
        backgroundStart: "#ffafbd",
        backgroundEnd: "#ffc3a0",
        buttonBackground: "#ff6b6b",
        buttonHover: "#ff8787",
        textColor: "#ff4757"
    },

    animations: {
        floatDuration: "15s",
        floatDistance: "50px",
        bounceSpeed: "0.5s",
        heartExplosionSize: 1.5
    },

    music: {
        enabled: true,
        autoplay: true,

        // Put a direct MP3 URL here, e.g. "https://example.com/song.mp3"
        // Leave blank and the button politely asks for one instead of breaking.
        musicUrl: "https://res.cloudinary.com/qcwcq8ho/video/upload/v1789239314/Clairo_-_Sofia__mp3.pm.mp3",

        startText: "♪ Play something nice",
        stopText: "Stop music",
        volume: 0.5
    },

    // Shown after the final YES: lets her pick a day, time, and leave
    // her email, then quietly delivers it to you. Your email address
    // never has to live in this file — the serverless function reads
    // it from its own environment variable instead.
    dateTime: {
        enabled: true,

        heading: "What day and time works for you?",
        intro: "Pick a day and time that works for you — I'll take it from there. 💌",

        defaultSendText: "Send It 💌",
        sendingText: "Sending your answer... 💌",

        sentMessage: "It's on its way! 💌",
        sentSubMessage: "Can't wait! 💕",

        errorMessage: "Oops... something went wrong 💔",
        tryAgainText: "Try Again",

        emailErrorText: "Please enter a valid email address",

        // Ignore submits faster than this many milliseconds after the
        // form appears — real people take longer than this, bots don't.
        minTimeOnFormMs: 3000,

        // POSTs { name, email, date, time } as JSON. This assumes you've
        // deployed netlify-function-example.js to your Netlify site at
        // netlify/functions/send-date-email.js — Netlify then serves it
        // at exactly this path automatically. Requires the site itself
        // to be hosted on Netlify (not just any static host).
       
        // endpoint: "/.netlify/functions/send-date-email"
       endpoint: "/send-date-email"
    }
};

window.VALENTINE_CONFIG = config;


/* ============================================
   THEME
   Pushes the config colors/animations into the
   CSS variables defined in style.css.
   ============================================ */
function applyTheme() {
    const root = document.documentElement;

    root.style.setProperty("--background-color-1", config.colors.backgroundStart);
    root.style.setProperty("--background-color-2", config.colors.backgroundEnd);
    root.style.setProperty("--button-color", config.colors.buttonBackground);
    root.style.setProperty("--button-hover", config.colors.buttonHover);
    root.style.setProperty("--text-color", config.colors.textColor);
    root.style.setProperty("--float-duration", config.animations.floatDuration);
    root.style.setProperty("--float-distance", config.animations.floatDistance);
    root.style.setProperty("--bounce-speed", config.animations.bounceSpeed);
    root.style.setProperty("--heart-explosion-size", config.animations.heartExplosionSize);
}


/* ============================================
   FLOATING BACKGROUND ELEMENTS
   ============================================ */
function setRandomPosition(element) {
    element.style.left = Math.random() * 100 + "vw";
    element.style.animationDelay = Math.random() * 5 + "s";
    element.style.animationDuration = 10 + Math.random() * 20 + "s";
}

function createFloatingElements() {
    const container = document.querySelector(".floating-elements");

    config.floatingEmojis.hearts.forEach(symbol => {
        const el = document.createElement("div");
        el.className = "heart";
        el.textContent = symbol;
        setRandomPosition(el);
        container.appendChild(el);
    });

    config.floatingEmojis.bears.forEach(symbol => {
        const el = document.createElement("div");
        el.className = "bear";
        el.textContent = symbol;
        setRandomPosition(el);
        container.appendChild(el);
    });
}

function createHeartExplosion() {
    const container = document.querySelector(".floating-elements");

    for (let i = 0; i < 50; i++) {
        const heart = document.createElement("div");
        const hearts = config.floatingEmojis.hearts;

        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.className = "heart";

        container.appendChild(heart);
        setRandomPosition(heart);
    }
}


/* ============================================
   QUESTION FLOW
   ============================================ */
function showNextQuestion(questionNumber) {
    document.querySelectorAll(".question-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(`question${questionNumber}`).classList.remove("hidden");
}


/* ============================================
   THE RUNAWAY NO BUTTON
   Moves on click, and occasionally swaps its
   label for a playful tease. Always stays fully
   on screen, on desktop and mobile alike.
   ============================================ */
function moveButton(button) {
    // Occasionally change the label (measure size AFTER this, since it can change width)
    if (Math.random() < config.noTeaseChance) {
        const teases = config.noTeaseTexts;
        const newText = teases[Math.floor(Math.random() * teases.length)];

        if (newText !== button.textContent) {
            button.textContent = newText;
        }
    }

    const margin = 20;
    const maxX = Math.max(margin, window.innerWidth - button.offsetWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - button.offsetHeight - margin);

    button.style.position = "fixed";
    button.style.left = Math.random() * maxX + "px";
    button.style.top = Math.random() * maxY + "px";
}

// Keep any already-moved button on screen if the viewport changes
// (e.g. rotating a phone or resizing the window).
window.addEventListener("resize", () => {
    document.querySelectorAll(".cute-btn").forEach(button => {
        if (button.style.position !== "fixed") return;

        const margin = 20;
        const maxX = Math.max(margin, window.innerWidth - button.offsetWidth - margin);
        const maxY = Math.max(margin, window.innerHeight - button.offsetHeight - margin);

        button.style.left = Math.min(parseFloat(button.style.left) || 0, maxX) + "px";
        button.style.top = Math.min(parseFloat(button.style.top) || 0, maxY) + "px";
    });
});


/* ============================================
   LOVE METER
   ============================================ */
const loveMeter = document.getElementById("loveMeter");
const loveValue = document.getElementById("loveValue");
const extraLove = document.getElementById("extraLove");

function setInitialPosition() {
    loveMeter.value = 100;
    loveValue.textContent = 100;
    loveMeter.style.width = "100%";
}

loveMeter.addEventListener("input", () => {
    const value = parseInt(loveMeter.value);
    loveValue.textContent = value;

    if (value > 100) {
        extraLove.classList.remove("hidden");

        const overflowPercentage = (value - 100) / 9900;
        const extraWidth = overflowPercentage * window.innerWidth * 0.8;

        loveMeter.style.width = `calc(100% + ${extraWidth}px)`;
        loveMeter.style.transition = "width 0.3s";

        if (value >= 5000) {
            extraLove.classList.add("super-love");
            extraLove.textContent = config.loveMessages.extreme;
        } else if (value > 1000) {
            extraLove.classList.remove("super-love");
            extraLove.textContent = config.loveMessages.high;
        } else {
            extraLove.classList.remove("super-love");
            extraLove.textContent = config.loveMessages.normal;
        }
    } else {
        extraLove.classList.add("hidden");
        extraLove.classList.remove("super-love");
        loveMeter.style.width = "100%";
    }
});


/* ============================================
   CELEBRATION
   ============================================ */
function celebrate() {
    document.querySelectorAll(".question-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("celebration").classList.remove("hidden");
    document.getElementById("celebrationTitle").textContent = config.celebration.title;
    document.getElementById("celebrationMessage").textContent = config.celebration.message;

    const emojisEl = document.getElementById("celebrationEmojis");
    if (config.celebration.emojis) {
        emojisEl.textContent = config.celebration.emojis;
        emojisEl.classList.remove("hidden");
    } else {
        emojisEl.classList.add("hidden");
    }

    createHeartExplosion();

    if (config.dateTime.enabled) {
        document.getElementById("dateTimePicker").classList.remove("hidden");
        dateTimeShownAt = Date.now();
    }
}


/* ============================================
   DATE & TIME PICKER
   ============================================ */
let dateTimeShownAt = 0; // set by celebrate() — used for a basic anti-spam timing check

function setupDateTimePicker() {
    const picker = document.getElementById("dateTimePicker");

    if (!config.dateTime.enabled) {
        picker.classList.add("hidden");
        return;
    }

    document.getElementById("dateTimeHeading").textContent = config.dateTime.heading;
    document.getElementById("dateTimeIntro").textContent = config.dateTime.intro;

    const dateInput = document.getElementById("meetingDate");
    const timeInput = document.getElementById("meetingTime");
    const emailInput = document.getElementById("visitorEmail");
    const emailError = document.getElementById("emailError");
    const hpField = document.getElementById("hpField");
    const sendBtn = document.getElementById("sendDateBtn");
    const sendBtnText = document.getElementById("sendDateBtnText");
    const form = document.getElementById("dateTimeForm");
    const sentMessage = document.getElementById("dateTimeSentMessage");
    const sentSubMessage = document.getElementById("dateTimeSentSubMessage");
    const errorBlock = document.getElementById("dateTimeErrorBlock");
    const errorText = document.getElementById("dateTimeErrorText");
    const tryAgainBtn = document.getElementById("tryAgainBtn");

    sendBtnText.textContent = config.dateTime.defaultSendText;
    tryAgainBtn.textContent = config.dateTime.tryAgainText;

    // Can't pick a day that's already gone
    dateInput.min = new Date().toISOString().split("T")[0];

    function isFormValid() {
        return Boolean(dateInput.value && timeInput.value && emailInput.checkValidity());
    }

    function refreshSendButton() {
        sendBtn.disabled = !isFormValid();
    }

    function setSendingState(isSending) {
        sendBtn.disabled = isSending || !isFormValid();
        sendBtnText.textContent = isSending ? config.dateTime.sendingText : config.dateTime.defaultSendText;
        dateInput.disabled = isSending;
        timeInput.disabled = isSending;
        emailInput.disabled = isSending;
    }

    dateInput.addEventListener("input", refreshSendButton);
    timeInput.addEventListener("input", refreshSendButton);

    emailInput.addEventListener("input", () => {
        if (emailInput.value && !emailInput.checkValidity()) {
            emailError.textContent = config.dateTime.emailErrorText;
            emailError.classList.remove("hidden");
        } else {
            emailError.classList.add("hidden");
        }
        refreshSendButton();
    });

    tryAgainBtn.addEventListener("click", () => {
        errorBlock.classList.add("hidden");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (sendBtn.disabled) return;

        // Basic, practical spam guard: a filled honeypot or a suspiciously
        // instant submit both suggest a bot rather than a person filling
        // in a form. Real rate-limiting/validation also happens server-side.
        const tooFast = Date.now() - dateTimeShownAt < config.dateTime.minTimeOnFormMs;
        if (hpField.value.trim() !== "" || tooFast) {
            console.warn("Submission looked automated — ignoring.");
            return;
        }

        errorBlock.classList.add("hidden");
        setSendingState(true);
        playEnvelopeAnimation();

        try {
            if (!config.dateTime.endpoint) {
                throw new Error("config.dateTime.endpoint is empty — deploy the Netlify function and set it.");
            }

            const response = await fetch(config.dateTime.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: config.valentineName,
                    email: emailInput.value.trim(),
                    date: dateInput.value,
                    time: timeInput.value,
                    company: hpField.value // honeypot, checked again server-side
                })
            });

            if (!response.ok) {
                throw new Error(`Submit endpoint responded with ${response.status}`);
            }

            form.classList.add("hidden");
            sentMessage.textContent = config.dateTime.sentMessage;
            sentSubMessage.textContent = config.dateTime.sentSubMessage;
            sentMessage.classList.remove("hidden");
            sentSubMessage.classList.remove("hidden");
        } catch (err) {
            console.warn("Couldn't send the date/time:", err);
            setSendingState(false);
            errorText.textContent = config.dateTime.errorMessage;
            errorBlock.classList.remove("hidden");
        }
    });
}

// Envelope seals, pops open, then flies off screen, trailing a light burst of hearts
function playEnvelopeAnimation() {
    const envelope = document.createElement("div");
    envelope.className = "flying-envelope seal";
    envelope.textContent = "💌";
    document.body.appendChild(envelope);

    setTimeout(() => {
        envelope.classList.remove("seal");
        envelope.classList.add("open");
    }, 500);

    setTimeout(() => {
        envelope.classList.remove("open");
        envelope.classList.add("fly");
        burstHearts(16);
    }, 1000);

    setTimeout(() => envelope.remove(), 2100);
}

// A modest heart burst — reuses the same glyphs as the background hearts
function burstHearts(count) {
    const hearts = config.floatingEmojis.hearts;

    for (let i = 0; i < count; i++) {
        const heart = document.createElement("div");
        heart.className = "burst-heart";
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 160;

        heart.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
        heart.style.setProperty("--ty", `${Math.sin(angle) * distance - 60}px`);
        heart.style.setProperty("--rot", `${(Math.random() - 0.5) * 60}deg`);
        heart.style.animationDelay = `${Math.random() * 0.3}s`;

        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1800);
    }
}


/* ============================================
   MUSIC (optional — never breaks the page if no URL is set)
   ============================================ */
function setupMusicPlayer() {
    const musicControls = document.getElementById("musicControls");
    const musicToggle = document.getElementById("musicToggle");
    const bgMusic = document.getElementById("bgMusic");
    const musicSource = document.getElementById("musicSource");

    // Guard: required DOM nodes must exist
    if (!musicControls || !musicToggle || !bgMusic || !musicSource) {
        console.warn("Music player elements missing in HTML.");
        return;
    }

    if (!config.music.enabled) {
        musicControls.style.display = "none";
        return;
    }

    // Normalize URL once and reuse everywhere
    const musicUrl = (config.music.musicUrl || "").trim();

    bgMusic.volume = typeof config.music.volume === "number" ? config.music.volume : 0.5;
    musicToggle.textContent = config.music.startText;

    if (musicUrl) {
        musicSource.src = musicUrl;
        bgMusic.load();
    } else {
        // No URL configured yet
        musicSource.removeAttribute("src");
        bgMusic.load();
    }

    musicToggle.addEventListener("click", async () => {
        // Re-check from actual loaded source first (more reliable than config at click time)
        const activeSrc = (musicSource.getAttribute("src") || "").trim();

        if (bgMusic.paused) {
            if (!activeSrc) {
                alert("Add your MP3 URL in the musicUrl setting first.");
                return;
            }

            try {
                await bgMusic.play();
                musicToggle.textContent = config.music.stopText;
            } catch (err) {
                console.warn("Audio play failed:", err);
                alert("Couldn't play audio. Check browser autoplay policy or file URL.");
            }
        } else {
            bgMusic.pause();
            musicToggle.textContent = config.music.startText;
        }
    });

    bgMusic.addEventListener("ended", () => {
        musicToggle.textContent = config.music.startText;
    });
}

/* ============================================
   PAGE INITIALIZATION
   ============================================ */
window.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.title = config.pageTitle;

    document.getElementById("valentineTitle").textContent = `${config.valentineName}, one honest question...`;

    document.getElementById("question1Text").textContent = config.questions.first.text;
    document.getElementById("yesBtn1").textContent = config.questions.first.yesBtn;
    document.getElementById("noBtn1").textContent = config.questions.first.noBtn;
    document.getElementById("secretAnswerBtn").textContent = config.questions.first.secretAnswer;

    document.getElementById("question2Text").textContent = config.questions.second.text;
    document.getElementById("startText").textContent = config.questions.second.startText;
    document.getElementById("nextBtn").textContent = config.questions.second.nextBtn;

    document.getElementById("question3Text").textContent = config.questions.third.text;
    document.getElementById("yesBtn3").textContent = config.questions.third.yesBtn;
    document.getElementById("noBtn3").textContent = config.questions.third.noBtn;

    createFloatingElements();
    setupMusicPlayer();
    setupDateTimePicker();
    setInitialPosition();

    // YES button does NOT move — always easy to click
    document.getElementById("yesBtn1").addEventListener("click", () => showNextQuestion(2));

    // NO button moves (and occasionally teases)
    document.getElementById("noBtn1").addEventListener("click", function () {
        moveButton(this);
    });

    // Secret hint skips straight ahead
    document.getElementById("secretAnswerBtn").addEventListener("click", () => showNextQuestion(2));

    // From the love meter to the final question
    document.getElementById("nextBtn").addEventListener("click", () => showNextQuestion(3));

    // Final YES
    document.getElementById("yesBtn3").addEventListener("click", celebrate);

    // Final NO also moves (and teases)
    document.getElementById("noBtn3").addEventListener("click", function () {
        moveButton(this);
    });
});
