/*
 * jquery.ajax-retry
 * https://github.com/johnkpaul/jquery-ajax-retry
 *
 * Copyright (c) 2012 John Paul
 * Licensed under the MIT license.
 */

(function($) {

  $(function(){
    var tempAjax = $.ajax;

    $.ajax = function(){
      var deferred = tempAjax.apply({},arguments);
      deferred.retry = passThroughToPipe;
      deferred.withTimeout = function(timeout){
        this.timeout = timeout;
        return this;
      };
      return deferred;
    };


    function passThroughToPipe(times){
        return this.pipe(null, retryIt.call(this,times));
    }

    function retryIt(times){
      var self = this;
      return function(deferred,status,msg){
        var ajaxOptions = this; 
        var def = new $.Deferred();

        if(self.timeout !== undefined){
          var timeoutDeferred = new $.Deferred();

          $.when(timeoutDeferred).then(function(timeout){
            def.pipe($.ajax(ajaxOptions).pipe(null, retryIt.call(self,times - 1)));
          });

          setTimeout(function(){
            timeoutDeferred.resolve();
          }, self.timeout);

          return def;
        }

        if(times > 1){
          return $.ajax(this).pipe(null, retryIt(times - 1));
        }     

        def.rejectWith(this,arguments);
        return def;
      };  
    }
  });

}(jQuery));
