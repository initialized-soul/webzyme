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
		var that = this; 
		var searchText = this.getCleanSearchText();
		var sequence = this.model.get('sequence');
		F.Maybe(searchText).bind(function(search){
			var regex = new RegExp('(' + search + ')', 'g');
			var match;
			while ((match = regex.exec(sequence)) !== null) {
			    if (match.index === regex.lastIndex) {
			        regex.lastIndex++;
			    }
			    that.highlightMatch(match);
			}
		});
	},

	getCleanSearchText: function() {
		var searchText = F.DNA(this.inputEl.value);
		this.inputEl.value = searchText;
		return searchText;
	},
	
	highlightMatch: function(match) {
		var range = [match.index, match.index + match[0].length];
		var rangeEl = this.createDocumentRange(range);
		this.collection.add({
			'id' : this.collection.generateSpanId(range),
			'start' : range[0],
			'end' : range[1],
			'text' : match[0],
			'rangeEl' : rangeEl,
			'type' : 'search'
		})
	},
	
	createDocumentRange: function(range) {
		var rangeEl = document.createRange();
		var startModel = this.collection.getDeepestHighlight(range[0]);
		var endModel = this.collection.getDeepestHighlight(range[1]);
		var startNode = this.getTextNode(startModel, range[0]);
		var endNode = this.getTextNode(endModel, range[1]);
		rangeEl.setStart(startNode[0], startNode[1]);
		rangeEl.setEnd(endNode[0], endNode[1]);
		return rangeEl;
	},
	
	getTextNode: function(model, offset) {
		var children = document.getElementById(model.get('id')).childNodes;
		var current = model.get('start');
		for (var i = 0; i < children.length; i++){
			if (children[i].nodeType === 3){
				current += children[i].nodeValue.length;
			} else {
				current = parseInt(children[i].getAttribute('data-end'));
			}
			if (current >= offset){
				return [
					children[i],
					offset - (current - children[i].nodeValue.length)
				];
			} 
		}
		throw 'Cannot find text node for offset ' + offset;
	}
});