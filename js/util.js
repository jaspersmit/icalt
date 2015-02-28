var Class = function (klass, klass2) {
    if (klass2) {
        var superClass = klass;
        klass = klass2;
        var C = typeof klass.init == "function" ? klass.init : function () {
        };
        var F = function () {
        };
        F.prototype = superClass.prototype;
        C.prototype = new F();

        var klassP = klass;
        var prop;
        for (prop in klassP) {
            if (klassP.hasOwnProperty(prop)) {
                C.prototype[prop] = klassP[prop];
            }
        }
        return C;
    }
    var C = typeof klass.init == "function" ? klass.init : function () {
    };
    C.prototype = klass;
    return C;
};

var bind = function(bindee, thisPointer) {
    var defaultArguments = Array.prototype.slice.apply(arguments, [2]);
    return function() {
        var extraArgs = Array.prototype.slice.apply(arguments, [0]);
        var args = defaultArguments.concat(extraArgs);
        bindee.apply(thisPointer, args);
    }

}

Array.prototype.each = function(elementFunction) {
    for(var i = 0; i < this.length; i++) {
        elementFunction.apply(this[i], [i]);
    }
}
