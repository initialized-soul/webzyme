function var_dump(obj) {
    var seen = [];
    // Use the second parameter of the stringify function to supply a replacer that will replace already seen objects and prevent cyclic errors
    window.console.log( JSON.stringify(obj, function(key, val) {
        if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
                return;
            }
            seen.push(val);
        }
        return val;
    }));
};

function getNumLineColumns(x) {
    return Math.floor(x / 11);
};

function getNumLineSpaces(x, isStart) {
    var index = isStart ? x : x - 1;
    if (x > 0) {
        return Math.floor(index / 10);
    }
    return 0;
}

