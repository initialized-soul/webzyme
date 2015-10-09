var ListView = Backbone.View.extend({
	
	events: {
		'mouseover' : 'mouseoverSequence',
		'mouseout' : 'mouseoutSequence',
		'click' : 'removeHighlightClick'
	},

	initialize: function() {
		this.listenTo(this.collection, 'add remove', this.render);
		this.listenTo(this.collection, 'reset', this.removeAllHighlights);
	},
 
	render: function() {
		var that = this;
		this.clear();
		this.collection.each(function(item){
			that.addHighlight(item);
		});
	},

	clear: function() {
		this.el.innerHTML = '';
	},

	addHighlight: function(item) {
		var template = JST["assets/templates/listAnchor.html"]({'highlight' : item});
		this.$el.append(template);
	},

	mouseoverSequence: function(event) {
		this.mouseHoverSequence(event, true);
	},

	mouseoutSequence: function(event) {
		this.mouseHoverSequence(event, false);
	},

	mouseHoverSequence: function(event, flag) {
		F.Maybe(this.collection.get(this.getAnchorValue(event))).bind(function(model){
			model.set('highlight', flag);
		});
	},

	removeAllHighlights: function() {
		this.$el.html('');
	},

	removeHighlightClick: function(event) {
		this.collection.remove(this.getAnchorValue(event));
	},

	getAnchorValue: function(event) {
		return $(event.target).closest('[value]').attr('value');
	}

});
