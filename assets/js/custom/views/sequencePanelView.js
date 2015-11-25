var SequencePanelView = Backbone.View.extend({
	
	events: {
	},

	initialize: function() {
		this.listenTo(this.model, 'change:name', this.printSequenceName);
		this.initializeSections();
		this.printSequenceName();
	},

	initializeSections: function() {
		this.$nameSpanEl = $('#span_sequence_name');
	},

	printSequenceName: function() {
		this.$nameSpanEl.html(this.model.get('name'));
	}
});
