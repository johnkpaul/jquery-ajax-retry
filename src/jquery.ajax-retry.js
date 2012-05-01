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
      return deferred;
    };


    function passThroughToPipe(times){
        return this.pipe(null, retryIt.call(this,times));
    }

    function retryIt(times){
      return function(deferred,status,msg){
        if(times > 1){
          return $.ajax(this).pipe(null, retryIt(times - 1));
        }     

        var def = new $.Deferred();
        def.rejectWith(this,arguments);
        return def;
      };  
    }
  });

}(jQuery));
