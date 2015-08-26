// npm-installed modules
import should from "should";


// own modules
import user from "../lib/user";
import utils from "../lib/utils";


describe("user.createUser", function() {
  it("creates user", function(done) {
    const username = "sheldon";
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      user.getUser({ username }, function(err2, u) {
        should(err2).not.be.ok();
        should(u).be.ok();
        return done();
      });
    });
  });

  it("errors if user already exists", function(done) {
    const username = "exists";
    user.createUser({ user: {username, password: "pass"} }, function(err1) {
      should(err1).not.be.ok();
      user.createUser({ user: {username} }, function(err2) {
        should(err2).be.ok();
        return done();
      });
    });
  });

  it("allows a custom group", function(done) {
    const username = "in-group";
    user.createUser({ user: {username, password: "pass"}, group: {name: "admin"}}, function(err) {
      should(err).not.be.ok();
      user.isAdmin({ user: {username} }, function(err2, bool) {
        should(err2).not.be.ok();
        should(bool).eql(true);
        return done();
      });
    });
  });

  it("errors if group does not exist", function(done) {
    user.createUser({ user: {username: "does-not-exist", password: "pass"}, group: { name: "does-not-exist" } }, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("hashes the user's password", function(done) {
    const username = "hashPasswordAutomatically";
    const password = "password";
    user.createUser({ user: {username, password}}, function(err) {
      should(err).not.be.ok();
      user.getUser({ username }, function(getErr, u) {
        should(getErr).not.be.ok();
        should(u.password).not.eql(password);
        utils.hashCompare(password, u.password, function(compareErr, match) {
          should(compareErr).not.be.ok();
          should(match).eql(true);
          return done();
        });
      });
    });
  });
});


describe("user.updateUser", function() {
  const username = "updateUser";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"}}, done);
  });

  it("updates user information + hashes password", function(done) {
    const password = "new-password";
    user.updateUser({ username, password}, function(updateErr) {
      should(updateErr).not.be.ok();
      user.getUser({ username }, function(getErr, u) {
        should(getErr).not.be.ok();
        utils.hashCompare(password, u.password, function(compareErr, match) {
          should(compareErr).not.be.ok();
          should(match).eql(true);
          return done();
        });
      });
    });
  });
});


describe("user.getUser", function() {
  const username = "getUser";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, done);
  });

  it("returns the user", function(done) {
    user.getUser({ username }, function(err, u) {
      should(err).not.be.ok();
      should(u).be.ok();
      return done();
    });
  });

  it("returns 'undefined' if user is not found", function(done) {
    user.getUser({ username: "does-not-exist" }, function(err, u) {
      should(err).not.be.ok();
      should(u).eql(undefined);
      return done();
    });
  });
});


describe("user.getUsers", function() {
  it("returns all users", function(done) {
    user.getUsers(function(err, us) {
      should(err).not.be.ok();
      should(us).be.an.Array();
      return done();
    });
  });
});


describe("user.addMemberToGroup", function() {
  const username = "addMemberToGroup";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, done);
  });

  it("adds user to group", function(done) {
    user.addMemberToGroup({
      user: { username },
      group: { name: "admin" },
    }, function(err) {
      should(err).not.be.ok();
      user.isAdmin({ user: { username } }, function(err2, bool) {
        should(err2).not.be.ok();
        should(bool).eql(true);
        return done();
      });
    });
  });

  it("errors if user already in group", function(done) {
    const query = { user: { username }, group: { name: "admin" } };
    user.addMemberToGroup(query, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if group is not found", function(done) {
    user.addMemberToGroup({
      user: { username },
      group: { name: "does-not-exist" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if user is not found", function(done) {
    user.addMemberToGroup({
      user: { username: "does-not-exist" },
      group: { name: "public" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("user.addLeaderToGroup", function() {
  const username = "addLeaderToGroup";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, done);
  });

  it("adds leader to group", function(done) {
    user.addLeaderToGroup({
      user: { username },
      group: { name: "public" },
    }, function(err) {
      should(err).not.be.ok();
      user.isLeaderInGroup({
        user: { username },
        group: { name: "public" },
      }, function(err2, bool) {
        should(err2).not.be.ok();
        should(bool).eql(true);
        return done();
      });
    });
  });

  it("errors if user already in group", function(done) {
    const query = { user: { username }, group: { name: "public" } };
    user.addLeaderToGroup(query, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if group is not found", function(done) {
    user.addLeaderToGroup({
      user: { username },
      group: { name: "does-not-exist" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if user is not found", function(done) {
    user.addLeaderToGroup({
      user: { username: "does-not-exist" },
      group: { name: "admin" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("user.isMemberInGroup", function() {
  const username = "isMemberInGroup";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      return done();
    });
  });

  it("return true if user is a group", function(done) {
    user.isMemberInGroup({
      user: { username },
      group: { name: "public" },
    }, function(err, bool) {
      should(err).not.be.ok();
      should(bool).eql(true);
      return done();
    });
  });

  it("returns false if user is not found", function(done) {
    user.isMemberInGroup({
      user: { username },
      group: { name: "admin" },
    }, function(err, bool) {
      should(err).not.be.ok();
      should(bool).eql(false);
      return done();
    });
  });

  it("errors if group is not found", function(done) {
    user.isMemberInGroup({
      user: { username },
      group: { name: "does-not-exist" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("user.isLeaderInGroup", function() {
  const username = "isLeaderInGroup";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      user.addLeaderToGroup({
        user: { username },
        group: { name: "public" },
      }, done);
    });
  });

  it("return true if user is a leader", function(done) {
    user.isLeaderInGroup({
      user: { username },
      group: { name: "public" },
    }, function(err, bool) {
      should(err).not.be.ok();
      should(bool).eql(true);
      return done();
    });
  });

  it("returns false if user is not a leader", function(done) {
    user.isLeaderInGroup({
      user: { username },
      group: { name: "admin" },
    }, function(err, bool) {
      should(err).not.be.ok();
      should(bool).eql(false);
      return done();
    });
  });

  it("errors if group is not found", function(done) {
    user.isLeaderInGroup({
      user: { username },
      group: { name: "does-not-exist" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("user.removeMemberFromGroup", function() {
  const username = "removeMemberFromGroup";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      user.addMemberToGroup({
        user: { username },
        group: { name: "admin" },
      }, done);
    });
  });

  it("removes user from group", function(done) {
    user.removeMemberFromGroup({
      user: { username },
      group: { name: "admin" },
    }, function(err) {
      should(err).not.be.ok();
      user.isMemberInGroup({
        user: { username },
        group: { name: "admin" },
      }, function(err2, bool) {
        should(err2).not.be.ok();
        should(bool).eql(false);
        return done();
      });
    });
  });

  it("errors if user is not in group", function(done) {
    user.removeMemberFromGroup({
      user: { username: "does-not-exist" },
      group: { name: "admin" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if group is not found", function(done) {
    user.removeMemberFromGroup({
      user: { username },
      group: { name: "does-not-exist" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("user.removeLeaderFromGroup", function() {
  const username = "removeLeaderFromGroup";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      user.addLeaderToGroup({
        user: { username },
        group: { name: "public" },
      }, done);
    });
  });

  it("removes user as leader of group", function(done) {
    user.removeLeaderFromGroup({
      user: { username },
      group: { name: "public" },
    }, function(err) {
      should(err).not.be.ok();
      user.isLeaderInGroup({
        user: { username },
        group: { name: "public" },
      }, function(err2, bool) {
        should(err2).not.be.ok();
        should(bool).eql(false);
        return done();
      });
    });
  });

  it("errors if user is not found", function(done) {
    user.removeLeaderFromGroup({
      user: { username: "does-not-exist" },
      group: { name: "public" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });

  it("errors if group is not found", function(done) {
    user.removeLeaderFromGroup({
      user: { username },
      group: { name: "does-not-exist" },
    }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});


describe("user.deleteUser", function() {
  const username = "deleteUser";

  before(function(done) {
    user.createUser({ user: {username, password: "pass"} }, function(err) {
      should(err).not.be.ok();
      return done();
    });
  });

  it("deletes user", function(done) {
    user.deleteUser({ username }, function(err) {
      should(err).not.be.ok();
      user.getUser({ username }, function(err2, u) {
        should(err2).not.be.ok();
        should(u).not.be.ok();
        return done();
      });
    });
  });

  it("errors if user does not exist", function(done) {
    user.deleteUser({ username: "does-not-exist" }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});
