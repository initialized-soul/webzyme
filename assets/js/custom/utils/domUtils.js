var Dom = {
	getLineCapacity: function(el) {
		var origText = el.innerHTML;
 		el.innerHTML = 'A';
 		var initialHeight = el.offsetHeight;
 		while (el.offsetHeight <= initialHeight){
 			el.innerHTML += 'A';
 		}
 		var capacity = el.innerHTML.length - 1;
 		el.innerHTML = origText;
 		return capacity;
 	},

 	getFlattenedChildren: function(el){
 		var that = this;
 		if (el instanceof HTMLElement){
 			return R.reduce(function(result, node){
				var toAppend = node.childNodes.length > 0 ? that.getFlattenedChildren(node) : [node];
				return R.concat(result, toAppend);
			}, [], el.childNodes);
 		}
 		return [];
	}
};