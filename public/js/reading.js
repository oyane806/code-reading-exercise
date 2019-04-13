/*global jQuery, Handlebars, Router */
jQuery(function ($) {
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
        return (store && JSON.parse(store)) || [];
      }
    }
  };
  var App = {
    init: function () {
      this.todos = util.store('todos-jquery'); //retrieve data from the local storage
      this.todoTemplate = Handlebars.compile($('#todo-template').html()); //check the html, handlebars takes an html
      this.footerTemplate = Handlebars.compile($('#footer-template').html());
      this.bindEvents();
      new Router({
        '/:filter': function (filter) {
          this.filter = filter;
          this.render();
        }.bind(this)
      }).init('/all');      
    },
    bindEvents: function () { //looks like the handlers object
      $('#new-todo').on('keyup', this.create.bind(this)); 
      //here this refers to the button that is why we are using bind
      $('#toggle-all').on('change', this.toggleAll.bind(this));
      $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
      $('#todo-list') //looks like event delegation here attached to the parent element
      //method chaining
        .on('change', '.toggle', this.toggle.bind(this))
        .on('dblclick', 'label', this.edit.bind(this))
        .on('keyup', '.edit', this.editKeyup.bind(this))
        .on('focusout', '.edit', this.update.bind(this))
        .on('click', '.destroy', this.destroy.bind(this));
    },
    render: function () {
      var todos = this.getFilteredTodos();
      $('#todo-list').html(this.todoTemplate(todos)); //inject the html into the element todo-list
      $('#main').toggle(todos.length > 0); //toggle() show or hide if lenght>0 it will show the element
      $('#toggle-all').prop('checked', this.getActiveTodos().length === 0); //if everything is checked then toggle-all is checked
      this.renderFooter();
      $('#new-todo').focus();
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
      $('#footer').toggle(todoCount > 0).html(template); //injecting the template into the footer element
    },
    toggleAll: function (e) {
      //check the checkbox, if checked then true
      var isChecked = $(e.target).prop('checked');
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
      var id = $(el).closest('li').data('id');
      var todos = this.todos;
      var i = todos.length;
      while (i--) {
        if (todos[i].id === id) {
          return i;
        }
      }
    },
    create: function (e) {
      var $input = $(e.target);
      var val = $input.val().trim(); //remove whitesapce
      if (e.which !== ENTER_KEY || !val) { //if the last keyboard letter is not enter exit the function
        return;
      }
      this.todos.push({ //otherwise create a new object inside todos
        id: util.uuid(),
        title: val,
        completed: false
      });
      $input.val(''); //clean the input field
      this.render();
    },
    toggle: function (e) {
      //
      var i = this.indexFromEl(e.target);
      //if true then false, if false then true
      this.todos[i].completed = !this.todos[i].completed;
      this.render();
    },
    edit: function (e) {
      var $input = $(e.target).closest('li').addClass('editing').find('.edit'); //chaining method
      //add class edit to apply a css style not displayed
      //then it will find an element with the class .edit, it is the input
      $input.val($input.val()).focus(); //this is not relevant to apply 2 times $input.val()
      //focus means put the cursor inside the cell
    },
    editKeyup: function (e) {
      if (e.which === ENTER_KEY) {
        e.target.blur(); //opposite of focus
      }
      if (e.which === ESCAPE_KEY) {
        $(e.target).data('abort', true).blur(); //store the data ('abort' key, true) in the element and opposite of focus
      }
    },
    update: function (e) {
      var el = e.target;
      var $el = $(el); //wrap the element inside a jquery element
      var val = $el.val().trim();
      if (!val) { //if (!val) true then destroy because Boolean(!'') = true
        this.destroy(e);
        return;
      }
      if ($el.data('abort')) { //data stored from App.editKeyup, if true then reinitialize to false
        $el.data('abort', false);
      } else {
        this.todos[this.indexFromEl(el)].title = val; //change the value of title
      }
      this.render();
    },
    destroy: function (e) {
      this.todos.splice(this.indexFromEl(e.target), 1);
      this.render();
    }
  };
  App.init();
});
