// npm-installed modules
import should from "should";


// own modules
import token from "../lib/token";
import user from "../lib/user";


describe("token.createToken", function() {
  const username = "createToken";

  before(function(done) {
    user.createUser({ user: {username} }, function(err) {
      should(err).not.be.ok();
      return done();
    });
  });

  it("errors if user does not exist", function(done) {
    const name = "does-not-exist";
    token.createToken(name, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("creates token", function(done) {
    token.createToken({ username }, function(err, t) {
      should(err).not.be.ok();
      should(t).be.ok();
      return done();
    });
  });
});


describe("token.tokenExists", function() {
  const username = "tokenExists";
  let testToken;

  before(function(done) {
    user.createUser({ user: {username} }, function(err) {
      should(err).not.be.ok();
      token.createToken({ username }, function(err2, t) {
        should(err2).not.be.ok();
        testToken = t;
        return done();
      });
    });
  });

  it("returns hash if token exists", function(done) {
    token.tokenExists({ username }, testToken, function(err, bool) {
      should(err).not.be.ok();
      should(bool).be.ok();
      return done();
    });
  });

  it("returns false if token does not exist", function(done) {
    token.tokenExists({ username }, "does-not-exist", function(err, bool) {
      should(err).not.be.ok();
      should(bool).eql(false);
      return done();
    });
  });

  it("errors if user can not be found", function(done) {
    token.tokenExists({ username: "does-not-exist" }, testToken, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("token.deleteToken", function() {
  const username = "deleteToken";
  let testToken;

  before(function(done) {
    user.createUser({ user: {username} }, function(err) {
      should(err).not.be.ok();
      token.createToken({ username }, function(err2, t) {
        should(err2).not.be.ok();
        testToken = t;
        return done();
      });
    });
  });

  it("deletes token", function(done) {
    token.deleteToken({ username }, testToken, function(err) {
      should(err).not.be.ok();
      token.tokenExists({ username }, testToken, function(err2, obj) {
        should(err2).not.be.ok();
        should(obj).eql(false);
        return done();
      });
    });
  });

  it("errors if token does not exist", function(done) {
    token.deleteToken({ username }, testToken, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if user does not exist", function(done) {
    token.deleteToken({ username: "does-not-exist" }, testToken, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});
