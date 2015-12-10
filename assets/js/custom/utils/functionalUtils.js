// Tail call optimization for recursive functions
function tco(f) {
    var value;
    var active = false;
    var accumulated = [];

    return function accumulator() {
        accumulated.push(arguments);

        if (!active) {
            active = true;

            while (accumulated.length) {
                value = f.apply(this, accumulated.shift());
            }

            active = false;

            return value;
        }
    };
}

var F = {
    Maybe: function (x) {
        var Nothing = {
            bind: function (fn) {
                return this;
            },
            isNothing: function () {
                return true;
            },
            isSomething: function () {
                return false;
            },
            val: function () {
                return null;
            },
            def: function(def){
                return def;
            },
            maybe: function (def, fn) {
                return def;
            },
            maybeFn: function(fn1, fn2){
                return fn1.call(this);
            }
        };

        var Something = function (x) {
            return {
                bind: function (fn) {
                    return F.Maybe(fn.call(this, x));
                },
                isNothing: function () {
                    return false;
                },
                isSomething: function () {
                    return true;
                },
                val: function () {
                    return x;
                },
                def: function(def) {
                    return x;
                },
                maybe: function (def, fn) {
                    return fn.call(this, x);
                },
                maybeFn: function(fn1, fn2){
                    return fn2.call(this, x);
                }
            };
        };

        if (typeof x === 'undefined' || x === null || (typeof x.isNothing !== 'undefined' && x.isNothing())) {
            return Nothing;
        }
        return Something(x);
    },
    // DNA :: String -> String
    DNA: function(x){
        return F.Maybe(x).maybe('', function(x){
            return x.replace(/[^ATGCN]/gi, '').toUpperCase();
        });
    },
    // array :: a | [a] -> [a]
    array: function(x){
        return [].concat(x);
    },
    // intersect :: [a] -> [a] -> [a]
    intersect: function (xs, ys){
        return R.filter(R.compose(R.not, R.contains(R.__, ys)), xs);
    },
    // insertAt :: Number -> String -> String -> String
    insertAt: R.curry(function(i, x, y){
        return y.substr(0, i) + x + y.substr(i);
    }),
    // stringEquals :: a -> b -> Bool
    stringEquals: R.curry(function(a, b) {
        return String(a) === String(b);
    }),
    // toFixed :: Number -> Number -> String
    toFixed: R.curry(function (x, y) {
        return y.toFixed(x);
    }),
    // minOrZero: [Number] -> Number
    minOrZero: function (xs) {
        var min = this.min(xs);
        return min > 0 ? 0 : min;
    },
    // range :: [Number] -> Number
    range: function (xs) {
        return this.max(xs) - this.min(xs);
    },
    // max :: [Number] -> Number
    max: function (xs) {
        return Math.max.apply(null, xs);
    },
    // min :: [Number] -> Number
    min: function (xs) {
        return Math.min.apply(null, xs);
    },
    inArray: R.curry(function (x, xs) {
        return R.findIndex(R.equals(x), xs) !== -1;
    }),
    // isNumericArray :: [a] -> Bool
    isNumericArray: function (xs) {
        return R.compose(this.isNumeric, R.head)(xs);
    },
    // isNumeric: a -> Bool
    isNumeric: function (x) {
        return !isNaN(parseFloat(x)) && isFinite(x);
    },
    // isString :: a -> Bool
    isString: function (x) {
        return (typeof x === 'string' || x instanceof String) ? true : false;
    },
    // longest :: [String] -> String
    longest: function (xs) {
        return R.last(R.sort(this.length, xs));
    },
    // length :: [a] -> Number
    length: function (x) {
        return x.length;
    },
    // secondLast :: [a] -> a
    secondLast: function (xs) {
        return R.compose(R.head, R.takeLast(2))(xs);
    },
    // sequence :: Number -> Number -> [Number] -> [Number]
    sequence: tco(function (length, increment, xs) {
        if (xs.length === length) {
            return xs;
        }
        var copy = xs.slice(0);
        copy.push(R.last(xs) + increment);
        return this.sequence(length, increment, copy);
    })
};