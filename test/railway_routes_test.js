require('./spec_helper').init(module.exports);
var pathetic = require('../lib/railway_routes');

function fakeApp(container) {
    var app = {};
    ['get', 'post', 'put', 'del', 'delete', 'all'].forEach(function (m) {
        app[m] = function () {
            var args = [].slice.call(arguments);
            args.unshift(m.toUpperCase());
            container.push(args);
        };
    });
    return app;
}

function fakeBridge() {
    return function (ns, controller, action) {
        return ns + controller + '#' + action;
    };
}

it('should produce routes for all methods', function (test) {
    var paths = [];
    var map = new pathetic.Map(fakeApp(paths), fakeBridge());
    map.get('/signin', 'session#new');
    map.post('/signin', 'session#create');
    map.del('/signout', 'session#destroy');
    map.get('/signup', 'users#new');
    map.put('/signup', 'users#create');
    map.all('/path', 'controller#action');

    test.deepEqual(paths, [
        [ 'GET', '/signin', 'session#new' ],
        [ 'POST', '/signin', 'session#create' ],
        [ 'DEL', '/signout', 'session#destroy' ],
        [ 'GET', '/signup', 'users#new' ],
        [ 'PUT', '/signup', 'users#create' ],
        [ 'ALL', '/path', 'controller#action' ]
    ]);
    test.done();
});


