var HighlightCollection = Backbone.Collection.extend({
		
	model: HighlightModel,
	
	initialize: function(models, options) {
		this.sequenceModel = options.sequenceModel;
		this.$parent = options.$parent;
		this.rootModel = new Backbone.Model({
			name: 'sequence',
			range: [
                0,
			    this.sequenceModel.get('sequence').length - 1
            ],
			text: this.sequenceModel.get('sequence'),
			depth: -1
		});
		this.listenTo(this.sequenceModel, 'change', this.onModelChange);
	},

	onModelChange: function() {
		var sequence = this.sequenceModel.get('sequence');
		this.rootModel.set('end', sequence.length - 1);
		this.rootModel.set('text', sequence);
	},

	createDocumentRange: function(range) {
		var rangeEl = document.createRange();
		var startSpan = this.getDeepestSpan(range[0]);
		var endSpan = this.getDeepestSpan(range[1]);
		var startNode = this._getTextNode(startSpan, range[0], true);
		var endNode = this._getTextNode(endSpan, range[1], false);
		rangeEl.setStart(startNode[0], startNode[1]);
		rangeEl.setEnd(endNode[0], endNode[1] + 1);
		return rangeEl;
	},
	
    getDeepestSpan: function(index) {
        var spans = $('span[data-depth]');
        return R.reduce(function(deepest, span) {
			if (Dom.intAttr(span, 'data-start') <= index && Dom.intAttr(span, 'data-end') > index) {
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
			} else {
				current = parseInt(node.getAttribute('data-end'));
			}
			if (current >= offset) {
				return [
					node,
					this._spaced(offset, isStart) - this._spaced(current - length)
				];
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

	generateSpanName: function(range) {
		return 'Span-' + range.join('-');
	},
});
