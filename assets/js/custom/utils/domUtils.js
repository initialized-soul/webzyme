var Dom = {
	getLineCapacity: function(el) {
		var origText = el.innerHTML;
 		el.innerHTML = 'A';
 		var initialHeight = el.offsetHeight;
 		var i = 0;
 		while (el.offsetHeight <= initialHeight){
 			el.innerHTML += 'A';
 			if (i++ > 200) {
 				break;
 			}
 		}
 		var capacity = el.innerHTML.length - 1;
 		el.innerHTML = origText;
 		return capacity;
 	},

 	getFlattenedChildren: function(el) {
 		var that = this;
 		if (el instanceof HTMLElement) {
 			return R.reduce(function(result, node) {
				var toAppend = node.childNodes.length > 0 ? that.getFlattenedChildren(node) : [node];
				return R.concat(result, toAppend);
			}, [], el.childNodes);
 		}
 		return [];
	},

    getText: function(el) {
        return this.joinTextNodes(this.getTextChildNodes(el));    
    },
    
    joinTextNodes: R.compose(R.join(''), R.pluck('nodeValue')),
    
    getTextChildNodes: function(el) {
        return $.map(el.childNodes, this.getTextNodeOrNull); 
    },
    
    getTextNodeOrNull: function(el) {
        return el.nodeType === 3 ? el : null;
    },
    
	isTextNode: function(el) {
		return el.nodeType === 3;
	},
    
    intAttr: function(el, attr) {
        return parseInt(el.getAttribute(attr));
    }
};