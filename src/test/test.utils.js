// npm-installed modules
import should from "should";


// own modules
import utils from "../lib/utils";


describe("utils.hash", function() {
  const plaintext = "plaintext";

  it("returns a hash", function(done) {
    utils.hash(plaintext, function(hashErr, h) {
      should(hashErr).not.be.ok();
      should(h).not.eql(plaintext);
      return done();
    });
  });

  it("hashes correctly", function(done) {
    utils.hash(plaintext, function(hashErr, h) {
      should(hashErr).not.be.ok();
      utils.hashCompare(plaintext, h, function(matchErr, match) {
        should(matchErr).not.be.ok();
        should(match).eql(true);
        return done();
      });
    });
  });
});


describe("utils.hashCompare", function() {
  const plaintext = "plaintext";
  const hash = "$2a$10$PTf31OGVg6Y829mMZLRnceo3hCVIgqIQFtZvSjJRXea8eJ.TUPCWG";

  it("returns true if they match", function(done) {
    utils.hashCompare(plaintext, hash, function(compareErr, match) {
      should(compareErr).not.be.ok();
      should(match).eql(true);
      return done();
    });
  });

  it("returns false if they do not match", function(done) {
    utils.hashCompare(plaintext, "not-a-hash", function(compareErr, match) {
      should(compareErr).not.be.ok();
      should(match).eql(false);
      return done();
    });
  });
});
