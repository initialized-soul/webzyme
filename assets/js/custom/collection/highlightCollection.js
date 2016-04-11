var HighlightCollection = Backbone.Collection.extend({
		
	model: HighlightModel,
	
	initialize: function(models, options) {
		this.sequenceModel = options.sequenceModel;
		this.$parent = options.$parent;
		this.rootModel = new Backbone.Model({
			range: [
                0,
			    this.sequenceModel.get('sequence').length - 1
            ],
			text: this.sequenceModel.get('sequence'),
			depth: -1
		});
		this.listenTo(this.sequenceModel, 'change', this._onModelChange);
	},

	_onModelChange: function() {
		var sequence = this.sequenceModel.get('sequence');
		this.rootModel.set('end', sequence.length - 1);
		this.rootModel.set('text', sequence);
	},
    
	createDocumentRange: function(range) {
		var rangeEl = document.createRange();
		var startSpan = this._getDeepestSpan(range[0]);
		var endSpan = this._getDeepestSpan(range[1]);
		var startNode = this._getTextNode(startSpan, range[0], true);
		var endNode = this._getTextNode(endSpan, range[1], false); var_dump([range[0], range[1], startNode[1], endNode[1], startSpan.getAttribute('data-cid'), endSpan.getAttribute('data-cid'), startNode[2]]);
		rangeEl.setStart(startNode[0], startNode[1]);
		rangeEl.setEnd(endNode[0], endNode[1] + 1);
		return rangeEl;
	},
	
    _getDeepestSpan: function(index) {
        var spans = $('span[data-depth]');
        return R.reduce(function(deepest, span) {
			if (Dom.intAttr(span, 'data-start') <= index && Dom.intAttr(span, 'data-end') >= index) {
                if (Dom.intAttr(span, 'data-depth') > Dom.intAttr(deepest, 'data-depth')) {
					return span;
				}
			}
			return deepest;
        }, spans[0], spans);
	},
    
	_getTextNode: function(span, offset, isStart) {
		var current = Dom.intAttr(span, 'data-start');
		var children = span.childNodes;
		for (var i = 0; i < children.length; i++) {
			var node = children[i];
            var length = this._getText(node).length
			if (Dom.isTextNode(node)) {
				current += length;
                if (current >= offset) {
                    return [
                        node,
                        this._spaced(offset, isStart) - this._spaced(current - length)
                    ];
                }
			} else {
				current = parseInt(node.getAttribute('data-end')) + 1;
			}
		}
		throw 'Cannot find text node for offset ' + offset;
	},
    
	_getText: function(el) {
		return F.stripWS(el.nodeValue);
	},

	_spaced: function(index, isStart) {
		return index + getNumLineSpaces(index, isStart);
	},

	generateSpanName: function(range, highlightType) {
		return 'Span-' + range.join('-') + '-' + F.Maybe(highlightType).def('');
	},
});
