
var IndexView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'onScroll');
    },

    render: function() {
        this.$el.html('Index! <p style="margin-top: 2000px">This is a long page. If you navigate to another page and hit the "back" button in Spotify, it should scroll back to this position.</p>');
        this.restore();
    },

    restore: function() {
        // You may want to put this scrolling code in a base view in your app
        if (!this._scrollPosition) {
            this._scrollPosition = 0;
        }
        $(window).scrollTop(this._scrollPosition);
        $(window).on('scroll', this.onScroll);
    },

    freeze: function() {
        $(window).off('scroll', this.onScroll);
    },

    onScroll: _.throttle(function() {
        this._scrollPosition = $(window).scrollTop();
    }, 250),
});

var OtherView = Backbone.View.extend({
    render: function() {
        this.$el.html('Another page.');
    }
});

var Router = BackboneSpotify.Router.extend({
    routes: {
        'index': 'index',
        'other': 'other'
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
    }
});

$(function() {
    Backbone.history = new BackboneSpotify.History({debug: true});
    var router = new Router();
    Backbone.history.start();
});


