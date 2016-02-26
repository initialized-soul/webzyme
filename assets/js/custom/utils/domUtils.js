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

	isTextNode: function(el) {
		return el.nodeType === 3;
	},

	addClientRectsOverlay: function(elt) {
	    // Absolutely position a div over each client rect so that its border width
	    // is the same as the rectangle's width.
	    // Note: the overlays will be out of place if the user resizes or zooms.
	    var rects = elt.getClientRects();
	    for (var i = 0; i != rects.length; i++) {
	        var rect = rects[i];
	        var tableRectDiv = document.createElement('div');
	        tableRectDiv.style.position = 'absolute';
	        tableRectDiv.style.border = '1px solid red';
	        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
	        tableRectDiv.style.margin = tableRectDiv.style.padding = '0';
	        tableRectDiv.style.top = (rect.top + scrollTop) + 'px';
	        tableRectDiv.style.left = (rect.left + scrollLeft) + 'px';
	        // we want rect.width to be the border width, so content width is 2px less.
	        tableRectDiv.style.width = (rect.width - 2) + 'px';
	        tableRectDiv.style.height = (rect.height - 2) + 'px';
	        document.body.appendChild(tableRectDiv);
	    }
	}
};