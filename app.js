var budgetController = (function(){

	// function constructor
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if (totalIncome > 0){
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}

	// function constructor
	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum = sum + current.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function(type, des, val){
			var newItem, ID;

			if (data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if (type === 'exp'){
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc'){
				newItem = new Income(ID, des, val);
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		deleteItem: function(type, id){
			// return an array
			var ids = data.allItems[type].map(function(current){
				return current.id;
			});

			var index = ids.indexOf(id);
			// console.log(index);

			if (index !== -1){
				// start at position index, delete one element
				data.allItems[type].splice(index, 1);
			}
		}, 

		calculateBudget: function(){
			// calculate total income, total expenses
			calculateTotal('inc');
			calculateTotal('exp');

			// calculate budget
			data.budget = data.totals.inc - data.totals.exp;

			// calculate percentage of income that we spent
			if (data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function(){
			data.allItems.exp.forEach(function(current){
				current.calcPercentage(data.totals.inc);
			})
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		}, 

		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(current){
				return current.getPercentage();
			})
			return allPerc;
		},
	}

})();


var UIController = (function(){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type){
			num = Math.abs(num);
			num = num.toFixed(2); // returns a string

			var numSplit = num.split('.');

	        var int = numSplit[0];
	        if (int.length > 3) {
	            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
	        }

	        var dec = numSplit[1];

	        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

		};

	var nodeListForEach = function(list, callback){
		for (var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};

	return {
		getinput: function(){
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type){
			var html, newHtml, element;
			// create HTML string

			if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

			// replace placeholder with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert into HTML file
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		clearFields: function(){
			// returns a list
			var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// turns the list into an array
			var fieldsArr = Array.prototype.slice.call(fields);

			// clear fields
			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});

			// set focus back to the first field
			fieldsArr[0].focus();
		},

		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		}, 
		
		displayBudget: function(obj){
			var type;

			obj.budget > 0? type = 'inc': type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields, function(current, index){
				if (percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		displayMonth: function(){
			var now = new Date();
			var year = now.getFullYear();
			var month = now.getMonth();
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changeType: function(){
			var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(current) {
               current.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstring: function(){
			return DOMstrings;
		}
	}

})();


var controller = (function(budgetCtrl, UICtrl){

	var setupEventListeners = function(){
		var DOM = UICtrl.getDOMstring();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event){
			if (event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	}

	var updateBudget = function(){
		// calculate the budget
		budgetCtrl.calculateBudget();

		// return the budget
		var budget = budgetCtrl.getBudget();
		// console.log(budget);

		// display the budget on the UI
		UICtrl.displayBudget(budget);
	}

	var updatePercentage = function(){
		// calculate the percentage
		budgetCtrl.calculatePercentages();

		// return the percentage
		var percentages = budgetCtrl.getPercentages();
		// console.log(percentages);

		// display the percentage on the UI
		UICtrl.displayPercentages(percentages);
	}

	var ctrlAddItem = function(){
		// get input data
		var input = UICtrl.getinput();
		// console.log(input);

		if (input.description !== "" && !isNaN(input.value) && input.value > 0){
			// add item to the budget controller
			var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			
			// add item to the UI, clear fields
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();

			// calculate and update budget
			updateBudget();

			// calculate and update percentage
			updatePercentage();
		}
	}

	var ctrlDeleteItem = function(event){
		// traverse DOM element
		var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		// console.log(itemID);

		if (itemID){
			// returns an array
			var splitID = itemID.split('-');
			var type = splitID[0];
			var ID = parseInt(splitID[1]);

			// delete the item from the data struct
			budgetCtrl.deleteItem(type, ID);

			// delete from UI
			UICtrl.deleteListItem(itemID);

			// re-calculate budget
			updateBudget();

			// calculate and update percentage
			updatePercentage();
		}
	}

	return {
		init: function(){
			UIController.displayMonth();
			UIController.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();

