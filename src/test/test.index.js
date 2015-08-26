// built-in modules
import path from "path";


// npm-installed modules
import shelljs from "shelljs";
import should from "should";


// own modules
import circle from "../lib/index";
import group from "../lib/group";
import token from "../lib/token";
import user from "../lib/user";


before(function(done) {
  shelljs.rm("-rf", path.resolve(__dirname, "../.tmp/"));
  circle.init({
    schemaMods: {
      user: {
        attributes: {
          misc: {
            type: "string",
            defaultsTo: "misc",
          },
        },
      },
    },
  }, done);
});


describe("circle module", function() {
  it("exports the inner modules", function() {
    should.strictEqual(circle.group, group);
    should.strictEqual(circle.token, token);
    should.strictEqual(circle.user, user);
  });
});


describe("circle.init", function() {
  it("creates admin and public groups", function(done) {
    let foundAdmin = false;
    let foundPublic = false;
    group.getGroups(function(err, gs) {
      should(err).not.be.ok();
      gs.forEach(function(g) {
        switch (g.name) {
        case "admin":
          foundAdmin = true;
          return;
        case "public":
          foundPublic = true;
          return;
        }
      });
      should(foundAdmin).eql(true);
      should(foundPublic).eql(true);
      return done();
    });
  });

  it("allows schema modifications", function(done) {
    const username = "schemaMods";
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      user.getUser({ username }, function(getErr, u) {
        should(getErr).not.be.ok();
        should(u.misc).be.ok();
        return done();
      });
    });
  });
});
