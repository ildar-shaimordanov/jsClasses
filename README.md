Эмуляция классов на JavaScript
==============================

Вариация на тему эмуляции классического ООП в JavaScript. 

Форк оригинальной работы https://github.com/devote/jsClasses.

Создание классов
----------------

Для создание класса достаточно объявить имя класса и присвоить ему объект.

Пример создания пустого класса:

```javascript
// "declare " the empty class Empty
var Empty = Class( {} );

// ... and create the object
var e = new Empty();
```

Пример создания более осмысленного класса. 

```javascript
var X = Class({
	// The object's constructor
	constructor: function(x)
	{
		// Store an argument to properties
		this.p = x;
	}, 
	// An object's method
	alert: function()
	{
		// Show the property
		alert(this.p);
	}
});

// Instantiate two objects
var x1 = new X(1);
var x2 = new X(1000);

// ... and call their methods
x1.alert();
x2.alert();
```

Приватные свойства
------------------

Для работы с приватными свойтвами необходимо объявить класс, передав в качестве аргумента функцию. Фактически, функция, являясь оберткой, возвращающей структуру объекта, создаст новое пространство имен, которое будет доступно только одному экземпляру данного класса. 

```javascript
//The class is able to process with private data
var X = Class(function()
{
	// Private variable
	// It is visible from the instance of the object
	// It is unique per each instance
	var p;

	return {
		// Constructor
		constructor: function(x)
		{
			// Store an argument to the private variable
			p = x;
		}, 
		// Accessor to the private variable
		alert: function()
		{
			// Display the variable
			alert(p);
		}
	};
});

var x1 = new X(1);
var x2 = new X(1000);

x1.alert();
x2.alert();
```

Наследование
------------

Наследование реализовано просто. 

```javascript
// The class "X" was declared in the previous example
// We inherits all properties and method of the parental class
// Parental methods can be overwritten by the inherited class
// It is possible to call parental methods via the special property
var Y = Class(X, function()
{
	// Private variable
	var p;

	return {
		// Constructor
		constructor: function(x, y)
		{
			// Call the parental constructor
			this.parent.constructor(x);
			// Store its own argument privately
			p = y;
		}, 
		// Accessor
		alert: function()
		{
			// Call the parental methos to display parentall property
			this.parent.alert();
			// Display the own property
			alert(p);
		}
	};
});

var y = new Y(-100, 100);
y.alert();
```

instanceof
----------

Стандартный оператор instanceof в данной реализации не работает. Для правильной проверки принадлежности объекта классу существует метод Class.instanceOf

```javascript
// The "instanceof" operator doesn't work properly
// That's why we need to implement our own statuic method called as "Class.instanceOf", 
// that checks the chain of inheritance looking over special property of each instance in the chain
alert([
	y instanceof Object, // == ttrue, because all objects are derived from Object
	y instanceof X, // == false, because the parental constructor is not in the chain of prototypes
	y instanceof Y, // == true, "y" is instantiated from the class "Y"

	Class.instanceOf(y, Object), // == true
	Class.instanceOf(y, X), // == true
	Class.instanceOf(y, Y), // == true
]);
```
