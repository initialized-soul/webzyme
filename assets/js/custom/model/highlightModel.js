var HighlightModel = Backbone.Model.extend({
	
	getCssClass: function() {
		switch(this.get('type')) {
			case 'user':
				return 'warning';
			case 'search':
				return 'danger';
			default:
				return 'default';
		}
	}
});
