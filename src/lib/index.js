/**
 * Database handler
 */


// own modules
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
    function catcher(createErr) {
      if (createErr && createErr.code !== "E_VALIDATION") {
        return done(createErr);
      }
    }

    // create the administrators & public group
    group.createGroup({ name: "admin" }, catcher);
    group.createGroup({ name: "public" }, catcher);

    return process.nextTick(done);
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
