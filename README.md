# jQuery Ajax Retry

Retry ajax calls using the deferred API

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/johnkpaul/jquery-ajax-retry/master/dist/jquery.ajax-retry.min.js
[max]: https://raw.github.com/johnkpaul/jquery-ajax-retry/master/dist/jquery.ajax-retry.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.ajax-retry.min.js"></script>
<script>
jQuery(function($) {
  //this will try the ajax call three times in total 
  //if there is no error, the success callbacks will be fired immediately
  //if there is an error after three attempts, the error callback will be called

  $.ajax(options).retry(3).then(function(){
    alert("success!");
  });  

  //this has the same sematics as above, except will wait 3 seconds between attempts
  $.ajax(options).withTimeout(3000).retry(3).then(function(){
    alert("success!");
  });  
});
</script>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 John Paul  
Licensed under the MIT license.
