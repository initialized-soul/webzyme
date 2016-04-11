var SequenceView = Backbone.View.extend(SequenceViewHighlightRenderer).extend({
	
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
		this._initializeContextMenu();
		this.listenTo(this.model, 'change', this.onModelChange);
		this.listenTo(this.collection, 'add', this._renderHighlights);
		this.listenTo(this.collection, 'remove', this.removeSpan);
		this.listenTo(this.collection, 'change', this.mouseover);
		this.listenTo(this.collection, 'reset', this.render);
		this._calculateLineProperties();
		$(window).resize(_.bind(this.render, this));
	},
 
 	_initializeContextMenu: function() {
 		var that = this;
 		this.$el.contextmenu({
			target: this.options.$contextMenuEl,
			before: function() {
			    that.userSelection = that._getUserSelection();
		  	},
			onItem: function(context, event) {
				if (event.target.name === 'highlight') {
					that._highlightAction(that.userSelection);
				} else {
					that._toNewSequence(that.userSelection);
				}
  			}
		});
 	},

 	_toNewSequence: function(userSelection) {
 		var that = this;
		F.Maybe(userSelection).bind(function(selection) {
			that.trigger('newsequence', new SequenceModel({
				name: 'New Sequence',
				sequence: selection.text
			}));
		});
 	},

 	keyDown: function(event) {
        var that = this;
 		if (F.inArray(event.keyCode, this.options.basicKeys)) { // Allow basic keys
 			return true;
 		} else if (event.ctrlKey || event.metaKey) { // Allow certain keys when CTRL is held
 			if (!F.inArray(event.keyCode, this.options.ctrlKeys)) {
 				return false;
 			}
 		} else if (event.keyCode === 13) { // Disallow enter
      		return false;
    	} else {
            return F.Maybe(this._getUserSelection()).maybeFn(function() {
                return F.inArray(event.keyCode, [65, 84, 71, 67, 78]); // Allow only ATCGN
            }, function(selection) {
                if (event.keyCode === 72) { // highlight
                    that._highlightAction(selection);
                } else if (event.keyCode === 78) { // new sequence
                    that._toNewSequence(selection);
                }
                that.options.$contextMenuEl.removeClass('open');
                return false;
            });
    	}
 	},

 	keyUp: function(event) {
        if (!F.inArray(event.keyCode, [37, 38, 39, 40])){ // Arrow keys
    		this._displayCaretPosition(this._findCaretPosition());
 		    this.refreshModel();
        }
 	},

 	refreshModel: function() {
 		this.model.set('sequence', this.el.textContent);
 	},

 	mouseUp: function() {
 		this._displayCaretPosition(this._findCaretPosition());
 	},

 	_findCaretPosition: function() {
         var that = this;
        return F.Maybe(this._getUserSelection()).maybe('#', function(selection) {
            var spaced = that._getSpacedGlobalOffset(selection.focusNode, selection.focusOffset) + 1;
            var unspaced = that._getUnspacedGlobalOffset(selection.focusNode, selection.focusOffset) + 1;
            return (spaced % 11 === 0) ? '#' : unspaced;
        });
 	},

	_highlightAction: function(userSelection) {
		var that = this;
        F.Maybe(userSelection).bind(function(selection) {         
		    that.collection.add({
				'range' : that.getHighlightedRange(selection),
				'text' : F.stripWS(selection.text),
				'type' : 'user'
			});
			that._restoreCaretPosition();
        });
	},

	getHighlightedRange: function(selection) {
		var a = this._getUnspacedGlobalOffset(selection.anchorNode, selection.anchorOffset);
		var b = this._getUnspacedGlobalOffset(selection.focusNode, selection.focusOffset);
		return [Math.min(a,b), Math.max(a,b) - 1];
	},

	_getSpacedGlobalOffset: function(textNode, offset) {
		var beforeSpans = this._getLeadingSpans(textNode);
		var sequence = Dom.joinTextNodes(beforeSpans);
		return sequence.length + offset;
	},

	_getUnspacedGlobalOffset: function(textNode, offset) {
		var beforeSpans = this._getLeadingSpans(textNode);
		var sequence = F.stripWS(Dom.joinTextNodes(beforeSpans));
		var cleanOffset = this._getUnspacedOffset(textNode, offset);
		return sequence.length + cleanOffset;
	},

	_getLeadingSpans: function(span) {
		var allSpans = Dom.getFlattenedChildren(this.el);
		var index = R.max(0, $.inArray(span, allSpans));
		return R.take(index, allSpans);
	},

	_getUnspacedOffset: function(textNode, offset) {
		var nSpaces = this._countSpaces(textNode.nodeValue.substr(0, offset));
		return offset - nSpaces;
	},

	_countSpaces: function(text) {
		return text.split(' ').length - 1;
	},

	_getUserSelection: function() {
		return F.Maybe(this._getDocumentSelection()).maybe(null, function(selection) {
            return F.Maybe(selection.toString()).maybe(null, function(text) {
                return {
                    text: text,
                    anchorNode : selection.anchorNode,
                    anchorOffset : selection.anchorOffset,
                    focusNode : selection.focusNode,
                    focusOffset : selection.focusOffset,
                    range: selection.getRangeAt(0)
                };
            });
        });
	},

    _getDocumentSelection: function() {
        if (window.getSelection()) {
        	return window.getSelection();
	    } else if (document.selection) {
            return document.selection;
        } else {
            return null;
        }
    },

	onModelChange: function() {
		this.collection.reset();
		this.render();
	},
	
	render: function() {
		this._calculateLineProperties();
		this._printSequence();
        this._adjustRootSpanAttributes();
		this._printLineNumbers();
		this._restoreCaretPosition();
		this._renderHighlights(this.collection.models);
	},

	_calculateLineProperties: function() {
		this.line = {};
		this.line.capacity = Dom.getLineCapacity(this.el); var_dump(this.line.capacity);
		this.line.nColumns = getNumLineColumns(this.line.capacity);
	},

	_printSequence: function() {
		this.el.innerHTML = this._getSpacedSequence();
	},

    _adjustRootSpanAttributes: function() {
        this.el.setAttribute('data-end', this.model.get('sequence').length);   
    },
    
	_getSpacedSequence: function() {
		var sequence = this.model.get('sequence').split('');
		var fn = R.compose(R.trim, R.join('')); 
		return fn(sequence.map(function(char, index) {
			if ((index + 1) % 10 === 0) {
				return char + ' ';
			}
			return char;
		}));
	},

	_printLineNumbers: function() {
		var sequenceLength = this.model.get('sequence').length;
		this.options.lineNumsLeftEl.innerHTML = '1<br>';
		this.options.lineNumsRightEl.innerHTML = '';
		var row = 1;
		do {
			var lineLength = this._getLineLength(row++);
			this.options.lineNumsRightEl.innerHTML += lineLength + '<br>';
			if (lineLength < sequenceLength) {
				this.options.lineNumsLeftEl.innerHTML += (lineLength + 1) + '<br>';
			}
		} while (lineLength < sequenceLength);
	},

	_getLineLength: function(row) {
		var seq = this.model.get('sequence');
		var x = row * 10 * this.line.nColumns;
		return (seq.length / x) > 1 ? x : (seq.length % x);
	},

	_restoreCaretPosition: function() {
		this.el.focus();
		this._displayCaretPosition(1);
		var range = this.collection.createDocumentRange([0,0]);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	},
	
	_displayCaretPosition: function(caretPosition) {
 		this.options.currentPositionEl.innerHTML = caretPosition;
 	},

	removeSpan: function(models) {
		var that = this;
		R.map(function(model){
			that._getSpans(model).contents().unwrap();			
		}, F.array(models));
		this._cleanTextNodes();
	},
    
	mouseover: function(models) {
		var that = this;
		R.map(function(model){
			var $spans = that._getSpans(model);
			if (model.get('highlight')){
				$spans.addClass('sequence-highlight-hover-' + model.getCssClass());
			} else {
				$spans.removeClass('sequence-highlight-hover-' + model.getCssClass());
			}
		}, F.array(models));
	},

	_getSpans: function(model) {
		return this.$el.find('span[data-cid=' + model.cid + ']');
	}
});