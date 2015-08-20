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
  circle.init({}, done);
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
});
