/*global jQuery, Handlebars, Router */
/*jQuery(function ($) {*/
'use strict';
Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
  //check if a===b, if yes then use the first handlebars template otherwise the other one
  //options.inverse return the other handlebars template after else
  //this is the same that what is passed to the footer template (the parent template)
});
var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var util = {
  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  },
  pluralize: function (count, word) {
    return count === 1 ? word : word + 's';
  },
  store: function (namespace, data) {
    if (arguments.length > 1) { //save data
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else { //retrieve data
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || []; //if no store then empty array
    }
  }
}
var newTodo = document.getElementById('new-todo'); 
var toggleAll = document.getElementById('toggle-all');
var todoList = document.getElementById('todo-list');
var main = document.getElementById('main');
var todoList = document.getElementById('todo-list');
var footer = document.getElementById('footer');
var todoTemplate = document.getElementById('todo-template').textContent;
var footerTemplate = document.getElementById('footer-template').textContent;
var App = {
  init: function () {
    this.todos = util.store('todos-jquery'); //retrieve data from the local storage
    this.todoTemplate = Handlebars.compile(todoTemplate); //check the html, handlebars takes an html
    this.footerTemplate = Handlebars.compile(footerTemplate);
    this.bindEvents();
    new Router({
      '/:filter': function (filter) {
        this.filter = filter; //if all then go to url all
        this.render();
      }.bind(this) //should be bound to App object otherwise = to router
    }).init('/all');      
  },
  bindEvents: function () { //looks like the handlers object
    newTodo.addEventListener('keyup', this.create.bind(this));
    toggleAll.addEventListener('change', this.toggleAll.bind(this));
    footer.addEventListener('click', function(event) {
      if (event.target.className === 'clear-completed') {
        App.destroyCompleted();
      }});
    //clearCompleted.addEventListener('click', App.destroyCompleted());
    todoList.addEventListener('change', function(event) {
      if (event.target.className === 'toggle') {
        App.toggle();
      }});
    todoList.addEventListener('click', function(event) {
      //if (event.target.tagName == 'label') why is it not working?
      if (event.target.className === 'editable') {
        App.edit();
      }});
    todoList.addEventListener('keyup', function(event) {
      if (event.target.className === 'edit') {
        App.editKeyup();
      }});
    todoList.addEventListener('focusout', function(event) {
      if (event.target.className === 'edit') {
        App.update();
      }});
    todoList.addEventListener('click', function(event) {
      if (event.target.className === 'destroy') {
        App.destroy();
      }});
  },
  render: function () {
    var todos = this.getFilteredTodos();
    todoList.innerHTML = this.todoTemplate(todos); //inject the html into the element todo-list
    //toggle() show or hide if lenght>0 it will show the element
    if (todos.lenth > 0) {
      main.style.display = 'none';
    } else {
      main.style.display = 'block';
    }
    //if everything is checked then toggle-all is checked
    if (this.getActiveTodos().length === 0) {
      toggleAll.checked = true; 
    } else {
      toggleAll.checked = false;
    } 
    this.renderFooter();
    newTodo.focus();
    util.store('todos-jquery', this.todos); //store the array
  },
  renderFooter: function () {
    var todoCount = this.todos.length;
    var activeTodoCount = this.getActiveTodos().length;
    var template = this.footerTemplate({ //the below are data passed to handlebars
      activeTodoCount: activeTodoCount,
      activeTodoWord: util.pluralize(activeTodoCount, 'item'),
      completedTodos: todoCount - activeTodoCount,
      filter: this.filter
    });
    //injecting the template into the footer element
    if (todoCount > 0) {
      footer.style.display = 'block';
      footer.innerHTML = template;
    } else {
      footer.style.display = 'none';
    }
  },
  toggleAll: function (e) {
    //check the checkbox, if checked then true
    //var isChecked = $(e.target).prop('checked');
    var isChecked = e.target.checked;
    this.todos.forEach(function (todo) {
      todo.completed = isChecked; //if checked then true
    });
    this.render();
  },
  getActiveTodos: function () {
    return this.todos.filter(function (todo) {
      return !todo.completed;
    }); //return only to dos not completed
  },
  getCompletedTodos: function () {
    return this.todos.filter(function (todo) {
      return todo.completed;
    });
  },
  //this is the first method used and then it displays different filtered views
  getFilteredTodos: function () {
    if (this.filter === 'active') {
      return this.getActiveTodos();
    }
    if (this.filter === 'completed') {
      return this.getCompletedTodos();
    }
    return this.todos;
  },
  destroyCompleted: function () {
    this.todos = this.getActiveTodos();
    this.filter = 'all'; //the tab goes back to the page 'all'
    this.render();
  },
  // accepts an element from inside the `.item` div and
  // returns the corresponding index in the `todos` array
  indexFromEl: function (el) {
    //var ul = document.querySelector('ul');
    var id = event.target.closest('li').getAttribute('data-id');
    //apparently I do not need to listen to an event
    var todos = this.todos;
    var i = todos.length;
    while (i--) {
      if (todos[i].id === id) {
        return i;
      }
    }
  },
  create: function (e) {
    var val = event.target.value.trim();
    if (e.which !== ENTER_KEY || !val) { //if the last keyboard letter is not enter exit the function
      return;
    }
    this.todos.push({ //otherwise create a new object inside todos
      id: util.uuid(),
      title: val,
      completed: false
    });
    event.target.value=''; //clean the input field; example where val = '' is not enough
    this.render();
  },
  toggle: function (e) {
    //
    var i = this.indexFromEl(event.target);
    //if true then false, if false then true
    this.todos[i].completed = !this.todos[i].completed;
    this.render();
  },
  edit: function (e) {
    event.target.closest('li').setAttribute('class','editing');
    var input = event.target;
    //var $input = $(e.target).closest('li').addClass('editing').find('.edit'); //chaining method
    //add class edit to apply a css style not displayed
    //then it will find an element with the class .edit, it is the input
    //$input.val($input.val()).focus(); //this is not relevant to apply 2 times $input.val()
    event.target.value = input.focus();
    //focus means put the cursor inside the cell
  },
  editKeyup: function (e) {
    if (event.which === ENTER_KEY) {
      event.target.blur(); //opposite of focus
    }
    if (event.which === ESCAPE_KEY) {
      //event.target.data('abort', true).blur(); //store the data ('abort' key, true) in the element and opposite of focus
      event.target.setAttribute('abort', 'true')
      event.target.blur();
    }
  },
  update: function (e) {
    var val = event.target.value.trim()
    //remove the todo
    if (!val) { //if (!val) true then destroy because Boolean(!'') = true
      this.destroy(event);
      return;
    }
    //tap esc
    if (event.target.getAttribute('abort')) {
      //if ($el.data('abort')) { //data stored from App.editKeyup, if true then reinitialize to false
      event.target.setAttribute('abort', 'false');
    } else {
      //modify
      this.todos[this.indexFromEl(event.target)].title = val; //change the value of title
    }
    this.render();
  },
  destroy: function (e) { //why do we need to put e here? and not event? undefined with the debugger
    this.todos.splice(this.indexFromEl(event.target), 1);
    this.render();
  }
}
App.init();
