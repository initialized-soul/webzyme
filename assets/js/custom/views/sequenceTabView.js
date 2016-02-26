var SequenceTabView = Backbone.View.extend({
	
	events: {
		'click p.navbar-btn[name=add]' : '_addTabButton',
		'click p.navbar-btn[name=remove]' : '_removeTabButton',
		'shown.bs.tab' : '_tabShownEvent'
	},

	initialize: function() {
		this.listenTo(this.collection, 'reset', this._removeAllTabs);
		this.$headers = this._first('ul.nav');
		this.$content = this._first('div.tab-content');
		this.$tabAdd = this._first('li[name=add]', this.$headers);
		this.$tabRemove = this._first('li[name=remove]', this.$headers);
	},

	_removeAllTabs: function() {
		R.dropLast(2, this.$headers.children('li')).remove();
		R.dropLast(2, this.$content.children()).remove();
	},

	_removeTabButton: function() {
		var $active = this.$headers.find('li a.active');
		var id = $active.data('id');
		$active.parent().andSelf().remove();
		this.$content.children('#tab_' + id).remove();
		this.collection.remove(id);
	},

	_addTabButton: function() {
		this.addTab(new SequenceModel({
			name: 'Sequence',
			sequence: 'ATGC'
		}));
	},

	addTab: function(sequenceModel) {
		var tab = new Backbone.Model({
			id: this.collection.length + 1,
			sequenceModel: sequenceModel
		});
		this._addHeader(tab);
		this._addContent(tab);
		this.collection.add(tab);
	},

	_addHeader: function(tab) {
		var template = JST["assets/templates/sequenceTabHead.html"]({'tab' : tab});
		$(template).insertBefore(this.$tabRemove);
	},

	_addContent: function(tab) {
		var $el = $(JST["assets/templates/sequenceTabContent.html"]({'tab' : tab}));
		this.$content.append($el);
		this._createSubViews($el, tab);
	},

	_createSubViews: function($el, tab) {
		this._createSequencePanelView($el, tab);
		this._createHighlightCollection($el, tab);
		this._createHighlightListView($el, tab);
		this._createSequenceView($el, tab);
	},

	_createSequencePanelView: function($el, tab) {
		tab.set('sequencePanel', new SequencePanelView({
			el: this._first('div.panel', $el),
			model: tab.get('sequenceModel')
		}));
	},

	_createHighlightCollection: function($el, tab) {
		tab.set('highlightCollection', new HighlightCollection(null, {
			$parent: this._getSpanByName('sequence', $el).parent(),
			sequenceModel: tab.get('sequenceModel')
		}));
	},

	_createHighlightListView: function($el, tab) {
		tab.set('highlightList', new HighlightListView({
			el: this._first('ul.list-group', $el),
			collection: tab.get('highlightCollection')
		}));
	},

	_createSequenceView: function($el, tab) {
		tab.set('sequenceView', new SequenceView({
			el: this._getSpanByName('sequence', $el),
			currentPositionEl: this._getSpanByName('caret', $el).get(0),
			lineNumsLeftEl: this._getSpanByName('positions_left', $el).get(0),
			lineNumsRightEl: this._getSpanByName('positions_right', $el).get(0),
			$contextMenuEl: this._first('div[name=context_menu]', $el),
			//tabs: this.collection,
			model: tab.get('sequenceModel'),
			collection: tab.get('highlightCollection')
		}));
	},

	_getSpanByName: function(name, $el) {
		return this._first('span[name=' + name + ']', $el);
	},

	_first: function(criteria, $element) {
		var $el = F.Maybe($element).def(this.$el);
		return $el.find(criteria).first();
	},

	_tabShownEvent: function(event) {
		var tab = this.collection.get(event.target.getAttribute('data-id'));
		tab.get('sequenceView').render();
	}
});
