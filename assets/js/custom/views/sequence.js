var SequenceView = Backbone.View.extend({
	
	events: {
		'mouseup': 'highlight',
		'keydown': 'keystroke',
		'paste': 'userPaste'
	},

	initialize: function() {
		this.listenTo(this.collection, 'add', this.highlightSpan);
		this.listenTo(this.collection, 'remove', this.removeSpan);
		this.listenTo(this.collection, 'change', this.mouseover);
		this.listenTo(this.collection, 'reset', this.removeAllSpans);
		this.calculateLineCapacity();
		this.printSequence();
	},
 
 	keystroke: function(event) {
 		if (F.inArray(event.keyCode, [8, 46, 35, 36, 37, 38, 39, 40])){ // Allow basic keys
 			return true;
 		} else if (event.ctrlKey || event.metaKey){
 			if (!F.inArray(event.keyCode, [35, 36, 67, 86, 88])){ // Allow home, end, cut, copy, paste
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

 	userPaste: function(event) {
 		var text = this.getClipboardText(event);
 		var el = this.getFocusedSpan();
 		var origText = F.Maybe(el.childNodes[0].nodeValue).def('');
 		el.childNodes[0].nodeValue = F.insertAt(this.getSelection().focusOffset, text, origText);
 		this.collection.reset();
 		this.refreshModel();
 		return false;
 	},

 	getClipboardText: function(event) {
 		var text = event.originalEvent.clipboardData.getData('text/plain');
 		return this.regexClean(text);
 	},

 	// if the user cursor is on a text region then just return the parentElement,
 	// otherwise if there is no text in the textarea, we have to create an empty text node for pasting
 	getFocusedSpan: function() {
 		var focusNode = this.getSelection().focusNode;
 		if (focusNode === document.getElementById('textarea_sequence')){
 			var textNode = document.createTextNode('');
 			focusNode.appendChild(textNode);
 			return focusNode;
 		}
 		return focusNode.parentElement;
 	},

 	calculateLineCapacity: function() {
 		this.el.innerHTML = 'A';
 		var initialHeight = this.el.offsetHeight;
 		while (this.el.offsetHeight <= initialHeight){
 			this.el.innerHTML += 'A';
 		}
 		this.charsPerLine = this.el.innerHTML.length - 1;
 		this.el.innerHTML = '';
 	},

	highlight: function() {
		var that = this;
		var selection = this.getSelection();
		var range = this.getHighlightedRange(selection);
		F.Maybe(selection.toString()).bind(function(text){
			that.collection.add({
				'id' : that.generateId(range), //prevents duplicates
				'start' : range[0],
				'end' : range[1],
				'text' : text,
				'rangeEl' : selection.getRangeAt(0)
			});
		});
	},

	getHighlightedRange: function(selection) {
		var a = this.getGlobalOffset(selection.anchorNode, selection.anchorOffset);
		var b = this.getGlobalOffset(selection.focusNode, selection.focusOffset);
		return [Math.min(a,b), Math.max(a,b)];
	},

	getGlobalOffset: function(node, offset) {
		var that = this;
		var children = this.el.childNodes;
		var index = R.max(0, $.inArray(node, children));
		var beforeSpans = R.take(index, children);

		var sequence = this.reduceSequence(beforeSpans, function(el){
			var nodes = R.prepend(el, el.childNodes);
			return that.reduceSequence(nodes, function(node){return node.nodeValue;});
		})
		return sequence.length + offset;
	},

	reduceSequence: function(xs, fn) {
		return R.reduce(function(seq, x){
			return seq + F.Maybe(fn(x)).def('');
		}, '', xs);
	},

	generateId: function(range) {
		return 'Span-' + range.join('-');
	},

	highlightSpan: function(models) {
		var that = this;
		R.map(function(model){
			var rangeEl = model.get('rangeEl');
			var selectionContents = rangeEl.extractContents();
			var span = that.createSpan(selectionContents, model.get('id'));
			rangeEl.insertNode(span);
		}, F.array(models));
		this.clearSelection();
	},

	createSpan: function(contents, id) {
		var span = document.createElement('span');
		span.appendChild(contents);
		span.setAttribute('class', 'sequence-highlight');
		span.setAttribute('id', id);
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

	refreshModel: function() {
		this.model.set('sequence', this.el.textContent);
	},

	printSequence: function() {
		var cleanSequence = this.regexClean(this.model.get('sequence'));
		this.$el.html(cleanSequence);
	},

	removeAllSpans: function(models, options) {
		var removedModels = options.previousModels;
		this.removeSpan(removedModels);
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

	simplifyText: function(el){
		var that = this;
		el.normalize(); // concat all broken text
		F.Maybe(el.childNodes[0]).maybeFn(
			function(){
				$(el).remove();
			}, 
			function(children){
				F.Maybe(children.nodeValue).bind(function(text){
					el.childNodes[0].nodeValue = that.regexClean(text);
				});				
			}
		);
	},

	regexClean: function(text){
		return text.replace(/[^ATGC]/g, '');
	},

	mouseover: function(models) {
		var that = this;
		R.map(function(model){
			var $spans = that.getSpans(model);
			if (model.get('highlight')){
				$spans.addClass('sequence-highlight-hover');
			} else {
				$spans.removeClass('sequence-highlight-hover');
			}
		}, F.array(models));
	},

	getSpans: function(model) {
		// select by id attribute instead of # so that an array of elements with the same id can be returned
		return $('[id=' + model.get('id') + ']');
	}
});
