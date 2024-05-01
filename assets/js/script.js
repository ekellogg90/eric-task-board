const taskFormEl = $('#task-form');
const taskTitleEl = $('#task-title');
const taskDueDateEl = $('#task-due-date');
const taskDescriptionEl = $('#task-description');

// Retrieve tasks and nextId from localStorage
function readTaskFromStorage() {
    let taskList = JSON.parse(localStorage.getItem("tasks"));
    if (!taskList) {
        taskList = [];
    }
    return taskList;
}

// Generate a unique task id
function readNextIdFromStorage() {
    let nextId = JSON.parse(localStorage.getItem("nextId"));
    if (!nextId) {
        nextId = 1;  // set equal to 1 if null, increment the Id if not null
    } else {
        nextId++;
    }
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return nextId;
}

// Saves the taskList to local storage
function saveTaskToStorage(taskList) {
    localStorage.setItem('tasks', JSON.stringify(taskList));
}

// Calls handleFormSubmit function on form submittal
taskFormEl.on('submit', handleFormSubmit);

function handleFormSubmit() {
    const taskTitle = taskTitleEl.val().trim();
    const taskDueDate = taskDueDateEl.val();
    const taskDescription = taskDescriptionEl.val();

    const newTask = {
        id: readNextIdFromStorage(),
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        status: 'to-do',
    };

    const taskList = readTaskFromStorage();

    taskList.push(newTask);

    saveTaskToStorage(taskList);

    renderTaskList();
}

// Create a task card
function createTaskCard(task) {
    // New Card
    const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.id);
    
    // Card Header
    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);

    // Card Body
    const cardBody = $('<div>').addClass('card-body');

    // Card Text description
    const cardDescription = $('<p>').addClass('card-text').text(task.description);

    // Card Text due date
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);

    // Delete button
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);
    cardDeleteBtn.on('click', handleDeleteTask);

    // Card background
    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
    
        // Due today logic
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    // Append it all together
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    return taskCard;
}

// Render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTaskFromStorage();

    const todoCards = $('#todo-cards');
    todoCards.empty();

    const inProgList = $('#in-progress-cards');
    inProgList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    for (let task of tasks) {
        if (task.status === 'to-do') {
            todoCards.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgList.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneList.append(createTaskCard(task));
        }
    }

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (e) {
          const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
          // Return the clone with the width set to the width of the original card
          return original.clone().css({
            width: original.outerWidth(),
          });
        },
      });
}

// Handle deleting a task
function handleDeleteTask(event){
    const taskId = parseInt($(this).attr('data-task-id'));
    const tasks = readTaskFromStorage();
  
    // Loop through the projects array and remove the project with the matching id.
    tasks.forEach((task) => {
      if (task.id === taskId) {
        tasks.splice(tasks.indexOf(task), 1);
      }
    });

    saveTaskToStorage(tasks);
    renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const tasks = readTaskFromStorage();

    const tasksId = parseInt(ui.draggable[0].dataset.taskId);
    const newStatus = event.target.id;

    for (let task of tasks) {
        if (task.id === tasksId) {
            task.status = newStatus;
            console.log(`task.id ${task.id}`);
            console.log(`tasksId ${tasksId}`);
        }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();
    console.log(tasks);
    console.log(tasksId);
    console.log(newStatus);
}

// On page load, render the task list, add event listeners, and make lanes droppable
$(document).ready(function () {
    renderTaskList();
    // date picker
    $('#task-due-date').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

});