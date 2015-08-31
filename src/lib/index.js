/**
 * Database handler
 */


// own modules
import async from "async";
import errors from "./errors";
import group from "./group";
import orm from "./orm";
import user from "./user";
import token from "./token";


function init(config, done) {
  orm.init(config, function(err) {
    if (err) {
      return done(err);
    }

    // ignore error if groups already created
    function catcher(next) {
      return function(createErr) {
        if (createErr && createErr.code !== "E_VALIDATION") {
          return next(createErr);
        }
        return next();
      };
    }

    // create the administrators & public group
    return async.series([
      function(next) {
        group.createGroup({ name: "admin" }, catcher(next));
      },
      function(next) {
        group.createGroup({ name: "public" }, catcher(next));
      },
    ], done);
  });
}


export default {
  errors,
  group,
  init,
  token,
  user,
  orm: {
    getModels: orm.getModels,
  },
};
