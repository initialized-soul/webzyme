Array.prototype.isNothing = function() {
  return this.length === 0;
};

Array.prototype.pushUnique = function (item){
    if(this.indexOf(item) === -1) {
        this.push(item);
        return true;
    }
    return false;
};

Array.prototype.max = function(){
    return Math.max.apply(null, this);
};

Array.prototype.naturalSort= function(){
    var a, b, a1, b1, rx=/(\d+)|(\D+)/g, rd=/\d+/;
    return this.sort(function(as, bs){
        a= String(as).toLowerCase().match(rx);
        b= String(bs).toLowerCase().match(rx);
        while(a.length && b.length){
            a1= a.shift();
            b1= b.shift();
            if(rd.test(a1) || rd.test(b1)){
                if(!rd.test(a1)) return 1;
                if(!rd.test(b1)) return -1;
                if(a1!= b1) return a1-b1;
            }
            else if(a1!= b1) return a1> b1? 1: -1;
        }
        return a.length- b.length;
    });
}