var HighlightCollection = Backbone.Collection.extend({
		
	model: HighlightModel,
	
	initialize: function(models, options) {
		this.sequenceModel = options.sequenceModel;
		this.$parent = options.$parent;
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
		var spacedStart = this._spaced(range[0]);
		var spacedEnd = this._spaced(range[1]);
		var startData = this._getTextNodeDataByPosition(spacedStart);
		var endData = this._getTextNodeDataByPosition(spacedEnd);
		var startOffset = spacedStart - startData.sequence.length;
		var endOffset = spacedEnd - endData.sequence.length;
		return Dom.createRange(startData.node, endData.node, startOffset, endOffset);
	},

	_getTextNodeDataByPosition: function(spacedPosition) {
		var textNodes = Dom.getFlattenedTextNodes(this._getMainSpan());
		var sequence = '';
		var previousSequence = '';
		var finalNode = R.find(function(textNode) {
			previousSequence = sequence;
			sequence += textNode.nodeValue;
			return sequence.length > spacedPosition;
		}, textNodes);

		return {
			'node': finalNode,
			'sequence': previousSequence
		};
	},

	_getMainSpan: function() {
		return document.getElementsByName('sequence')[0];
	},

	_spaced: function(index, isStart) {
		return index + getNumLineSpaces(index, isStart);
	},

	generateSpanName: function(range, highlightType) {
		return 'Span-' + range.join('-') + '-' + F.Maybe(highlightType).def('');
	},
});
