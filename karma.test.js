/* Figure out our list of tests and module dependencies */
var dependencies = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/^\/base\/test\/.+\.js$/.test(file)) {
      dependencies.push(file);
    }
  }
}

/* Load tests via RequireJS */
requirejs.config({
 baseUrl: '/base/src', // must contain leading slash or require will complain
 deps: dependencies,
 callback: window.__karma__.start
});
