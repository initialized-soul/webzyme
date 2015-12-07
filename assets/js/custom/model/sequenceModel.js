var SequenceModel = Backbone.Model.extend({
	
	// always clean the sequence before storing it
	set: function(key, val, options) {
		if (typeof key === 'object') {
			key.sequence = F.DNA(key.sequence);
		} else if (key === 'sequence'){
			val = F.DNA(val);
		}
		return Backbone.Model.prototype.set.call(this, key, val, options);
	}
});
