var SequenceSearchView = Backbone.View.extend({
	
	events: {
		'click button': 'search',
		'keyup input': 'keyUp'
	},

	initialize: function(options) {
		this.$inputEl = this.$el.find('input');
		this.inputEl = this.$inputEl.get(0);
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
		var tab = this._getCurrentTab();
		var sequence = this._getCurrentTabSequence(tab);
		var regex = new RegExp('(' + searchText + ')', 'g');
		var match;
		this._addError();
		while ((match = regex.exec(sequence)) !== null) {
		    if (match.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }
		    that.highlightMatch(tab, match);
		    that._removeError();
		}
	},
	
	_getCurrentTab: function() {
		var activeTabId = $('.nav-link.active').data('id');
		return this.collection.get(activeTabId);
	},

	_getCurrentTabSequence: function(currentTab) {
		return F.Maybe(currentTab).maybe('', function(tab) {
			return tab.get('sequenceModel').get('sequence');
		});
	},

	highlightMatch: function(currentTab, match) {
		F.Maybe(currentTab).bind(function(tab) {
			var collection = tab.get('highlightCollection');
			var range = [match.index, match.index + match[0].length];
			collection.add({
				'name' : collection.generateSpanName(range),
				'range' : range,
				'text' : match[0],
				'type' : 'search'
			});
		});
	},

	_addError: function() {
		this.$inputEl.addClass('search-error');
	},

	_removeError: function() {
		this.$inputEl.removeClass('search-error');	
	}
});