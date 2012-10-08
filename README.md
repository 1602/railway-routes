## Description

This is simple routing for ExpressJS framework. It allows you to write routes in Ruby on rails 2 style.

## Using with Express

After creating app instead of writing code like `app.get('smth', doSmth);` generate routes like that:

    var map = new require('railway-routes').Map(app, handler);
    map.resources('posts');
    map.namespace('admin', function (admin) {
       admin.resources('users');
    });

In this example `handler` function will called immediately for each route, accepting three args: `ns`, `controller`, `action` and should return method which will me actually called to server request.

For example you have two controllers: `posts` and `admin/users` which looks like regular modules:

`controllers/posts_controller.js`

    exports.show = function (req, res) {
        res.send('show');
    };

    exports.edit = function (req, res) {
        res.send('edit');
    };

    exports.destroy = function (req, res) {
        res.send('destroy');
    };

    ...

same for `controllers/admin/users_controller.js`

In that case your handler should be:

    function handler(ns, controller, action) {
        try {
            var ctlFile = './controllers/' + ns + controller + '_controller';
            var responseHandler =  require(ctlFile)[action];
        } catch(e) {}
        return responseHandler || function (req, res) {
            res.send('Handler not found for ' + ns + controller + '#' + action);
        };
    }

## Features

- resourceful routes
- generic routes
- url helpers
- namespaces
- custom helper names / paths for resources

## Docs

http://railwayjs.com/routing.html

### Singleton resources

Example:

    map.resource('account');

Will generate the following routes:

    GET     /account        account#show
    POST    /account        account#create
    GET     /account/new    account#new
    GET     /account/edit   account#edit
    DELETE  /account        account#destroy
    PUT     /account        account#update

Singleton resources can also have nested resources. For example:

    map.resource('account', function(account) {
      account.resources('posts');
    });

## Example app

Check out [example app][1] to deal with middleware, route handling, and generic routes:

    git clone git://github.com/anatoliychakkaev/railway-routes-example-app.git
    cd railway-routes-example-app
    npm install
    node app.js

 [1]: http://github.com/anatoliychakkaev/railway-routes-example-app
