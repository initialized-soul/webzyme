var HighlightCollection = Backbone.Collection.extend({
		
	model: HighlightModel,
	
	initialize: function(models, options) {
		this.sequenceModel = options.sequenceModel;
		this.$sequenceSpan = options.$sequenceSpan;
		this.rootModel = new Backbone.Model({
			range: [
                0,
			    this.sequenceModel.get('sequence').length - 1
            ],
			text: this.sequenceModel.get('sequence'),
			depth: -1
		});
		this.listenTo(this.sequenceModel, 'change', this._onModelChange);
	},

	_onModelChange: function() {
		var sequence = this.sequenceModel.get('sequence');
		this.rootModel.set('end', sequence.length - 1);
		this.rootModel.set('text', sequence);
	},
    
	createDocumentRange: function(range) {
		var start = this.getRangeData(range[0]);
		var end = this.getRangeData(range[1]);
		return Dom.createRange(start.node, end.node, start.offset, end.offset);
	},

	getRangeData: function(offset) {
		var spacedOffset = this._spaced(offset);
		var textNodes = Dom.getFlattenedTextNodes(this.$sequenceSpan.get(0));
		var sequence = '';
		var previousSequence = '';
		var finalNode = R.find(function(textNode) {
			previousSequence = sequence;
			sequence += textNode.nodeValue;
			return sequence.length > spacedOffset;
		}, textNodes);

		return {
			'node': finalNode,
			'offset': spacedOffset - previousSequence.length
		};
	},

	_spaced: function(index) {
		return F.Maybe(index).maybe(0, function(i) {
			return index + getNumLineSpaces(index);
		});
	},

	generateSpanName: function(range, highlightType) {
		return 'Span-' + range.join('-') + '-' + F.Maybe(highlightType).def('');
	},
});
