// vim: ts=2:sw=2:sts=2

describe('BackboneSpotify.Router', function() {
  var router;

  before(function() {
    router = new BackboneSpotify.Router();
  })

  describe('_routeToRegExp', function() {
    it('converts a basic string correctly', function() {
      expect(router._routeToRegExp('search').source).to.eql('^search$')
    })
    it('converts named params correctly', function() {
      expect(router._routeToRegExp('search:<query>').source).to.eql('^search:([^:]+)$')
    })
    it('converts multiple named params correctly', function() {
      expect(router._routeToRegExp('search:<query>/<page>').source).to.eql('^search:([^:]+)/([^:]+)$')
    })
    it('converts splats correctly', function() {
      expect(router._routeToRegExp('splat:*args:end').source).to.eql('^splat:(.*?):end$')
    })
    it('escapes characters correctly', function() {
      expect(router._routeToRegExp('?').source).to.eql('^\\?$')
    })
  })
})

