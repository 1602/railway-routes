## 0.0.8

### Added sub-apps support

Now path helpers inside nested apps returns correct urls:

    // bundle express app as nested
    app.use('/nested', nestedApp);
    // was
    nestedAppRoutes.paths.someRoute() // /some/route
    // now
    nestedAppRoutes.paths.someRoute() // /nested/some/route

### Singleton resources

by Olivier Lalonde, adds map.resource:

Example:

    map.resource('account');

### Additional param to disable appending ".format?"

by Olivier Lalonde:

    map.resource('users' , { path: ':username', appendFormat: false });

Will generate the following routes:

    GET     /account        account#show
    POST    /account        account#create
    GET     /account/new    account#new
    GET     /account/edit   account#edit
    DELETE  /account        account#destroy
    PUT     /account        account#update

## 0.0.7

Support modular railway
