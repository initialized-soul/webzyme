var HighlightCollection = Backbone.Collection.extend({
		
	model: HighlightModel,
	
	initialize: function(models, options) {
		this.sequenceModel = options.sequenceModel;
		this.$parent = options.$parent;
		this.rootModel = new Backbone.Model({
			name: 'sequence',
			start: 0,
			end: this.sequenceModel.get('sequence').length - 1,
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
		var startModel = this.getDeepestHighlight(range[0]);
		var endModel = this.getDeepestHighlight(range[1]);
		var startNode = this._getTextNode(startModel, range[0], true);
		var endNode = this._getTextNode(endModel, range[1], false);
		rangeEl.setStart(startNode[0], startNode[1]);
		rangeEl.setEnd(endNode[0], endNode[1]);
		return rangeEl;
	},
	
	getDeepestHighlight: function(index) {
		return this.reduce(function(deepest, model){
			if (model.get('start') <= index && model.get('end') >= index){
				if (model.get('depth') > deepest.get('depth')){
					return model;
				}
			}
			return deepest;
		}, this.rootModel);
	},

	_getTextNode: function(model, offset, isStart) {
		var current = model.get('start');
		var children = this._getChildren(model); 
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

	_getChildren: function(model) {
		return this.$parent.find('span[name=' + model.get('name') + ']').get(0).childNodes;
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
