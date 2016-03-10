var HighlightModel = Backbone.Model.extend({
	
	getCssClass: function() {
		switch(this.get('type')) {
			case 'user':
				return 'primary';
			case 'search':
				return 'success';
			case 'enzyme':
				return 'info';
			default:
				return 'default';
		}
	}
});
