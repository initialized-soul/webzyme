var SequenceSearchView = Backbone.View.extend({
	
	events: {
		'click button': 'search',
		'keyup input': 'keyUp'
	},

	initialize: function(options) {
		this.inputEl = this.$el.find('input').get(0);
	},
 
 	keyUp: function(event) {
 		if (event.keyCode === 13) { // enter
 			this.search();
 		}
 	},

	search: function() {
		F.Maybe(this._getCleanSearchText()).bind(this._performMatch.bind(this));
	},

	_getCleanSearchText: function() {
		var text = F.DNA(this.inputEl.value);
		this.inputEl.value = text;
		return text;
	},

	_performMatch: function(searchText) {
		var that = this; 
		var sequence = this.model.get('sequence');
		var regex = new RegExp('(' + searchText + ')', 'g');
		var match;
		while ((match = regex.exec(sequence)) !== null) {
		    if (match.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }
		    that.highlightMatch(match);
		}
	},
	
	highlightMatch: function(match) {
		var range = [match.index, match.index + match[0].length];
		var rangeEl = this.collection.createDocumentRange(range);
		this.collection.add({
			'id' : this.collection.generateSpanId(range),
			'start' : range[0],
			'end' : range[1],
			'text' : match[0],
			'rangeEl' : rangeEl,
			'type' : 'search'
		});
	}
});