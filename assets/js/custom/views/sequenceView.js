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
		this.caretPosition = 1;
		this.currentPositionEl = document.getElementById(this.options.currentPositionEl);
		this.lineNumsLeftEl = document.getElementById(this.options.lineNumsLeftEl);
		this.lineNumsRightEl = document.getElementById(this.options.lineNumsRightEl);
		this.listenTo(this.model, 'change', this.onModelChange);
		this.listenTo(this.collection, 'add', this._highlightSpan);
		this.listenTo(this.collection, 'remove', this.removeSpan);
		this.listenTo(this.collection, 'change', this.mouseover);
		this.listenTo(this.collection, 'reset', this.render);
		this._calculateLineProperties();
		$(window).resize(_.bind(this.render, this));
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
    	} else if (!F.inArray(event.keyCode, [65, 84, 71, 67, 78])){ // Allow only ATCGN
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
 		var spaced = this._getSpacedGlobalOffset(selection.focusNode, selection.focusOffset) + 1;
 		var unspaced = this._getUnspacedGlobalOffset(selection.focusNode, selection.focusOffset) + 1;
 		if (spaced % 11 === 0) {
 			this.caretPosition = '#';
 		} else {
 			this.caretPosition = unspaced;
 		}
 		this.currentPositionEl.innerHTML = '<b>' + this.caretPosition + '</b>';
 	},

	executeUserHighlight: function() {
		var that = this;
		var selection = this.getSelection();
		var range = this.getHighlightedRange(selection);
		F.Maybe(selection.toString()).bind(function(text) {
			that.collection.add({
				'id' : that.collection.generateSpanId(range), //prevents duplicates
				'start' : range[0],
				'end' : range[1],
				'text' : F.stripWS(text),
				'rangeEl' : selection.getRangeAt(0),
				'type' : 'user'
			});
		});
	},

	getHighlightedRange: function(selection) {
		var a = this._getUnspacedGlobalOffset(selection.anchorNode, selection.anchorOffset);
		var b = this._getUnspacedGlobalOffset(selection.focusNode, selection.focusOffset);
		return [Math.min(a,b), Math.max(a,b)];
	},

	_getSpacedGlobalOffset: function(textNode, offset) {
		var beforeSpans = this._getLeadingSpans(textNode);
		var sequence = this._getSequenceFromSpans(beforeSpans);
		return sequence.length + offset;
	},

	_getUnspacedGlobalOffset: function(textNode, offset) {
		var beforeSpans = this._getLeadingSpans(textNode);
		var sequence = F.stripWS(this._getSequenceFromSpans(beforeSpans));
		var cleanOffset = this._getUnspacedOffset(textNode, offset);
		return sequence.length + cleanOffset;
	},

	_getLeadingSpans: function(span) {
		var allSpans = Dom.getFlattenedChildren(this.el);
		var index = R.max(0, $.inArray(span, allSpans));
		return R.take(index, allSpans);
	},

	_getSequenceFromSpans: R.compose(R.join(''), R.pluck('nodeValue')),

	_getUnspacedOffset: function(textNode, offset) {
		var nSpaces = this._countSpaces(textNode.nodeValue.substr(0, offset));
		return offset - nSpaces;
	},

	_countSpaces: function(text) {
		return text.split(' ').length - 1;
	},

	_highlightSpan: function(models) {
		var that = this;
		R.map(function(model){
			var rangeEl = model.get('rangeEl');
			var selectionContents = rangeEl.extractContents();
			var span = that.createSequenceSpan(selectionContents, model);
			rangeEl.insertNode(span);
		}, F.array(models));
		this.clearSelection();
		this._cleanTextNodes();
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
		this.render();
	},
	
	render: function() {
		this._calculateLineProperties();
		this._printSequence();
		this._printLineNumbers();
		this._restoreCaretPosition();
	},

	_calculateLineProperties: function() {
		this.line = {};
		this.line.capacity = Dom.getLineCapacity(this.el);
		this.line.nColumns = getNumLineColumns(this.line.capacity);
	},

	_printSequence: function() {
		this.el.innerHTML = this._getSpacedSequence();
	},

	_getSpacedSequence: function() {
		var sequence = this.model.get('sequence').split('');
		var join = R.compose(R.trim, R.join('')); 
		return join(sequence.map(function(char, index) {
			if ((index + 1) % 10 === 0) {
				return char + ' ';
			}
			return char;
		}));
	},

	_printLineNumbers: function() {
		this.lineNumsLeftEl.innerHTML = '1<br>';
		this.lineNumsRightEl.innerHTML = '';
		for (var i = 1; i < this.el.getClientRects().length; i++){
			var lineLength = this._getLineLength(i);
			this.lineNumsLeftEl.innerHTML += (lineLength + 1) + '<br>';
			this.lineNumsRightEl.innerHTML += lineLength + '<br>';
		}
		this.lineNumsRightEl.innerHTML += this.model.get('sequence').length;
	},

	_getLineLength: function(row) {
		var seq = this.model.get('sequence');
		var x = row * 10 * this.line.nColumns;
		return (seq.length / x) > 1 ? x : (seq.length % x);
	},

	_restoreCaretPosition: function() {
		this.el.focus();
		this.caretPosition = 1;
		var range = this.collection.createDocumentRange([this.caretPosition-1, this.caretPosition-1]);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	},
	
	removeSpan: function(models) {
		var that = this;
		R.map(function(model){
			that.getSpans(model).contents().unwrap();			
		}, F.array(models));
		this._cleanTextNodes();
	},
	
	_cleanTextNodes: function() {
		var that = this;
		this._concatenateBrokenText(this.el);
		this.$el.find('*').each(function(index, el) {
			that._simplifyNode(el);
		});
	},

	_simplifyNode: function(el) {
		this._concatenateBrokenText(el);
		F.Maybe(el.childNodes[0]).onNothing(function() {
			el.parentNode.removeChild(el);
		});
	},

	_concatenateBrokenText: function(el) {
		el.normalize();
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
