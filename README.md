TodoMVC jQuery
============================

There are two assignements from Watch&Code:
- read and comment reading.js file
- remove jquery from app.js

**How to Read Source Code**

Why it’s important?

1. Most of your time will be spent reading, not writing.
2. Simulates working at a company or open source project.
3. Fastest way to learn.
4. Reading makes you a better writer (just like English).
5. Learn how to ignore large parts of a codebase and get a piece-by-piece understanding.

Before you start
1. (x) Read the docs (if they exist): https://github.com/tastejs/todomvc/blob/master/app-spec.md
2. (x) Run the code
3. (x) Play with the app to see what the code is supposed to do
4. (x) Think about how the code might be implemented
5. (x) Get the code into an editor and run it (glitch)

The process
1. (x) Look at the file structure: app.css seems to be the main file
2. (x) Get a sense for the vocabulary
3. (x) Keep a note of unfamiliar concepts that you'll need to research later
4. (x) Do a quick read-through without diving into concepts from #3
5. (x) Test one feature with the debugger
6. (x) Document and add comments to confusing areas
7. (x) Research items in #3 only if required
8. (x) Repeat

Next level
1. () Replicate parts of the app by hand (in the console)
2. () Make small changes and see what happens
3. () Add a new feature

**1st reading:**  

Unfamiliar concepts
1. jQuery
2. What is the role of base.js?
3. What is the role of director.js?
4. Handlebars
5. uuid
6. localStorage
7. JSON

- (x) run App.destroy() method through the debugger
- (x) App.indexFromEl()

**2nd reading: get and manipulate data**

- (x) App.bindEvents()  
try to inspect a few event listeners  
see what 'this' is without using bind (the button)  
talk about method chaining
- (x) App.toggleAll()
- (x) App.toggle()
- (x) App.getActiveTodos():  
filter method (if true it keeps the item in the array)
- (x) App.getCompletedTodos()
- (x) App.getFilteredTodos()
- (x) App.destroyCompleted()

**3rd reading: creating to do object**

- (x) App.create()  
.trim()  
.which()
- (x) App.edit(): kind of display method to remove the old text and put the new one and focus  
.closest()  
.addClass()  
.find()  
.focus()
- (x) App.editKeyUp(): find out if we need to save data or not  
.data()  
.blur()
- (x) App.update(): really updates the data
- (x) util.uuid(): generate unique id with fixed _ position and bitwise operations

**Rendering:**

- (x) App.render()  
how handlebars works?  
understand the html
- (x) App.renderFooter()

**Utilities method:**

- (x) util.pluralize()  
ternary operators
- (x) util.store()
- (x) App.init()

**Questions:**

- I am not sure about the notation function(e), function(el)
- my button clear completed is not working
- why is there a very big function jquery?
- why event.target.tagName is not working? line 72