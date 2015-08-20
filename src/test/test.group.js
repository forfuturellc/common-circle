// npm-installed modules
import should from "should";


// own modules
import group from "../lib/group";


describe("group.createGroup", function() {
  it("errors if group already exists", function(done) {
    const name = "exists";
    group.createGroup({ name }, function(err) {
      should(err).not.be.ok();
      group.createGroup({ name }, function(err2) {
        should(err2).be.ok();
        return done();
      });
    });
  });

  it("creates a group", function(done) {
    const name = "created";
    group.createGroup({ name }, function(err) {
      should(err).not.be.ok();
      group.getGroup({ name }, function(err2, g) {
        should(err2).not.be.ok();
        should(g).be.ok();
        return done();
      });
    });
  });
});


describe("group.getGroup", function() {
  it("returns 'undefined' if group does not exist", function(done) {
    const name = "does-not-exist";
    group.getGroup({ name }, function(err, g) {
      should(err).not.be.ok();
      should(g).eql(undefined);
      return done();
    });
  });

  it("returns the target group", function(done) {
    const name = "admin";
    group.getGroup({ name }, function(err, g) {
      should(err).not.be.ok();
      should(g).be.ok();
      return done();
    });
  });
});


describe("group.getGroups", function() {
  it("returns all the groups", function(done) {
    group.getGroups(function(err, gs) {
      should(err).not.be.ok();
      should(gs).be.an.Array();
      should(gs.length).be.above(0);
      return done();
    });
  });
});


describe("group.deleteGroup", function() {
  it("deletes the group", function(done) {
    const name = "delete";
    group.createGroup({ name }, function(err1) {
      should(err1).not.be.ok();
      group.deleteGroup({ name }, function(err2) {
        should(err2).not.be.ok();
        group.getGroup({ name }, function(err3, g) {
          should(err3).not.be.ok();
          should(g).not.be.ok();
          return done();
        });
      });
    });
  });

  it("errors if group is not found", function(done) {
    const name = "does-not-exist";
    group.deleteGroup({ name }, function(err) {
      should(err).be.ok();
      return done();
    });
  });
});
