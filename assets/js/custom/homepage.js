$(document).ready(function(){

	// create a new collection for sequence highlights
	var highlights = new Backbone.Collection();

	// New textarea view for sequences
	new TextAreaView({
		el: '#textarea_sequence',
		collection: highlights
	});

	// New list view for sequence highlights
	new ListView({
		el: '#div_highlights',
		collection: highlights
	});

});