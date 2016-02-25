var F = {
    Maybe: function (x) {
        var Nothing = {
            bind: function (fn) {
                return this;
            },
            onNothing: function (fn) {
                return fn.call(this);
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
            def: function (def){
                return def;
            },
            maybe: function (def, fn) {
                return def;
            },
            maybeFn: function (fn1, fn2){
                return fn1.call(this);
            }
        };

        var Something = function (x) {
            return {
                bind: function (fn) {
                    return F.Maybe(fn.call(this, x));
                },
                onNothing: function (fn) {
                    return null;
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
    // strip all whitespaces :: String -> String
    stripWS: function(x) {
        return F.Maybe(x).maybe('', function(text) {
            return text.replace(/ /g, '');
        });
    },
    // array :: a | [a] -> [a]
    array: function(x){
        return [].concat(x);
    },
    // inArray :: a -> Array -> Bool
    inArray: R.curry(function (x, xs) {
        return R.findIndex(R.equals(x), xs) !== -1;
    }),
};