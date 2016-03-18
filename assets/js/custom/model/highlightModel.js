var HighlightModel = Backbone.Model.extend({
	
	getCssClass: function() {
        var cssClass = this._getCssClassByType();
        return this.get('highlight') ? 'hover-' + cssClass : cssClass;
		
	},
    
    _getCssClassByType: function() {
        switch(this.get('type')) {
			case 'user':
				return 'primary';
			case 'search':
				return 'success';
			case 'enzyme':
				return 'info';
			default:
				return 'default';
		};
    }
});
