/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:true */
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  module('jQuery retry tries again', {
    setup: function() {
      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = this.requests = [];
      this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    },
    teardown: function(){
      this.xhr.restore();
    }
  });

  test('ajax Deferreds have new retry method', 1, function() {
    var def = $.ajax({url:"/test",data:{},type:"POST"});
    var hasRetry = "retry" in def;
    ok(hasRetry);
  });

  test('ajax Deferreds have existing done and then', 1, function() {
    var def = $.ajax({url:"/test",data:{},type:"POST"});
    var hasOld = "done" in def && "then" in def;
    ok(hasOld);
  });

  test('ajax Deferred works as original in the case of a 200', 1, function() {
    var def = $.post("/test",{});
    this.requests[0].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
    def.then(function(data){
      ok(data.id === 12);
    });
  });

  asyncTest('ajax Deferred tries again if needed', 1, function() {
    var def = $.post("/test",{});
    def.retry({times:2}).then(function(data){
      ok(data.id === 12);
      start();
    });
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 13, "comment": "error!" }');
    this.requests[1].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
  });

  asyncTest('ajax Deferred tries again if needed', 1, function() {
    var def = $.post("/test",{});
    def.retry({times:3}).then(function(data){
      ok(data.id === 12);
      start();
    });

    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 13, "comment": "error!" }');
    this.requests[1].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 13, "comment": "error!" }');
    this.requests[2].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
  });

  asyncTest('ajax Deferred tries only once if failing', 0, function() {
    var def = $.post("/test",{});
    def.retry({times:2}).fail(function(){
      start();
    });
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');
    this.requests[1].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');
  });

  asyncTest('ajax Deferred gets correct parameters to fail callback', 1, function() {
    var def = $.post("/test",{});
    def.retry({times:2}).fail(function(deferred, status, msg){
      ok(status === "error");
      start();
    });
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');
    this.requests[1].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');
  });

  test('data is taken from successful response ', 1, function() {
    var def = $.post("/test",{});

    def.retry({times:2}).done(function(data) {
      ok(data.id === 12);
    });

    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 11, "comment": "error!" }');


    this.requests[1].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
  });


  module('jQuery retry uses timeout value', {
    setup: function() {
      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = this.requests = [];
      this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
      this.clock = sinon.useFakeTimers();
    },
    teardown: function(){
      this.xhr.restore();
      this.clock.restore();
    }
  });

  test('timeout is waited before next retry', 3, function() {
    var def = $.post("/test",{});

    def.retry({times:2, timeout:2000});

    ok(this.requests.length === 1);
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 11, "comment": "error!" }');
    ok(this.requests.length === 1);

    this.clock.tick(2000);

    ok(this.requests.length === 2);
    this.requests[1].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
  });

  test('timeout is waited between multiple retries', 4, function() {
    var def = $.post("/test",{});

    def.retry({times:3, timeout:2000});

    ok(this.requests.length === 1);
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 11, "comment": "error!" }');
    ok(this.requests.length === 1);

    this.clock.tick(2000);

    ok(this.requests.length === 2);

    this.requests[1].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 11, "comment": "error!" }');

    this.clock.tick(2000);

    ok(this.requests.length === 3);

    this.requests[2].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
  });

  test('retry does not happen, if timeout has not been met', 3, function() {
    var def = $.post("/test",{});
    def.retry({times:2, timeout:2000});
    ok(this.requests.length === 1);
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');
    ok(this.requests.length === 1);
    this.clock.tick(1999);
    ok(this.requests.length === 1);
  });

  test('data is taken from successful response when using timeout option', 1, function() {
    var def = $.post("/test",{});
    def.retry({times:2, timeout:2000}).done(function(data) {
      ok(data.id === 12);
    });
    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 13, "comment": "error!" }');
    this.clock.tick(2000);
    this.requests[1].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');
  });

  test('retry-after http header (seconds) is used as timeout', 3, function() {
    var def = $.post("/test",{});
    def.retry({times:2, timeout:100});
    ok(this.requests.length === 1);
    this.requests[0].respond(400, {
      "Content-Type": "application/json",
      "Retry-After": "1"
    }, '{ "id": 12, "comment": "error!" }');
    this.clock.tick(200);
    ok(this.requests.length === 1);
    this.clock.tick(1001);
    ok(this.requests.length === 2);
  });

  test('retry-after http header (HTTP-date) is used as timeout', 3, function() {
    var def = $.post("/test",{});
    def.retry({times:2, timeout:100});
    ok(this.requests.length === 1);
    this.requests[0].respond(400, {
      "Content-Type": "application/json",
      "Retry-After": new Date($.now() + 3000)
    }, '{ "id": 12, "comment": "error!" }');
    this.clock.tick(200);
    ok(this.requests.length === 1);
    this.clock.tick(3001);
    ok(this.requests.length === 2);
  });

  module('jQuery retry uses retry codes', {
    setup: function() {
      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = this.requests = [];
      this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    },
    teardown: function(){
      this.xhr.restore();
    }
  });

  asyncTest('retry happens on provided status code', 1, function() {
    var def = $.post("/test",{});
    def.retry({times:2, statusCodes: [503]}).then(function(data){
      ok(data.id === 12);
      start();
    });
    this.requests[0].respond(503, { "Content-Type": "application/json" },
                                 '{ "id": 13, "comment": "error!" }');
    this.requests[1].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "Hey there" }');
  });

  asyncTest('retry does not happen if status code is different from provided', 1, function() {
    var def = $.post("/test",{
      error: function(data) {
        ok(true);
        start();
      }
    });

    def.retry({times:2, statusCodes:[503]});

    this.requests[0].respond(400, { "Content-Type": "application/json" },
                                 '{ "id": 12, "comment": "error!" }');

  });

}(jQuery));
