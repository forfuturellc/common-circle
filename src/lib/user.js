/**
 * A user is.... figure it out :)
 */


export default {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  addLeaderToGroup: composeAddRemoveGroupMember({ roles: "leaders" }),
  addMemberToGroup: composeAddRemoveGroupMember({ roles: "members" }),
  isAdmin: composeIsInGroup({ groupname: "admin" }),
  isLeaderInGroup: composeIsInGroup({ roles: "leaders" }),
  isMemberInGroup: composeIsInGroup({ roles: "members" }),
  removeLeaderFromGroup: composeAddRemoveGroupMember({ action: "remove", roles: "leaders" }),
  removeMemberFromGroup: composeAddRemoveGroupMember({ action: "remove", roles: "members" }),
};


// npm-installed modules
import _ from "lodash";


// own modules
import grp from "./group";
import orm from "./orm";
import utils from "./utils";


// user schema
const userSchema = {
  identity: "user",
  connection: "default",
  attributes: {
    username: {
      type: "string",
      required: true,
      unique: true,
    },
    password: {
      type: "string",
      required: true,
    },
    tokens: {
      collection: "token",
      via: "owner",
    },
    groups: {
      collection: "group",
      via: "members",
    },
    leading: {
      collection: "group",
      via: "leaders",
    },
  },
  beforeCreate(values, next) {
    return utils.hash(values.password, function(err, hash) {
      if (err) {
        return next(err);
      }
      values.password = hash;
      return next();
    });
  },
  beforeUpdate(values, next) {
    if (!values.password) {
      return next();
    }
    return utils.hash(values.password, function(err, hash) {
      if (err) {
        return next(err);
      }
      values.password = hash;
      return next();
    });
  },
};


// register user schema with orm
orm.registerSchema(userSchema);


/**
 * Create a new user
 *
 * @param {Object} details
 * @param {Object} details.user
 * @param {Object} details.group
 * @param {Function} done - done(err, user)
 */
function createUser({ user, group={name: "public"} }, done) {
  return grp.getGroup(group, function(getGroupErr, theGroup) {
    if (getGroupErr) {
      return done(getGroupErr);
    }

    if (!theGroup) {
      return done(new Error(`group '${group}' not found`));
    }

    theGroup.members.add(user);
    return theGroup.save(function(saveErr) {
      if (saveErr) {
        return done(saveErr);
      }
      return done(null);
    });
  });
}


/**
 * Update user information
 *
 * @param {Object} user - user information
 * @param {Function} done - done(err, user)
 */
function updateUser(user, done) {
  return getUser(_.pick(user, "id", "username"), function(getUserErr, u) {
    if (getUserErr) {
      return done(getUserErr);
    }

    _.assign(u, user);
    return u.save(done);
  });
}


/**
 * Return function for removing or adding user to group
 *
 * @param {String} [action="add"]
 * @param {String} [roles="members"]
 * @return {Function}
 */
function composeAddRemoveGroupMember({ action="add", roles="members" }) {
  /**
   * Add/Remove user from group
   *
   * @param {Object} user - user query
   * @param {Object} group - group query
   * @param {Function} done - done(err)
   */
   return function({ user, group }, done) {
     return grp.getGroup(group, function(getGroupErr, g) {
       if (getGroupErr) {
         return done(getGroupErr);
       }

       if (!g) {
         return done(new Error(`group '${group.name || group.id}' not found`));
       }

       return getUser(user, function(getUserErr, u) {
         if (getUserErr) {
           return done(getUserErr);
         }

         if (!u) {
           return done(new Error(`user '${user.name || user.id}' not found`));
         }

         g[roles][action](u.id);
         return g.save(done);
       });
     });
   };
}


/**
 * Get a single user. Automatically loads the tokens.
 *
 * @param {Object} query
 * @param {Function} done - done(err, user)
 */
function getUser(query, done) {
  return orm.getModels().collections.user
    .findOne(query)
    .populate("tokens")
    .populate("groups")
    .populate("leading")
    .exec(done);
}


/**
 * Return a function that can be used to check if user in
 * a certain group
 *
 * @param {Object} params
 * @param {String} params.groupname
 * @param {String} params.roles
 * @return {Function}
 */
function composeIsInGroup({ groupname, roles="members" }) {
  /**
   * Check if user is in group
   *
   * @param {Object} user - user query
   * @param {Object} group - group query
   * @param {Function} done - done(err, bool)
   */
  return function({ user, group={} }, done) {
    const query = { name: group.name || groupname };
    return grp.getGroup(query, function(getGroupErr, g) {
      if (getGroupErr) {
        return done(getGroupErr);
      }

      if (!g) {
        return done(new Error(`group ${query.name} not found`));
      }

      for (let index = 0, len = g[roles].length; index < len; index++) {
        let u = g[roles][index];
        if (u.username === user.username) {
          return done(null, true);
        }
        if (u.id === user.id) {
          return done(null, true);
        }
      }

      return done(null, false);
    });
  };
}



/**
 * Destroy a user. This also deletes all the user's tokens.
 *
 * @param {Object} query
 * @param {Function} done - done(err)
 */
function deleteUser(query, done) {
  return getUser(query, function(getUserErr, user) {
    if (getUserErr) {
      return done(getUserErr);
    }

    if (!user) {
      return done(new Error(`user '${query.username || query.id}' not found`));
    }

    user.tokens.forEach((token) => token.destroy());
    user.groups.forEach((group) => { group.members.remove(user.id); group.save(); });
    user.leading.forEach((group) => { group.leaders.remove(user.id); group.save(); });
    user.destroy(done);
  });
}


/**
 * Get all users. Note that the tokens are not loaded. This is by design;
 * it might be very expensive to do so.
 *
 * @param {Function} done - done(err, users)
 */
function getUsers(done) {
  return orm.getModels().collections.user
    .find()
    .exec(done);
}
