(() => {
  "use strict";

  const PROMPTS = {
    warm: [
      "What ordinary little moment with each other would you happily live twice?",
      "What is one small thing the other person does that makes you feel cared for?",
      "When did you last feel quietly proud of us?",
      "What is a tiny tradition you'd like us to start?",
      "What is something about our everyday life that you hope never changes?",
      "When do you feel most like a team?",
    ],
    curious: [
      "If we could wake up anywhere tomorrow, where would you choose and what would we do first?",
      "What is a dream you have not talked about much yet?",
      "Which new skill would be fun for us to learn side by side?",
      "What would our perfect no-plans afternoon look like?",
      "What is one place nearby you would love to explore together?",
      "What kind of home feels most like a deep breath to you?",
    ],
    silly: [
      "If our relationship had a tiny mascot, what would it be called?",
      "Which of us would befriend a raccoon first, and what would we name it?",
      "What would the title of our very low-budget travel show be?",
      "If we opened a cafe together, what would be the one ridiculous menu item?",
      "Which household object best represents our teamwork?",
      "What is the most dramatic name for our next shared snack?",
    ],
  };

  const DATES = {
    cozy: [
      "Make a blanket fort, pick a favourite film, and bring snacks for the intermission.",
      "Brew something warm and take turns choosing songs that remind you of a good day.",
      "Cook a familiar comfort meal together, with a tiny dessert picnic on the floor.",
      "Pick a short story or a silly quiz and read it aloud to each other.",
      "Have a no-phones evening: soft lights, warm drinks, and your favourite old photos.",
    ],
    outside: [
      "Take a slow sunset walk and each point out three things you'd usually walk past.",
      "Pack fruit and something crunchy, then find a nearby spot for a little picnic.",
      "Choose a street neither of you knows well and wander until you find a new favourite.",
      "Watch the sky change colours together; bring a thermos and absolutely no schedule.",
      "Visit a garden or park and make up gentle backstories for the plants.",
    ],
    playful: [
      "Draw portraits of each other in two minutes. The less accurate, the better.",
      "Make a tiny treasure hunt at home with three clues and a shared treat at the end.",
      "Build the tallest paper tower you can, then give it an unnecessarily grand name.",
      "Choose a childhood game and teach it to each other with very serious commentary.",
      "Invent a two-person award show and give each other one delightfully specific prize.",
    ],
    food: [
      "Pick one new fruit or snack neither of you has tried and give it a very official review.",
      "Visit a local bakery and split one thing you both usually walk past.",
      "Make a snack plate from whatever is already at home and name it like a restaurant dish.",
      "Try cooking one new recipe together; the side quests are part of the recipe.",
      "Get takeaway from somewhere new and have a tiny at-home tasting night.",
    ],
  };

  const SAME_PAGE_ROUNDS = [
    { question: "The perfect slow Sunday starts with…", choices: ["A walk with no destination", "A blanket and absolutely no plans"] },
    { question: "A tiny surprise that would make your day?", choices: ["A thoughtful little note", "A favourite snack appearing"] },
    { question: "Pick our next small adventure:", choices: ["A place neither of us knows", "A familiar place at a new time"] },
    { question: "A shared superpower would be…", choices: ["Making any place feel like home", "Finding the funny in a long day"] },
    { question: "The best kind of evening sounds like…", choices: ["Talking until it gets late", "Being together without needing to talk"] },
  ];

  const STORAGE_KEY = "two-of-us-keepsakes-v1";
  const storyPrompts = [
    "What ordinary little moment with each other would you happily live twice?",
    "What is something the other person does that makes a normal day softer?",
    "What would you like to make more time for together this month?",
    "Which tiny memory still makes you both smile?",
    "What does a really good, unhurried day together look like?",
  ];

  let keepsakes = loadKeepsakes();
  let ritualIndex = 0;
  let activeCategory = "warm";
  let usedPrompts = new Set();
  let sharedQuestions = 0;
  let activeMood = "cozy";
  let currentDateIdea = DATES.cozy[0];
  let previousDateIdea = currentDateIdea;
  let savedDate = false;
  let samePageState = "intro";
  let samePageRound = 0;
  let firstChoice = -1;
  let samePageMatches = 0;

  const views = [...document.querySelectorAll(".page-view")];
  const navButtons = [...document.querySelectorAll(".nav-tab[data-view]")];
  const gameTabs = [...document.querySelectorAll(".game-tab[data-game]")];
  const gamePanels = [...document.querySelectorAll(".game-panel")];
  const keepsakeCount = document.querySelector("#keepsake-count");
  const keepsakeList = document.querySelector("#keepsake-list");
  const emptyKeepsakes = document.querySelector("#empty-keepsakes");
  const clearKeepsakesButton = document.querySelector("#clear-keepsakes");

  function loadKeepsakes() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(stored)) return [];
      return stored.filter((item) => item && typeof item.text === "string" && typeof item.createdAt === "number");
    } catch {
      return [];
    }
  }

  function persistKeepsakes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keepsakes));
    } catch {
      // The site remains usable when browser storage is unavailable.
    }
  }

  function switchView(id) {
    const target = document.querySelector(`#view-${id}`);
    if (!target) return;
    views.forEach((view) => {
      const active = view === target;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    });
    navButtons.forEach((button) => {
      const active = button.dataset.view === id;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  document.querySelectorAll("[data-view-link]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewLink));
  });

  function switchGame(id) {
    gameTabs.forEach((button) => {
      const active = button.dataset.game === id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    gamePanels.forEach((panel) => {
      const active = panel.id === `game-${id}`;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  }

  gameTabs.forEach((button, index) => {
    button.addEventListener("click", () => switchGame(button.dataset.game));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? gameTabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + gameTabs.length) % gameTabs.length;
      gameTabs[next].focus();
      switchGame(gameTabs[next].dataset.game);
    });
  });

  function renderSamePageBoard() {
    const board = document.querySelector("#same-page-board");
    const round = SAME_PAGE_ROUNDS[samePageRound];
    const playerOne = "S. Prashank";
    const playerTwo = "K. Lakshita";

    if (samePageState === "intro") {
      board.innerHTML = `
        <div class="same-intro">
          <div class="same-round"><span>READY WHEN YOU ARE</span><span>♡</span></div>
          <h3 class="same-question">Two people. One little guess.</h3>
          <p class="same-progress">You'll each pick privately, then see where your answers meet.</p>
          <div class="board-actions"><button class="button button-terracotta button-small" type="button" data-same-action="start">Let's play <span aria-hidden="true">↗</span></button></div>
        </div>`;
      return;
    }

    if (samePageState === "pass") {
      board.innerHTML = `
        <div class="pass-note">
          <span class="pass-heart" aria-hidden="true">♥</span>
          <span class="card-index">A LITTLE HAND-OFF</span>
          <h3>Pass it to ${playerTwo}</h3>
          <p>${playerOne}'s pick is tucked away. Let ${playerTwo} choose without peeking.</p>
          <div class="board-actions"><button class="button button-terracotta button-small" type="button" data-same-action="pass">Ready, ${playerTwo}? <span aria-hidden="true">→</span></button></div>
        </div>`;
      return;
    }

    if (samePageState === "result" || samePageState === "done") {
      const match = firstChoice === samePageChoice;
      const heading = samePageState === "done" ? "That was lovely." : match ? "A little in sync." : "A lovely little difference.";
      const note = samePageState === "done"
        ? `You found ${samePageMatches} moment${samePageMatches === 1 ? "" : "s"} on the same page. Keep the conversation going wherever it wants to go.`
        : match
          ? "Same choice, same little wavelength. Tell each other what made it feel right."
          : "Different answers are good answers. Tell each other what made your pick feel right.";
      const currentRound = samePageState === "done" ? SAME_PAGE_ROUNDS[SAME_PAGE_ROUNDS.length - 1] : round;
      const choices = currentRound.choices;
      board.innerHTML = `
        <div class="result-note">
          <span class="match-mark" aria-hidden="true">${samePageState === "done" ? "✿" : match ? "♡" : "〰"}</span>
          <span class="card-index">${samePageState === "done" ? "FIVE LITTLE ANSWERS" : `ROUND ${samePageRound + 1} · ${match ? "SAME PAGE" : "A NEW THING TO LEARN"}`}</span>
          <h3>${heading}</h3>
          ${samePageState === "done" ? "" : `<div class="match-answer${match ? " is-match" : ""}"><span>${choices[firstChoice]}</span><span>${choices[samePageChoice]}</span></div>`}
          <p>${note}</p>
          <div class="board-actions">
            ${samePageState === "done"
              ? `<button class="button button-terracotta button-small" type="button" data-same-action="restart">Play another time <span aria-hidden="true">↻</span></button>`
              : `<button class="button button-muted button-small" type="button" data-same-action="save">Keep this question <span aria-hidden="true">♡</span></button><button class="button button-terracotta button-small" type="button" data-same-action="next">Next little question <span aria-hidden="true">→</span></button>`}
          </div>
        </div>`;
      return;
    }

    const activePlayer = samePageState === "first" ? playerOne : playerTwo;
    board.innerHTML = `
      <div class="same-intro">
        <div class="same-round"><span>ROUND ${samePageRound + 1} OF ${SAME_PAGE_ROUNDS.length}</span><span>FOR ${activePlayer.toUpperCase()}</span></div>
        <h3 class="same-question">${round.question}</h3>
        <div class="answer-options">
          ${round.choices.map((choice, index) => `<button class="answer-option" type="button" data-answer="${index}"><span>${String.fromCharCode(65 + index)}</span>${choice}</button>`).join("")}
        </div>
        <p class="same-progress">Choose what feels true for you. No peeking.</p>
      </div>`;
  }

  let samePageChoice = -1;

  document.querySelector("#same-page-board").addEventListener("click", (event) => {
    const answerButton = event.target.closest("[data-answer]");
    if (answerButton) {
      const choice = Number(answerButton.dataset.answer);
      if (samePageState === "first") {
        firstChoice = choice;
        samePageState = "pass";
      } else if (samePageState === "second") {
        samePageChoice = choice;
        if (firstChoice === samePageChoice) samePageMatches += 1;
        samePageState = "result";
      } else return;
      renderSamePageBoard();
      return;
    }

    const action = event.target.closest("[data-same-action]")?.dataset.sameAction;
    if (!action) return;
    if (action === "start") {
      samePageRound = 0;
      samePageMatches = 0;
      samePageState = "first";
    } else if (action === "pass") {
      samePageState = "second";
    } else if (action === "next") {
      samePageRound += 1;
      samePageState = samePageRound === SAME_PAGE_ROUNDS.length ? "done" : "first";
    } else if (action === "restart") {
      samePageRound = 0;
      samePageMatches = 0;
      samePageState = "intro";
    } else if (action === "save") {
      const text = SAME_PAGE_ROUNDS[samePageRound].question;
      addKeepsake(text);
      answerButton?.focus();
    }
    renderSamePageBoard();
  });

  function choosePrompt(category) {
    const allPrompts = PROMPTS[category];
    let available = allPrompts.filter((prompt) => !usedPrompts.has(prompt));
    if (!available.length) {
      allPrompts.forEach((prompt) => usedPrompts.delete(prompt));
      available = [...allPrompts];
    }
    const prompt = available[Math.floor(Math.random() * available.length)];
    usedPrompts.add(prompt);
    return prompt;
  }

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      document.querySelectorAll("[data-category]").forEach((pill) => {
        const active = pill === button;
        pill.classList.toggle("is-active", active);
        pill.setAttribute("aria-pressed", String(active));
      });
    });
  });

  document.querySelector("#garden-next").addEventListener("click", () => {
    const prompt = choosePrompt(activeCategory);
    const card = document.querySelector("#garden-question");
    card.innerHTML = `<span class="question-sprig" aria-hidden="true">❧</span><p>${prompt}</p><span class="handwritten question-note">take turns sharing</span>`;
    sharedQuestions += 1;
    document.querySelector("#garden-count").textContent = `${sharedQuestions} QUESTION${sharedQuestions === 1 ? "" : "S"} SHARED`;
    document.querySelector("#garden-next").innerHTML = "Another little prompt <span aria-hidden=\"true\">↻</span>";
  });

  function chooseDateIdea() {
    const options = DATES[activeMood];
    const alternatives = options.filter((idea) => idea !== previousDateIdea);
    currentDateIdea = alternatives[Math.floor(Math.random() * alternatives.length)] || options[0];
    previousDateIdea = currentDateIdea;
    savedDate = false;
    document.querySelector("#date-idea h3").textContent = currentDateIdea;
    document.querySelector("#date-idea p").textContent = "Keep it simple. The company is the whole point.";
    const saveButton = document.querySelector("#save-date");
    saveButton.classList.remove("is-saved");
    saveButton.innerHTML = '<span aria-hidden="true">♡</span> Save this little plan';
  }

  document.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMood = button.dataset.mood;
      document.querySelectorAll("[data-mood]").forEach((pill) => {
        const active = pill === button;
        pill.classList.toggle("is-active", active);
        pill.setAttribute("aria-pressed", String(active));
      });
      previousDateIdea = "";
      chooseDateIdea();
      document.querySelector("#date-note").textContent = "A new little plan, just for you.";
    });
  });

  document.querySelector("#date-again").addEventListener("click", chooseDateIdea);
  document.querySelector("#save-date").addEventListener("click", (event) => {
    if (!savedDate) addKeepsake(currentDateIdea);
    savedDate = true;
    event.currentTarget.classList.add("is-saved");
    event.currentTarget.innerHTML = '<span aria-hidden="true">♥</span> Tucked into keepsakes';
  });

  function renderKeepsakes() {
    keepsakeList.replaceChildren();
    document.querySelector("#saved-total").textContent = String(keepsakes.length);
    keepsakeCount.textContent = String(keepsakes.length);
    keepsakeCount.hidden = keepsakes.length === 0;
    emptyKeepsakes.hidden = keepsakes.length !== 0;
    clearKeepsakesButton.hidden = keepsakes.length === 0;

    keepsakes.forEach((item) => {
      const row = document.createElement("article");
      row.className = "keepsake-item";
      const mark = document.createElement("span");
      mark.className = "keepsake-item-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "♥";
      const content = document.createElement("div");
      const text = document.createElement("p");
      text.className = "keepsake-item-text";
      text.textContent = item.text;
      const date = document.createElement("div");
      date.className = "keepsake-item-date";
      date.textContent = new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      const remove = document.createElement("button");
      remove.className = "remove-keepsake";
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove this keepsake");
      remove.dataset.remove = item.id;
      remove.textContent = "×";
      content.append(text, date);
      row.append(mark, content, remove);
      keepsakeList.append(row);
    });
  }

  function addKeepsake(text) {
    const cleanText = text.trim();
    if (!cleanText) return;
    keepsakes.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: cleanText, createdAt: Date.now() });
    keepsakes = keepsakes.slice(0, 60);
    persistKeepsakes();
    renderKeepsakes();
  }

  document.querySelector("#note-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#note-input");
    addKeepsake(input.value);
    input.value = "";
    input.focus();
  });

  keepsakeList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");
    if (!removeButton) return;
    keepsakes = keepsakes.filter((item) => item.id !== removeButton.dataset.remove);
    persistKeepsakes();
    renderKeepsakes();
  });

  clearKeepsakesButton.addEventListener("click", () => {
    if (!keepsakes.length) return;
    keepsakes = [];
    persistKeepsakes();
    renderKeepsakes();
  });

  document.querySelector("#another-ritual").addEventListener("click", () => {
    ritualIndex = (ritualIndex + 1) % storyPrompts.length;
    document.querySelector("#ritual-prompt").textContent = storyPrompts[ritualIndex];
  });

  renderSamePageBoard();
  renderKeepsakes();
})();
