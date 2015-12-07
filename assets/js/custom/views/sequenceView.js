var SequenceView = Backbone.View.extend({
	
	defaults: {
		basicKeys: [
			8,  // backspace
			35, // end
			36, // home
			37, // left
			38, // up
			39, // right
			40, // down
			46  // delete
		],
		ctrlKeys: [
			35, // home
			36, // end
			67, // c (copy)
			86, // v (paste)
			88  // x (cut)
		]
	},

	constructor: function (options) {
        this.options = _.extend({}, this.defaults, options);
        Backbone.View.prototype.constructor.apply(this, arguments);
    },

	events: {
		'keydown': 'keyDown',
		'mouseup': 'mouseUp',
		'keyup': 'keyUp',
		'paste': 'refreshModel'
	},

	initialize: function(options) {
		this.currentPositionEl = document.getElementById(this.options.currentPositionEl);
		this.lineNumsLeftEl = document.getElementById(this.options.lineNumsLeftEl);
		this.lineNumsRightEl = document.getElementById(this.options.lineNumsRightEl);
		this.listenTo(this.model, 'change', this.onModelChange);
		this.listenTo(this.collection, 'add', this.highlightSpan);
		this.listenTo(this.collection, 'remove', this.removeSpan);
		this.listenTo(this.collection, 'change', this.mouseover);
		this.listenTo(this.collection, 'reset', this.printSequence);
		$(window).resize(_.bind(this.printSequence, this));
	},
 
 	keyDown: function(event) {
 		if (F.inArray(event.keyCode, this.options.basicKeys)){
 			return true;
 		} else if (event.ctrlKey || event.metaKey){
 			if (!F.inArray(event.keyCode, this.options.ctrlKeys)){
 				return false;
 			}
 		} else if (event.keyCode === 13){ // Disallow enter
      		return false;
    	} else if (!event.shiftKey){ // Allow only capital letters
    		return false;
    	} else if (!F.inArray(event.keyCode, [65, 84, 71, 67])){ // Allow only ATCG
    		return false;
    	}
 	},

 	mouseUp: function() {
 		this.displayCurrentPosition();
 		this.executeUserHighlight();
 	},

 	keyUp: function() {
 		this.displayCurrentPosition();
 		this.refreshModel();
 	},

 	refreshModel: function() {
 		this.model.set('sequence', this.el.textContent);
 	},

 	displayCurrentPosition: function() {
 		selection = this.getSelection(); 
 		var pos = this.getGlobalOffset(selection.focusNode, selection.focusOffset) + 1;
 		this.currentPositionEl.innerHTML = '<b>' + pos + '</b>';
 	},

	executeUserHighlight: function() {
		var that = this;
		var selection = this.getSelection();
		var range = this.getHighlightedRange(selection);
		F.Maybe(selection.toString()).bind(function(text){
			that.collection.add({
				'id' : that.collection.generateSpanId(range), //prevents duplicates
				'start' : range[0],
				'end' : range[1],
				'text' : text,
				'rangeEl' : selection.getRangeAt(0),
				'type' : 'user'
			});
		});
	},

	getHighlightedRange: function(selection) {
		var a = this.getGlobalOffset(selection.anchorNode, selection.anchorOffset);
		var b = this.getGlobalOffset(selection.focusNode, selection.focusOffset);
		return [Math.min(a,b), Math.max(a,b)];
	},

	getGlobalOffset: function(textNode, offset) {
		var children = Dom.getFlattenedChildren(this.el);
		var index = R.max(0, $.inArray(textNode, children));
		var beforeSpans = R.take(index, children);
		var sequence = this.getSequenceFromSpans(beforeSpans);
		return sequence.length + offset;
	},

	getSequenceFromSpans: R.compose(R.join(''), R.pluck('nodeValue')),

	highlightSpan: function(models) {
		var that = this;
		R.map(function(model){
			var rangeEl = model.get('rangeEl');
			var selectionContents = rangeEl.extractContents();
			var span = that.createSequenceSpan(selectionContents, model);
			rangeEl.insertNode(span);
		}, F.array(models));
		this.clearSelection();
		this.cleanText();
		this.calculateSpanDepths();
	},

	createSequenceSpan: function(contents, model) {
		var span = document.createElement('span');
		span.appendChild(contents);
		span.setAttribute('class', 'sequence-highlight-' + model.getCssClass());
		span.setAttribute('id', model.get('id'));
		span.setAttribute('data-start', model.get('start'));
		span.setAttribute('data-end', model.get('end'));
		return span;
	},

	getSelection: function() {
		if (document.selection) {
        	return document.selection;
	    } else if (window.getSelection) {
        	return window.getSelection();
	    }
	},

	clearSelection: function() {
	    if (document.selection) {
        	document.selection.empty();
	    } else if (window.getSelection) {
        	window.getSelection().removeAllRanges();
	    }
	},

	onModelChange: function() {
		this.collection.reset();
		this.printSequence();
	},
	
	printSequence: function() {
		this.el.innerHTML = this.model.get('sequence');
		this.charsPerLine = Dom.getLineCapacity(this.el);
		this.printLineNumbers();
	},

	printLineNumbers: function() {
		this.lineNumsLeftEl.innerHTML = '1<br>';
		this.lineNumsRightEl.innerHTML = '';
		for (var i = 1; i < this.el.getClientRects().length; i++){
			var lineLength = this.getLineLength(i);
			this.lineNumsLeftEl.innerHTML += (lineLength + 1) + '<br>';
			this.lineNumsRightEl.innerHTML += lineLength + '<br>';
		}
		this.lineNumsRightEl.innerHTML += this.model.get('sequence').length;
	},

	getLineLength: function(row) {
		var seq = this.model.get('sequence');
		var x = row * this.charsPerLine;
		return (seq.length / x) > 1 ? x : (seq.length % x);
	},

	removeSpan: function(models) {
		var that = this;
		R.map(function(model){
			that.getSpans(model).contents().unwrap();			
		}, F.array(models));
		this.cleanText();
	},
	
	cleanText: function() {
		var that = this;
		this.el.normalize(); // concat broken text
		this.$el.find('*').each(function(index, el){
			that.simplifyText(el);
		});
	},

	simplifyText: function(el) {
		var that = this;
		el.normalize(); // concat all broken text
		F.Maybe(el.childNodes[0]).maybeFn(
			function(){
				$(el).remove();
			}, 
			function(firstChild){
				F.Maybe(firstChild.nodeValue).bind(function(text){
					el.childNodes[0].nodeValue = F.DNA(text);
				});				
			}
		);
	},

	calculateSpanDepths: function() {
		var that = this;
		this.collection.each(function(model){
			var span = $('#' + model.get('id'));
			var depth = span.parentsUntil(that.$el).length;
			model.set('depth', depth);
		});
	},

	mouseover: function(models) {
		var that = this;
		R.map(function(model){
			var $spans = that.getSpans(model);
			if (model.get('highlight')){
				$spans.addClass('sequence-highlight-hover-' + model.getCssClass());
			} else {
				$spans.removeClass('sequence-highlight-hover-' + model.getCssClass());
			}
		}, F.array(models));
	},

	getSpans: function(model) {
		// select by id attribute instead of # so that an array of elements with the same id can be returned
		return $('[id=' + model.get('id') + ']');
	}
});
