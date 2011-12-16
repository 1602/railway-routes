exports.Map = Map;

function Map(app, bridge) {
    this.app = app;
    this.bridge = bridge;
    this.paths = [];
    this.ns = '';
    // wtf???
    this.glob_path = '/';
}

Map.prototype.urlHelperName = function (path, action) {
    if (path instanceof RegExp) {
        path = path.toString().replace(/[^a-z]+/ig, '/');
    }

    // remove trailing slashes and split to parts
    path = path.replace(/^\/|\/$/g, '').split('/');

    // handle root paths
    if (path === '' || path === '/') return 'root';

    var helperName = [];
    path.forEach(function (token, index, all) {
        // skip variables
        if (token[0] == ':') return;

        var nextToken = all[index + 1] || '';
        // current token is last?
        if (index == all.length - 1) {
            token = token.replace(/\.:format\??$/, '');
            // same as action? - prepend
            if (token == action) {
                helperName.unshift(token);
                return;
            }
        }
        if (nextToken[0] == ':' || nextToken == 'new.:format?') {
            token = singularize(token);
        }
        helperName.push(token);
    });
    return helperName.join('_');
};

['get', 'post', 'put', 'delete', 'del', 'all'].forEach(function (method) {
    Map.prototype[method] = function (subpath, handler, middleware, options) {

        var controller, action;
        if (typeof handler === 'string') {
            controller = handler.split('#')[0];
            action = handler.split('#')[1];
        }

        var path;
        if (typeof subpath === 'string') {
            path = this.glob_path + subpath.replace(/^\/|\/$/, '');
        } else { // regex???
            path = subpath;
        }

        // only accept functions in before filter when it's an array
        if (middleware instanceof Array) {
            var before_filter_functions = middleware.filter(function(filter) {
                return (typeof filter === 'function');
            });
            middleware = before_filter_functions.length > 0 ? before_filter_functions : null;
        }

        if (!(typeof middleware === 'function' || (middleware instanceof Array)) && typeof options === 'undefined') {
            options = middleware;
            middleware = null;
        }

        if (!options) {
            options = {};
        }

        path = options.collection ? path.replace(/\/:.*_id/, '') : path;

        var args = [path];
        if (middleware) {
            args = args.concat(middleware);
        }
        args = args.concat(this.bridge(this.ns, controller, action));

        // this.bridge.dump.push({
        //     helper: options.as || this.urlHelperName(path, action),
        //     method: method,
        //     path: path,
        //     file: this.ns + controller,
        //     name: controller,
        //     action: action
        // });

        // this.paths.push([path, action]);

        this.app[method].apply(this.app, args);
    };
});
