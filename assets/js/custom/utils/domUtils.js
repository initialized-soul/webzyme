var Dom = {

    getSelection: function() {
        if (window.getSelection()) {
            return window.getSelection();
        } else if (document.selection) {
            return document.selection;
        } else {
            return null;
        }
    },
    
    placeCursor: function(rangeData) {
        var range = this.createRange(rangeData.node, rangeData.node, rangeData.offset, rangeData.offset - 1);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },

    createRange: function(startNode, endNode, startOffset, endOffset) {
        var rangeEl = document.createRange();
        rangeEl.setStart(startNode, startOffset);
        rangeEl.setEnd(endNode, endOffset + 1);
        return rangeEl;
    },

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

    getFlattenedHtmlElements: function(el) {
        return this.getFlattenedChildrenOfType(1, el);
    },

    getFlattenedTextNodes: function(el) {
        return this.getFlattenedChildrenOfType(3, el);
    },

 	getFlattenedChildrenOfType: function(type, el) {
 		var that = this;
 		return R.reduce(function(result, node) {
            var toAppend = node.nodeType === type ? [node] : [];
            var children = node.childNodes.length > 0 ? that.getFlattenedChildrenOfType(type, node) : [];
            return result.concat(toAppend, children);
        }, [], el.childNodes);
	},

    joinTextNodes: R.compose(R.join(''), R.pluck('nodeValue')),
   
	isTextNode: function(el) {
		return el.nodeType === 3;
	},
    
    intAttr: function(el, attr) {
        return parseInt(el.getAttribute(attr));
    },

    isEqualNode: R.curry(function(node1, node2) {
        return node1.isEqualNode(node2);
    })
};