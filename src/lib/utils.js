/**
 * Common utilities
 */


export default {
  hash,
  hashCompare,
};


// npm-installed modules
import bcrypt from "bcrypt";


/**
 * Hash a string.
 *
 * @param {String} plaintext
 * @param {Function} done - done(err, hash)
 */
function hash(plaintext, done) {
  return bcrypt.genSalt(10, function(genSaltErr, salt) {
    if (genSaltErr) {
      return done(genSaltErr);
    }

    return bcrypt.hash(plaintext, salt, done);
  });
}


/**
 * Compare a hash and a plaintext's hash
 *
 * @param {String} plaintext
 * @param {String} hash
 * @param {Function} done - done(err, match)
 */
function hashCompare(plaintext, h, done) {
  return bcrypt.compare(plaintext, h, done);
}
