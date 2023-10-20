
const form = document.querySelector('#form');
const taskInputs = document.querySelectorAll('.form-input');
const taskName = document.querySelector('#taskName');
const taskDescription = document.querySelector('#taskDescription');
const taskDate = document.querySelector('#taskDate');
const taskTime = document.querySelector('#taskTime');
const tasksList = document.querySelector('#tasksList');
const btnClose = document.querySelector('#btnClose');

let tasks = []; 
if (localStorage.getItem('tasks')) {
	tasks = JSON.parse(localStorage.getItem('tasks'));
	tasks.forEach((task) => renderTask(task));
}

checkEmptyList();

form.addEventListener('submit', addTask); 
tasksList.addEventListener('click', deleteTask); 
tasksList.addEventListener('click', doneTask); 
tasksList.addEventListener('click', fixTask); 
btnClose.addEventListener('click', formOpenClose); 


function addTask(event) {

	event.preventDefault();


	const taskTextName = taskName.value;
	const taskTextDescription = taskDescription.value;
	const taskTextDate = taskDate.value;
	const taskTextTime = taskTime.value;

	const newTask = {
		id: Date.now(),
		name: taskTextName,
		description: taskTextDescription,
		date: taskTextDate,
		time: taskTextTime,
		done: false,
	};


	tasks.push(newTask);

	tasks.sort(sortTasks);

	saveToLocalStorage();

	renderTask(newTask);

	location.reload();

	for(let i = 0; i < taskInputs.length; i++) {
		taskInputs[i].value = '';
	}
	
	checkEmptyList();
}


function deleteTask(event) {

	if (event.target.dataset.action !== 'delete') return;


	const parenNode = event.target.closest('.task-item');
	const id = Number(parenNode.id);

	tasks = tasks.filter((task) => task.id !== id);

	saveToLocalStorage();

	parenNode.remove();

	checkEmptyList();
}

function doneTask(event) {

	if (event.target.dataset.action !== 'done') return;

	const parentNode = event.target.closest('.task-item');


	const id = Number(parentNode.id);
	const task = tasks.find((task) => task.id === id);
	task.done = !task.done;
	saveToLocalStorage();

	const taskInfo = parentNode.querySelectorAll('.task-info');
	for(let i = 0; i < taskInfo.length; i++) {
		taskInfo[i].classList.toggle('task-info--done');
	}
}

function fixTask(event) {

	if (event.target.dataset.action !== 'fix') return;

	const parentNode = event.target.closest('.task-item');

	const id = Number(parentNode.id);
	const task = tasks.find((task) => task.id === id);


	document.getElementById("newTitle").value = task.name;
    document.getElementById("newDescription").value = task.description;
    document.getElementById("newDate").value = task.date;
    document.getElementById("newTime").value = task.time;
	formOpenClose();

	document.getElementById("saveButton").addEventListener("click", function() {
		task.name = document.getElementById("newTitle").value;
		task.description = document.getElementById("newDescription").value;
		task.date = document.getElementById("newDate").value;
		task.time = document.getElementById("newTime").value;


		formOpenClose();

		tasks.sort(sortTasks);

		saveToLocalStorage();
	});
}

function formOpenClose() {
	document.getElementById("editForm").classList.toggle('open');
}

function checkEmptyList() {
	if (tasks.length === 0) {
		const emptyListHTML = `
				<li id="emptyList" class="empty-list">
					<p class="empty-list__title">Список дел пуст</p>
				</li>`;
		tasksList.insertAdjacentHTML('afterbegin', emptyListHTML);
	}

	if (tasks.length > 0) {
		const emptyListEl = document.querySelector('#emptyList');
		emptyListEl ? emptyListEl.remove() : null;
	}
}

function sortTasks (a, b) {
	const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

	if (dateA > dateB) {
        return 1;
    }
    if (dateA < dateB) {
        return -1;
    }
    return 0;
}

function saveToLocalStorage() {
	localStorage.setItem('tasks', JSON.stringify(tasks))
}

function renderTask(task) {
	const cssClass = task.done ? 'task-info task-info--done' : 'task-info';

	const taskHTML = `
                <li id="${task.id}" class="task-item">
					<div class="task-wrapper">
						<div class="task-item--wrapper">
							<span class="${cssClass} task-name task-info">${task.name}</span>
							<span class="${cssClass} task-description task-info">${task.description}</span>
						</div>
						<div class="task-item--wrapper">
							<span class="${cssClass} task-date task-info">${task.date}</span>
							<span class="${cssClass} task-time task-info">${task.time}</span>
						</div>
					</div>
					<div class="task-item__buttons">
						<button type="button" data-action="fix" class="btn-action">
							<img src="./img/fix.png" alt="Fix" width="20" height="20">
						</button>
						<button type="button" data-action="done" class="btn-action">
							<img src="./img/tick.svg" alt="Done" width="20" height="20">
						</button>
						<button type="button" data-action="delete" class="btn-action">
							<img src="./img/cross.svg" alt="Delete" width="20" height="20">
						</button>
					</div>
				</li>`;

	tasksList.insertAdjacentHTML('beforeend', taskHTML);
}


function createNotification(title, options) {
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification(title, options);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, options);
                }
            });
        }
    }
}

function scheduleTaskNotifications() {
    const now = new Date();

    for (const task of tasks) {
        const taskDate = new Date(`${task.date}T${task.time}`);

        if (taskDate > now) {
            const timeUntilTask = taskDate - now;

            setTimeout(() => {
                createNotification(`Срок выполнения задачи "${task.name}" приближается!`, {
                    body: task.description
                });
            }, timeUntilTask);
        }
		console.log()
    };
}

scheduleTaskNotifications();


