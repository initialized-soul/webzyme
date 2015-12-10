var HighlightCollection = Backbone.Collection.extend({
		
	initialize: function(models, options) {
		this.sequenceModel = options.sequenceModel;
		this.rootModel = new Backbone.Model({
			id: options.sequenceSpanEl,
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
		var startNode = this.getTextNode(startModel, range[0]);
		var endNode = this.getTextNode(endModel, range[1]);
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

	getTextNode: function(model, offset) {
		var children = document.getElementById(model.get('id')).childNodes;
		var current = model.get('start');
		for (var i = 0; i < children.length; i++){
			if (children[i].nodeType === 3){
				current += children[i].nodeValue.length;
			} else {
				current = parseInt(children[i].getAttribute('data-end'));
			}
			if (current >= offset){
				return [
					children[i],
					offset - (current - children[i].nodeValue.length)
				];
			} 
		}
		throw 'Cannot find text node for offset ' + offset;
	},
	
	generateSpanId: function(range) {
		return 'Span-' + range.join('-');
	},
});
