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

// xTodo: create a function to generate a unique task id
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

// xTodo: create a function to create a task card
function createTaskCard(task) {
    // New Card
    const taskCard = $('<div>').addClass('card project-card draggable my-3').attr('data-project-id', task.id); // add in draggable class here?
    
    // Card Header
    const cardHeader = $('<div>').addClass('card-header h4').text(task.title);

    // Card Body
    const cardBody = $('<div>').addClass('card-body');

    // Card Text description
    const cardDescription = $('<p>').addClass('card-text').text(task.description);

    // Card Text due date
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);

    // Delete button
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-project-id', task.id);
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

// Todo: create a function to render the task list and make cards draggable
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
        // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
          // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
          const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');
          // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
          return original.clone().css({
            width: original.outerWidth(),
          });
        },
      });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    // createTaskCard(); // this creates my task card and appends elements to it
    // renderTaskList(); // this refreshes swim lanes with their cards
    // handleFormSubmit(); // this sends form data to local storage
    // readTaskFromStorage(); // this reads the task data from local storage

}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-project-id');
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

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) { // 166
    const tasks = readTaskFromStorage();
    const tasksId = ui.draggable[0].dataset.taskId;
    const newStatus = event.target.id;

    for (let task of tasks) {
        if (task.id === tasksId) {
            task.status = newStatus;
        }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();
}

// xTodo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#task-due-date').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

});