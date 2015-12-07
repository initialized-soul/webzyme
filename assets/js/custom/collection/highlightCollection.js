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

	generateSpanId: function(range) {
		return 'Span-' + range.join('-');
	},
});
