backbone-spotify
================

[![Build Status](https://secure.travis-ci.org/thisismyjam/backbone-spotify.png)](http://travis-ci.org/thisismyjam/backbone-spotify)

A library for writing [Spotify apps](https://developer.spotify.com/technologies/apps/) with [Backbone](http://backbonejs.org).

It currently includes ``BackboneSpotify.Router`` and ``BackboneSpotify.History``, replacements for Backbone's ``Router`` and ``History``.

The quickest way to get started is to take a look at the app inside the ``example/`` directory.

``BackboneSpotify.Router``
--------------------------

Spotify uses ``:`` instead of ``/`` to separate directories in URIs. ``BackboneSpotify.Router`` changes the syntax for parameters from ``:param`` to ``<param>`` so colons can be used as path separators. Otherwise, it works exactly the same as [Backbone's router](http://backbonejs.org/#Router).

Example:

    var Router = BackboneSpotify.Router.extend({
        routes: {
            'index': 'index',
            'person:<name>': 'profile',
        },

        index: function() {
            // ...
        },

        profile: function(name) {
            // ...
        }
    });


``BackboneSpotify.History``
---------------------------

This is a completely rewritten version of Backbone's history designed to work with Spotify's URIs and ``ARGUMENTSCHANGED`` event. It needs to be passed a Spotify application object which has the `arguments` and `uri` properties loaded. You can then use it in the same way as Backbone's history:
    
    require('$api/models', function(models) {
      models.application.load(['arguments', 'uri']).done(function(application) {
        Backbone.history = new BackboneSpotify.History({application: application});
        var router = new Router();
        Backbone.history.start();
      });
    });

It's a bit smarter than the normal Backbone history, though. It keeps a stack of visited pages, similar to how a normal browser does. When you navigate to a new page, a reference to the view on the previous page is kept so it can be restored when you press the back button. (The example app shows you how to to restore scroll position with this.)

Spotify doesn't actually tell us whether the user used the back or forward button, but we can guess. If the URI is changed to something which is one position down in the stack, we assume they clicked the back button. One position up, and they probably hit the next button.

To activate the history stack, you need to set a ``view`` property on your router which is a reference to the view for the current page. When you navigate to new page, this reference is stored in the stack.

### Freezing and restoring views

When a view is stored in the stack, a ``freeze`` method is called on the router and the view. (The router gets passed the view as an argument too.)

Similarly, when a view is restored by hitting the back or forward button, a ``restore`` method is called on the router and the view. 

See the example app for how you can use these methods. Note that they get called **after** the URI is routed.

### Example

This is a basic example of a router that uses the history stack:

    var Router = BackboneSpotify.Router.extend({
        routes: {
            'index': 'index',
            'other': 'other',
        },

        index: function() {
            this.restore(new IndexView());
            this.view.render();
        },

        other: function() {
            this.restore(new OtherView());
            this.view.render();
        },

        restore: function(view) {
            this.view = view;
            $('.content').html(this.view.$el);
        },
    });

Test suite
----------

Open up `test/index.html` in a browser.

Change log
----------

### 1.1.0

 - Support for [Spotify apps API 1.0.0](https://developer.spotify.com/technologies/apps/upgrade-guide/1.0.0).

### 1.0.0

 - Initial release.


Contributors
------------

 - [Ben Firshman](https://github.com/bfirsh)
 - [Andreas Jansson](https://github.com/andreasjansson)
 - [Tom Jakubowski](https://github.com/tomjakubowski)


