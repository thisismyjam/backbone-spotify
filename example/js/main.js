
var IndexView = Backbone.View.extend({
    render: function() {
        this.$el.html('Index! <p style="margin-top: 2000px">This is a long page. If you navigate to another page and hit the "back" button in Spotify, it should scroll back to this position.</p>');
        this.restore();
    },

    restore: function() {
        // You might want to bind to any global events here
    },

    freeze: function() {
        // You might want to unbind global events etc here
    }
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
        this.view = new IndexView();
        $('.content').html(this.view.$el);
        this.view.render();
    },

    other: function() {
        this.view = new OtherView();
        $('.content').html(this.view.$el);
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


