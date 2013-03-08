// backbone-spotify 1.0.0
// vim: ts=2:sw=2:sts=2

(function(undefined) {
  var BackboneSpotify = window.BackboneSpotify = {};

  var Router = BackboneSpotify.Router = Backbone.Router.extend({
    namedParam: /<\w+>/g,
    splatParam: /\*\w+/g,
    escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,

    _routeToRegExp: function(route) {
      route = route.replace(this.escapeRegExp, '\\$&')
        .replace(this.namedParam, '([^:]+)')
        .replace(this.splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },
  });

  var History = BackboneSpotify.History = function(options) {
    _.bindAll(this, 'checkUrl', 'onRoute');
    options = options || {};
    this.location = options.location || window.location;
    this.application = options.application;
    if (!this.application) {
      throw new Error('options.application is required');
    }
    if (!this.application.uri || !this.application.arguments) {
      throw new Error('options.application must have uri and arguments ' +
                      'properties (you might need to call options.' +
                      'application.load([\'arguments\', \'uri\']))');
    }

    if (options.debug) {
      this.debug = _.bind(console.debug, console);
    }
    else {
      this.debug = function() {};
    }

    this.handlers = [];
    this.stack = [];
    this.stackPosition = -1;
  };

  History.extend = Backbone.Model.extend;

  _.extend(History.prototype, Backbone.Events, {
    started: false,
    MAX_STACK_SIZE: 25,

    start: function(options) {
      if (this.started) throw new Error("Backbone.history has already been started");
      this.started = true;
      this.options = options || {};
      this.fragment = this.getFragment();

      this.application.addEventListener(
        'arguments',
        this.checkUrl
      );
      this.on('route', this.onRoute)

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    stop: function() {
      this.application.removeEventListener(
        'arguments',
        this.checkUrl
      );
      this.off('route', this.onRoute);
      this.started = false;
    },

    route: Backbone.History.prototype.route,

    getFragment: function(fragment) {
      if (fragment) return fragment;
      return this.application.arguments.join(':');
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment) return false;
      this.loadUrl();
    },

    loadUrl: function(fragmentOverride) {
      this.fragment = this.getFragment(fragmentOverride);
      this.debug('Loading', this.fragment);

      var current = this.current();

      // Forward button?
      var next = this.next();
      if (next && next.fragment == this.fragment) {
        // Clear out a stale view
        if (next.stale) {
          // We clear at this point because it will get recreated
          // immediately by loadUrl
          this.clearIndex(this.stackPosition + 1);
          return Backbone.History.prototype.loadUrl.apply(this, arguments);
        }

        this.debug('Forward button pressed, restoring', this.fragment);
        this.trigger('route');
        if (current.router.freeze) current.router.freeze(current.view);
        if (current.view.freeze) current.view.freeze();
        if (next.router.restore) next.router.restore(next.view);
        if (next.view.restore) next.view.restore();

        this.stackPosition += 1;
        return true;
      }

      // Back button?
      var previous = this.previous();
      if (previous && previous.fragment == this.fragment) {
        // Clear out a stale view
        if (previous.stale) {
          // We clear at this point because it will get recreated
          // immediately by loadUrl
          this.clearIndex(this.stackPosition - 1);
          return Backbone.History.prototype.loadUrl.apply(this, arguments);
        }

        this.debug('Back button pressed, restoring', this.fragment);
        this.trigger('route');

        if (current.router.freeze) current.router.freeze(current.view);
        if (current.view.freeze) current.view.freeze();
        if (previous.router.restore) previous.router.restore(previous.view);
        if (previous.view.restore) previous.view.restore();


        this.stackPosition -= 1;
        return true;
      }

      // This triggers onRoute, which will then add loaded view to the stack
      return Backbone.History.prototype.loadUrl.apply(this, arguments);
    },

    onRoute: function(router, name, args) {
      // Event has been triggered from going back/forward in stack, so ignore
      if (!router) return;
      // No view was rendered on last URL
      if (!router.view) return;
      // View raised an error, don't store in history
      if (router.view.hasError && router.view.hasError()) return;

      this.debug('Loaded', this.fragment);
      this.clearNext();

      var current = this.current();

      if (current && current.view.freeze) {
        if (current.router.freeze) current.router.freeze(current.view);
        if (current.view.freeze) current.view.freeze();
      }
      this.stack.push({
        fragment: this.fragment,
        router: router,
        view: router.view,
        stale: false,
      });
      this.stackPosition += 1;
    },

    navigate: function(fragment) {
      var l;
      if (fragment) {
        l = this.application.uri + ':' + fragment;
      }
      else {
        l = this.application.uri;
      }
      this.location.assign(l);
    },

    current: function() {
      return this.stack[this.stackPosition];
    },

    previous: function() {
      return this.stack[this.stackPosition - 1];
    },

    next: function() {
      return this.stack[this.stackPosition + 1];
    },

    // Close any views after stackPosition and prune any old views
    clearNext: function() {
      var closed = this.stack.slice(this.stackPosition + 1);
      _.each(closed, function(item) {
        item.view.close();
      });
      this.stack = this.stack.slice(0, this.stackPosition + 1);

      if (this.stack.length > this.MAX_STACK_SIZE) {
        var newStart = this.stack.length - this.MAX_STACK_SIZE;
        _.each(this.stack.slice(0, newStart), function(item) {
          item.view.close();
        });
        this.stack = this.stack.slice(newStart);
        this.stackPosition = this.MAX_STACK_SIZE - 1;
      }
    },

    // Clears history so all views are forced to reload
    clear: function() {
      this.debug('Clearing history')

        _.each(this.stack, function(item) {
          item.view.close();
        });

      this.stack = [];
      this.stackPosition = -1;
    },

    // Clear a specific URL from the history
    clearUrl: function(fragment) {
      var history = this;
      _.each(this.stack, function(item, i) {
        if (item.fragment === fragment) {
          history.clearIndex(i);
        }
      });
    },

    // Clear a specific index in the history
    clearIndex: function(i) {
      if (i == this.stackPosition) {
        return;
      }

      if (i < this.stackPosition) {
        this.stackPosition -= 1;
      }

      var item = this.stack.splice(i, 1)[0];
      item.view.close();
    },

    // Mark a view to reload if we encounter it in the history
    // We do this instead of clearing so stack position is maintained
    //
    // e.g. suppose this navigation:
    //   people -> people:john (stale) -> people:jane
    // if we cleared people:john instead of marking it as stale, hitting back
    // from people:jane wouldn't recognise the people:john view spotify send
    // us, giving us this stack:
    //   people -> people:jane -> people:john
    // and hitting back again would give
    //   people -> people:jane -> people:john -> people
    // so we'd never get back to the original people view
    //
    markStale: function(view) {
      _.each(this.stack, function(item) {
        if (item.view === view) {
          item.stale = true;
        }
      });
    },
  });

  BackboneSpotify.init = function(options) {
    Backbone.history = new History(options);
  };

})();


