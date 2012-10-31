require('./spec_helper').init(module.exports);
var routes = require('../lib/railway_routes');

function fakeApp(container) {
    var app = {};
    ['get', 'post', 'put', 'del', 'delete', 'all'].forEach(function (m) {
        app[m] = function () {
            var args = [].slice.call(arguments);
            args.unshift(m.toUpperCase());
            container.push(args);
        };
    });
    app.set = function () {};
    return app;
}

function fakeBridge() {
    return function (ns, controller, action) {
        return ns + controller + '#' + action;
    };
}

it('should produce routes for all methods', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
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
    test.equal(map.pathTo.signin(), '/signin');
    test.equal(map.pathTo.signin, '/signin');
    test.equal(map.pathTo.signout(), '/signout');
    test.equal(map.pathTo.signup(), '/signup');
    test.equal(map.pathTo.path(), '/path');
    test.done();
});

it('should create resourceful routes', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
    map.resources('users');
    test.deepEqual(paths, [
        [ 'GET', '/users.:format?', 'users#index' ],
        [ 'POST', '/users.:format?', 'users#create' ],
        [ 'GET', '/users/new.:format?', 'users#new' ],
        [ 'GET', '/users/:id/edit.:format?', 'users#edit' ],
        [ 'DELETE', '/users/:id.:format?', 'users#destroy' ],
        [ 'PUT', '/users/:id.:format?', 'users#update' ],
        [ 'GET', '/users/:id.:format?', 'users#show' ]
    ]);
    test.equal(map.pathTo.users(), '/users');
    test.equal(map.pathTo.users, '/users');
    test.equal(map.pathTo.new_user(), '/users/new');
    test.equal(map.pathTo.new_user, '/users/new');
    test.equal(map.pathTo.edit_user(1), '/users/1/edit');
    test.equal(map.pathTo.user(2), '/users/2');
    test.done();
});

it('should describe namespaced route', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
    map.namespace('admin', function (admin) {
        admin.get('dashboard', 'dashboard#index');
    });
    test.deepEqual(paths, [
        [ 'GET', '/admin/dashboard', 'admin/dashboard#index' ]
    ]);
    test.equal(map.pathTo.admin_dashboard(), '/admin/dashboard');
    test.done();
});

it('should describe namespaced resource', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
    map.namespace('admin', function (admin) {
        admin.resources('pages');
    });
    test.deepEqual(paths, [
        [ 'GET', '/admin/pages.:format?', 'admin/pages#index' ],
        [ 'POST', '/admin/pages.:format?', 'admin/pages#create' ],
        [ 'GET', '/admin/pages/new.:format?', 'admin/pages#new' ],
        [ 'GET', '/admin/pages/:id/edit.:format?', 'admin/pages#edit' ],
        [ 'DELETE', '/admin/pages/:id.:format?', 'admin/pages#destroy' ],
        [ 'PUT', '/admin/pages/:id.:format?', 'admin/pages#update' ],
        [ 'GET', '/admin/pages/:id.:format?', 'admin/pages#show' ]
    ]);
    test.equal(map.pathTo.admin_pages, '/admin/pages');
    test.equal(map.pathTo.new_admin_page(), '/admin/pages/new');
    test.equal(map.pathTo.new_admin_page, '/admin/pages/new');
    test.equal(map.pathTo.edit_admin_page(1), '/admin/pages/1/edit');
    test.equal(map.pathTo.admin_page(2), '/admin/pages/2');
    test.done();
});

it('should allow overwrite path and helper', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
    map.resources('avatars', {as: 'images', path: 'pictures'});
    test.deepEqual(paths, [
        [ 'GET', '/pictures.:format?', 'avatars#index' ],
        [ 'POST', '/pictures.:format?', 'avatars#create' ],
        [ 'GET', '/pictures/new.:format?', 'avatars#new' ],
        [ 'GET', '/pictures/:id/edit.:format?', 'avatars#edit' ],
        [ 'DELETE', '/pictures/:id.:format?', 'avatars#destroy' ],
        [ 'PUT', '/pictures/:id.:format?', 'avatars#update' ],
        [ 'GET', '/pictures/:id.:format?', 'avatars#show' ]
    ]);
    test.equal(map.pathTo.images, '/pictures');
    test.equal(map.pathTo.new_image, '/pictures/new');
    test.equal(map.pathTo.edit_image(1), '/pictures/1/edit');
    test.equal(map.pathTo.image(1602), '/pictures/1602');
    test.done();
});

it('should handle root url', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
    map.root('dashboard#home');
    test.deepEqual(paths, [
        [ 'GET', '/', 'dashboard#home' ]
    ]);
    test.equal(map.pathTo.root, '/');
    test.equal(map.pathTo.root(), '/');
    test.done();
});

it('should allow to specify url helper name', function (test) {
    var paths = [];
    var map = new routes.Map(fakeApp(paths), fakeBridge());
    map.get('/p/:id', 'posts#show', {as: 'post'});
    map.get('/p/:id/edit', 'posts#edit', {as: 'post_edit'});
    test.deepEqual(paths, [
        [ 'GET', '/p/:id', 'posts#show' ],
        [ 'GET', '/p/:id/edit', 'posts#edit' ]
    ]);
    test.equal(map.pathTo.post(1), '/p/1');
    test.equal(map.pathTo.post_edit(1), '/p/1/edit');
    test.done();
});

