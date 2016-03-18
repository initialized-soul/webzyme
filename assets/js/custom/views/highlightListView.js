var HighlightListView = Backbone.View.extend({
	
	events: {
	},

	initialize: function() {
		this.$el.on('vclick', $.proxy(this.removeHighlightClick, this));
		this.$el.on('vmouseover', $.proxy(this.mouseoverSequence, this));
		this.$el.on('vmouseout', $.proxy(this.mouseoutSequence, this));
		this.listenTo(this.collection, 'add remove', this.render);
		this.listenTo(this.collection, 'reset', this.removeAllHighlights);
	},
 
	render: function() {
		var that = this;
		this.clear();
		this.collection.each(function(item){
			that.addHighlight(item);
		});
	},

	clear: function() {
		this.el.innerHTML = '';
	},

	addHighlight: function(item) {
		var template = JST["assets/templates/listAnchor.html"]({'highlight' : item});
		this.$el.append(template);
	},

	mouseoverSequence: function(event) {
		this.mouseHoverSequence(event, true);
	},

	mouseoutSequence: function(event) {
		this.mouseHoverSequence(event, false);
	},

	mouseHoverSequence: function(event, mouseInFlag) {
		this._getHighlightModelMaybe(event).bind(function(model) {
			var $spanEl = $('span[name=' + model.get('name') + ']');
            var hoverClass = 'sequence-highlight-hover-' + model.getCssClass();
            if (mouseInFlag) {
                $spanEl.addClass(hoverClass);
            } else {
                $spanEl.removeClass(hoverClass);
            }
		});
	},

    _getHighlightModelMaybe: function(event) {
        return F.Maybe(this.collection.get(this.getAnchorValue(event)));
    },
    
	removeAllHighlights: function() {
		this.$el.html('');
	},

	removeHighlightClick: function(event) {
		this.collection.remove(this.getAnchorValue(event));
	},

	getAnchorValue: function(event) {
		return $(event.target).closest('[value]').attr('value');
	}

});
