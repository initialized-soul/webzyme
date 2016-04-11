var SequenceViewHighlightRenderer = {
    
    _renderHighlights: function(models) {
		var that = this;
		R.map(function(model) {
			var rangeEl = that.collection.createDocumentRange(model.get('range'));
			var selectionContents = rangeEl.extractContents();
			var spanEl = that.createSequenceSpan(selectionContents, model);
			rangeEl.insertNode(spanEl);
            model.set('span', spanEl);
		}, F.array(models));
		this._clearUserSelection();
		this._cleanTextNodes();
		this._calculateSpanDepths();
        this._calculateSpanRanges(this.el, 0);
	},
    
    createSequenceSpan: function(contents, model) {
		var span = document.createElement('span');
		span.appendChild(contents);
		span.setAttribute('class', 'sequence-highlight sequence-highlight-' + model.getCssClass());
		span.setAttribute('data-cid', model.cid);
        span.setAttribute('data-depth', 0);
		span.setAttribute('data-start', model.get('range')[0]);
		span.setAttribute('data-end', model.get('range')[1]);
		return span;
	},
    
    _clearUserSelection: function() {
	    if (document.selection) {
        	document.selection.empty();
	    } else if (window.getSelection) {
        	window.getSelection().removeAllRanges();
	    }
	},
    
    _cleanTextNodes: function() {
		var that = this;
		this._concatenateBrokenText(this.el);
		this.$el.find('*').each(function(index, el) {
			that._simplifyNode(el);
		});
	},
    
    _simplifyNode: function(el) {
		this._concatenateBrokenText(el);
		F.Maybe(el.childNodes[0]).onNothing(function() {
			el.parentNode.removeChild(el);
		});
	},
    
    _concatenateBrokenText: function(el) {
		el.normalize();
	},
    
    _calculateSpanDepths: function() {
        var that = this;
        this.$el.find('span').each(function() {
            var $span = $(this);
            var depth = $span.parentsUntil(that.$el).length;
            $span.attr('data-depth', depth);
        });
	},

    _calculateSpanRanges: function(el, position) {
        var that = this;
        var offset = R.reduce(function(accumulator, child) {
            if (Dom.isTextNode(child)) {
                var unspacedText = F.stripWS(child.nodeValue);
                return accumulator + unspacedText.length;
            } else {
                return that._calculateSpanRanges(child, accumulator);
            }
        }, position, el.childNodes);
        el.setAttribute('data-start', position);
        el.setAttribute('data-end', offset - 1);
        return offset;
    }
};