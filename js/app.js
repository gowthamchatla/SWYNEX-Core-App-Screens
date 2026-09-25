// QuickTask -- vanilla JS mobile-responsive web app
// Handles screen navigation, task/habit state, and simple progress stats.
// State is persisted to localStorage so it survives a page reload.
// Written in ES5-style syntax for the widest possible browser compatibility.

var STORAGE_KEY = "quicktask_items_v1";

var defaultItems = [
  { id: "1", name: "Submit assignment", type: "task", category: "Study", done: false },
  { id: "2", name: "Read 10 pages", type: "task", category: "Personal", done: true },
  { id: "3", name: "Drink water", type: "task", category: "Health", done: true },
  { id: "4", name: "Evening walk", type: "habit", category: "Health", done: false, streak: 5 },
  { id: "5", name: "Journal", type: "habit", category: "Personal", done: true, streak: 6 }
];

var weeklyBars = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 2 },
  { day: "Thu", value: 6 },
  { day: "Fri", value: 4 },
  { day: "Sat", value: 1 },
  { day: "Sun", value: 5 }
];

function loadItems() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to defaults */ }
  return JSON.parse(JSON.stringify(defaultItems));
}

function saveItems(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

var items = loadItems();
var pendingType = "task";

// ---------- Navigation ----------
function showScreen(id) {
  var screens = document.querySelectorAll(".screen");
  for (var i = 0; i < screens.length; i++) screens[i].classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");

  var navItems = document.querySelectorAll(".nav-item");
  for (var j = 0; j < navItems.length; j++) {
    if (navItems[j].getAttribute("data-target") === id) {
      navItems[j].classList.add("active");
    } else {
      navItems[j].classList.remove("active");
    }
  }
}

function bindNav() {
  var navItems = document.querySelectorAll(".nav-item");
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].addEventListener("click", function () {
      var target = this.getAttribute("data-target");
      if (target === "screen-progress") renderProgress();
      showScreen(target);
    });
  }
}

document.getElementById("btn-get-started").addEventListener("click", function () {
  renderHome();
  showScreen("screen-home");
});

document.getElementById("btn-add").addEventListener("click", function () {
  document.getElementById("input-name").value = "";
  document.getElementById("input-category").value = "Personal";
  document.getElementById("input-reminder").value = "20:00";
  setPendingType("task");
  clearNameError();
  showScreen("screen-add");
});

document.getElementById("input-name").addEventListener("input", function () {
  clearNameError();
});

document.getElementById("btn-cancel-add").addEventListener("click", function () {
  showScreen("screen-home");
});

// ---------- Add item ----------
function setPendingType(type) {
  pendingType = type;
  var segs = document.querySelectorAll(".segment");
  for (var i = 0; i < segs.length; i++) {
    if (segs[i].getAttribute("data-type") === type) {
      segs[i].classList.add("active");
    } else {
      segs[i].classList.remove("active");
    }
  }
}

function bindSegments() {
  var segs = document.querySelectorAll(".segment");
  for (var i = 0; i < segs.length; i++) {
    segs[i].addEventListener("click", function () {
      setPendingType(this.getAttribute("data-type"));
    });
  }
}

function showNameError(message) {
  var nameInput = document.getElementById("input-name");
  var errorEl = document.getElementById("error-name");
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  nameInput.classList.add("invalid");
  nameInput.focus();
}

function clearNameError() {
  var nameInput = document.getElementById("input-name");
  var errorEl = document.getElementById("error-name");
  errorEl.classList.add("hidden");
  nameInput.classList.remove("invalid");
}

function saveNewItem() {
  var nameInput = document.getElementById("input-name");
  var name = nameInput.value.replace(/^\s+|\s+$/g, "");

  // Validation: required field
  if (!name) {
    showNameError("Please enter a name for this item.");
    return;
  }
  // Validation: minimum length
  if (name.length < 2) {
    showNameError("Name must be at least 2 characters.");
    return;
  }
  // Validation: no duplicate active items with the same name and type
  var isDuplicate = false;
  for (var i = 0; i < items.length; i++) {
    if (items[i].type === pendingType && items[i].name.toLowerCase() === name.toLowerCase()) {
      isDuplicate = true;
      break;
    }
  }
  if (isDuplicate) {
    showNameError("You already have a " + pendingType + " with this name.");
    return;
  }

  clearNameError();

  var category = document.getElementById("input-category").value;
  var newItem = {
    id: Date.now().toString(),
    name: name,
    type: pendingType,
    category: category,
    done: false
  };
  if (pendingType === "habit") newItem.streak = 0;
  items.push(newItem);
  saveItems(items);
  renderHome();
  showScreen("screen-home");
}
document.getElementById("btn-save-add").addEventListener("click", saveNewItem);
document.getElementById("btn-save-item").addEventListener("click", saveNewItem);

// ---------- Home rendering ----------
function toggleItem(id) {
  var item = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) { item = items[i]; break; }
  }
  if (!item) return;
  item.done = !item.done;
  if (item.type === "habit") {
    item.streak = (item.streak || 0) + (item.done ? 1 : -1);
    if (item.streak < 0) item.streak = 0;
  }
  saveItems(items);
  renderHome();
}

function buildItemRow(item) {
  var row = document.createElement("div");
  row.className = "item-row" + (item.done ? " done" : "");
  row.innerHTML =
    '<span class="check">' +
      '<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.2 3.2L11 1.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</span>' +
    '<span class="label">' + item.name + '</span>';
  row.addEventListener("click", function () { toggleItem(item.id); });
  return row;
}

function renderHome() {
  var today = new Date();
  var dateOptions = { weekday: "long", month: "short", day: "numeric" };
  document.getElementById("today-date").textContent = today.toLocaleDateString(undefined, dateOptions);

  var tasks = [];
  var habits = [];
  var doneCount = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i].type === "task") tasks.push(items[i]);
    if (items[i].type === "habit") habits.push(items[i]);
    if (items[i].done) doneCount++;
  }

  document.getElementById("summary-count").textContent = doneCount + " of " + items.length + " done";

  var bestStreak = 0;
  for (var h = 0; h < habits.length; h++) {
    if ((habits[h].streak || 0) > bestStreak) bestStreak = habits[h].streak;
  }
  document.getElementById("summary-streak").textContent = bestStreak;

  var taskList = document.getElementById("task-list");
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="empty-state">No tasks yet -- tap + to add one.</p>';
  } else {
    for (var t = 0; t < tasks.length; t++) taskList.appendChild(buildItemRow(tasks[t]));
  }

  var habitList = document.getElementById("habit-list");
  habitList.innerHTML = "";
  if (habits.length === 0) {
    habitList.innerHTML = '<p class="empty-state">No habits yet -- tap + to add one.</p>';
  } else {
    for (var hh = 0; hh < habits.length; hh++) habitList.appendChild(buildItemRow(habits[hh]));
  }
}

// ---------- Progress rendering ----------
function renderProgress() {
  var habits = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].type === "habit") habits.push(items[i]);
  }

  var completedTotal = 0;
  var maxVal = 0;
  for (var w = 0; w < weeklyBars.length; w++) {
    completedTotal += weeklyBars[w].value;
    if (weeklyBars[w].value > maxVal) maxVal = weeklyBars[w].value;
  }

  var bestStreak = 0;
  for (var h = 0; h < habits.length; h++) {
    if ((habits[h].streak || 0) > bestStreak) bestStreak = habits[h].streak;
  }

  document.getElementById("stat-completed").textContent = completedTotal;
  document.getElementById("stat-streak").textContent = bestStreak + " days";

  var chart = document.getElementById("bar-chart");
  chart.innerHTML = "";
  for (var b = 0; b < weeklyBars.length; b++) {
    var d = weeklyBars[b];
    var col = document.createElement("div");
    col.className = "bar-col";
    var heightPct = Math.max(12, (d.value / maxVal) * 100);
    var isHigh = d.value === maxVal;
    col.innerHTML =
      '<div class="bar' + (isHigh ? " high" : "") + '" style="height:' + heightPct + '%"></div>' +
      '<span>' + d.day + '</span>';
    chart.appendChild(col);
  }

  var streakList = document.getElementById("habit-streaks");
  streakList.innerHTML = "";
  if (habits.length === 0) {
    streakList.innerHTML = '<p class="empty-state">No habits tracked yet.</p>';
  } else {
    for (var hs = 0; hs < habits.length; hs++) {
      var row = document.createElement("div");
      row.className = "item-row static";
      row.innerHTML =
        '<span class="label">' + habits[hs].name + '</span>' +
        '<span class="streak-value">' + (habits[hs].streak || 0) + ' days</span>';
      streakList.appendChild(row);
    }
  }
}

// ---------- Profile toggles ----------
function bindSwitch(id) {
  var el = document.getElementById(id);
  el.addEventListener("click", function () {
    var isOn = el.classList.toggle("on");
    el.setAttribute("aria-checked", isOn ? "true" : "false");
  });
}

// ---------- Init ----------
bindNav();
bindSegments();
bindSwitch("switch-notif");
bindSwitch("switch-dark");
renderHome();
