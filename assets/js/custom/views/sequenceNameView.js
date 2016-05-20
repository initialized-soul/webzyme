var SequenceNameView = Backbone.View.extend({
	
	events: {
		'keyup': '_keyUp',
	},

	initialize: function(options) {
		this.listenTo(this.model, 'change:name', this._onModelChange);
		this.render();
	},
 
 	_keyUp: function(event) {
        this.model.set('name', this.$el.html());
 	},

	_onModelChange: function() {
		this.render();
	},
	
	render: function() {
		this.$el.html(this.model.get('name'));
	}
});