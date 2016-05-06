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
    var charsPerColumnWithoutSpaces = 10;
    return Math.floor(x / charsPerColumnWithoutSpaces);
};

function getNumLineSpaces(x) {
    return x > 0 ? Math.floor(x / 10) : 0;
}

