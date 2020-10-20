function MyPromise(fn) {
    if (typeof fn !== 'function') {
        throw Error(`Promise resolver ${fn} is not a function`);
    }
    const self = this; 
    this.status = 'pending'; 
    this.data = null;
    this.resolvedList = [];
    this.rejectedList = [];
    function resolved(data) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'resolved';
                self.data = data;
                self.resolvedList.forEach((fn) => fn());
            }
        }, 0);
    }
    function rejected(err) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.data = err;
                self.rejectedList.forEach((fn) => fn());
            }
        }, 0);
    }
    fn(resolved, rejected);
}
MyPromise.prototype.then = function (onResolved, onRejected) {
    const self = this;
    if (this.status === 'resolved') {
        return new MyPromise(function(resolved, rejected) {
            var res = onResolved(self.data);
            if (res instanceof MyPromise) {
                res.then(resolved, rejected);
            } else {
                resolved(res);
            }
        });
    }
    if (this.status === 'rejected') {
        return new MyPromise(function(resolved, rejected) {
            var res = onRejected(self.data);
            if (res instanceof MyPromise) {
                res.then(resolved, rejected);
            } else {
                resolved(res);
            }
        });
    }
    if (this.status === 'pending') {
        return new MyPromise(function(resolved, rejected) {
            self.resolvedList.push((function(onResolved) {
                return function() {
                    var res = onResolved(self.data);
                    if (res instanceof MyPromise) {
                        res.then(resolved, rejected);
                    } else {
                        resolved(res);
                    }
                }
            }(onResolved)))
            self.rejectedList.push((function(onRejected) {
                return function() {
                    var res = onRejected(self.data);
                    if (res instanceof MyPromise) {
                        res.then(resolved, rejected);
                    } else {
                        resolved(res);
                    }
                }
            }(onRejected)))
        })
    }
}
