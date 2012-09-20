backbone-spotify
================

A library for writing [Spotify app](https://developer.spotify.com/technologies/apps/) with [Backbone](http://backbonejs.org).

It currently includes ``BackboneSpotify.Router`` and ``BackboneSpotify.History``, versions of Backbone's own ``Router`` and ``History`` classes that are designed to work better inside Spotify apps.

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

This is a completely rewritten version of Backbone's history designed to work with Spotify's URIs and ``ARGUMENTSCHANGED`` event. You can use it just like Backbone's history:

    Backbone.history = new BackboneSpotify.History();
    var router = new Router();
    Backbone.history.start();

It also keeps a stack of history, similar to how a normal browser does. When you navigate to a new page, a reference to the view on the previous page is kept so it can be restored when you press the back button. The example application shows how you can use it to restore scroll position.

Spotify doesn't actually tell us whether the user used the back or forward button, but we guess: if the URI is changed to something which is one position down in the stack, we assume they clicked the back button. One position up, and they probably hit the next button.

To activate the history stack, you need to set a ``view`` property on your router which is a reference to the view for the current page. When you navigate to new page, this reference is stored in the stack.

When a view is stored in the stack, a ``freeze`` method is called on the router and the view. The router's ``freeze`` method is passed the view as an argument.

Similarly, when a view is restored by hitting the back or forward button, a ``restore`` method is called on the router and the view. See the example app for how you can use these methods.

A basic example of a router that can freeze and restore views:

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



