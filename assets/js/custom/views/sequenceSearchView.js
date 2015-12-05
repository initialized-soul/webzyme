var SequenceSearchView = Backbone.View.extend({
	
	events: {
		'click button': 'search',
		'keyup input': 'keyUp'
	},

	initialize: function(options) {
		this.inputEl = this.$el.find('input')[0];
	},
 
 	keyUp: function(event) {
 		if (event.keyCode === 13){ // enter
 			this.search();
 		}
 	},

	search: function() { 
		var searchText = this.getCleanSearchText();
		var sequence = this.model.get('sequence');
		F.Maybe(searchText).bind(function(search){
			var regex = new RegExp('(' + search + ')', 'g');
			var match;
			while ((match = regex.exec(sequence)) !== null) {
			    if (match.index === regex.lastIndex) {
			        regex.lastIndex++;
			    }
			    console.log(match);
			}
		});
	},

	getCleanSearchText: function() {
		var searchText = F.DNA(this.inputEl.value);
		this.inputEl.value = searchText;
		return searchText;
	}
});