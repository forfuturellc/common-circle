/**
 * A Token is an authorization key
 */


export default {
  createToken,
  deleteToken,
  tokenExists,
};


// npm-installed modules
import async from "async";
import uuid from "node-uuid";


// own modules
import orm from "./orm";
import usr from "./user";
import utils from "./utils";


// tokens schema
const tokenSchema = {
  identity: "token",
  connection: "default",
  migrate: "safe",
  attributes: {
    uuid: {
      type: "string",
      required: true,
      unique: true,
    },
    owner: {
      model: "user",
    },
  },
};


// register the token schema with orm
orm.registerSchema(tokenSchema);


/**
 * Create a token for a user. A token is simply a v4 uuid.
 *
 * @param {Object} query
 * @param {Function} done - done(err, token)
 */
function createToken(query, done) {
  return usr.getUser(query, function(getUserErr, user) {
    if (getUserErr) {
      return done(getUserErr);
    }

    if (!user) {
      return done(new Error(`user '${query.username || query.id}' not found`));
    }

    const token = uuid.v4();

    return utils.hash(token, function(hashErr, hash) {
      if (hashErr) {
        return done(hashErr);
      }

      return orm.getModels().collections.token
        .create({
          uuid: hash,
          owner: user.id,
        }, function(createTokenErr) {
          if (createTokenErr) {
            return done(createTokenErr);
          }
          return done(null, token);
        });
    }); // hashToken
  }); // getUser
}


/**
 * Retrieve users tokens
 *
 * @param {Object} query
 * @param {Function} done - done(err, hashes)
 */
function getTokenHashes(query, done) {
  return usr.getUser(query, function(getUserErr, user) {
    if (getUserErr) {
      return done(getUserErr);
    }

    if (!user) {
      return done(new Error(`user '${query.username || query.id}' not found`));
    }

    return done(null, user.tokens);
  });
}


/**
 * Check if token exists. If found it is returned.
 *
 * @param {Object} query
 * @param {String} token
 * @param {Function} done - done(err, tokenObj)
 */
function tokenExists(query, token, done) {
  return getTokenHashes(query, function(getTokensErr, hashes) {
    if (getTokensErr) {
      return done(getTokensErr);
    }

    if (!hashes || !hashes.length) {
      return done(null, false);
    }

    let index = 0;
    let found = false;

    async.until(() => found || (index >= hashes.length), function(next) {
      utils.hashCompare(token, hashes[index++].uuid, function(err, match) {
        found = match;
        return next(err);
      });
    }, (err) => done(err, found ? hashes[index - 1] : false));
  });
}


/**
 * Destroy a token. Username is required as we use it to search through
 * tokens.
 *
 * @param {Object} query
 * @param {String} token
 * @param {Function} done - done(err)
 */
function deleteToken(query, token, done) {
  return tokenExists(query, token, function(existsErr, tokenObj) {
    if (existsErr) {
      return done(existsErr);
    }

    if (!tokenObj) {
      return done(new Error(`token '${token}' not found`));
    }

    return tokenObj.destroy(done);
  });
}
