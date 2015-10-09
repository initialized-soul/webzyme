var TextAreaView = Backbone.View.extend({
	
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
		this.cleanText();
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
		var tree = this.$el.find('*').toArray();
		var index = $.inArray(node.parentElement, tree);
		var beforeSpans = R.take(index, tree);
		var sequence = R.reduce(function(seq, el){
			return seq + F.Maybe(el.childNodes[0].nodeValue).def('');
		}, '', beforeSpans);
		return sequence.length + offset;
	},

	generateId: function(range) {
		return 'Span-' + range.join('-');
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

	cleanText: function() {
		var that = this;
		this.simplifyText(this.el);
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
