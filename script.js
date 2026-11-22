/* =========================================
   StudyMate - script.js
   Three parts: 1) Tasks  2) Focus timer  3) Notes
   ========================================= */

/* ---------- 1. STUDY TASKS ---------- */

// Get the elements we need from the page
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const subjectSelect = document.getElementById("subject-select");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");

// Our list of tasks. Each task is an object: { text, subject, done }
// localStorage keeps data even after the browser is closed.
let tasks = JSON.parse(localStorage.getItem("studymate-tasks")) || [];

function saveTasks() {
  localStorage.setItem("studymate-tasks", JSON.stringify(tasks));
}

function showTasks() {
  taskList.innerHTML = ""; // clear the list before drawing it again

  tasks.forEach(function (task, index) {
    const li = document.createElement("li");
    if (task.done) {
      li.classList.add("done");
    }

    // checkbox to mark a task as done
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark task as done");
    checkbox.addEventListener("change", function () {
      tasks[index].done = checkbox.checked;
      saveTasks();
      showTasks();
    });

    // task text (textContent is safe: it never runs HTML typed by the user)
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    // subject label
    const subject = document.createElement("span");
    subject.className = "subject";
    subject.textContent = task.subject;

    // delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      tasks.splice(index, 1); // remove 1 item at this position
      saveTasks();
      showTasks();
    });

    li.append(checkbox, text, subject, deleteBtn);
    taskList.appendChild(li);
  });

  // update the "x of y tasks done" message
  const doneCount = tasks.filter(function (t) { return t.done; }).length;
  if (tasks.length === 0) {
    taskCount.textContent = "No tasks yet. Add your first one above.";
  } else {
    taskCount.textContent = doneCount + " of " + tasks.length + " tasks done";
  }
}

// When the form is submitted, add a new task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const text = taskInput.value.trim();
  if (text === "") {
    return;
  }

  tasks.push({ text: text, subject: subjectSelect.value, done: false });
  saveTasks();
  showTasks();
  taskInput.value = "";
  taskInput.focus();
});

showTasks();


/* ---------- 2. FOCUS TIMER ---------- */

const timeDisplay = document.getElementById("time-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const minutesInput = document.getElementById("minutes-input");
const sessionCount = document.getElementById("session-count");

let secondsLeft = 25 * 60;
let timerId = null;     // holds the running timer so we can stop it
let sessions = 0;

function showTime() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  // padStart adds a leading zero, so 5 becomes "05"
  const text = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  timeDisplay.textContent = text;
  document.title = text + " - StudyMate";
}

function startTimer() {
  if (timerId !== null) {
    return; // already running
  }
  timerId = setInterval(function () {
    secondsLeft--;
    showTime();

    if (secondsLeft <= 0) {
      stopTimer();
      sessions++;
      sessionCount.textContent = "Sessions completed: " + sessions;
      alert("Session complete! Take a short break.");
      resetTimer();
    }
  }, 1000); // runs every 1000 milliseconds = 1 second
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  stopTimer();
  const minutes = Number(minutesInput.value) || 25;
  secondsLeft = minutes * 60;
  showTime();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
minutesInput.addEventListener("change", resetTimer);

showTime();


/* ---------- 3. NOTES ---------- */

const notesArea = document.getElementById("notes-area");
const saveStatus = document.getElementById("save-status");

// load saved notes when the page opens
notesArea.value = localStorage.getItem("studymate-notes") || "";

// save every time the user types
notesArea.addEventListener("input", function () {
  localStorage.setItem("studymate-notes", notesArea.value);
  saveStatus.textContent = "Saved.";
});