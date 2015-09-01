/**
 * A group is a collection of users whose share roles
 * in your system
 */


export default {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
};


// own modules
import orm from "./orm";


// groups schema
const groupSchema = {
  identity: "group",
  connection: "default",
  migrate: "safe",
  attributes: {
    name: {
      type: "string",
      required: true,
      unique: true,
    },
    members: {
      collection: "user",
      via: "groups",
      dominant: true,
    },
    leaders: {
      collection: "user",
      via: "leading",
      dominant: true,
    },
  },
};


// register the group schema with orm
orm.registerSchema(groupSchema);


/**
 * Create a new group
 *
 * @param {Object} params
 * @param {Function} done - done(err)
 */
function createGroup(params, done) {
  return orm.getModels().collections.group.create(params, done);
}


/**
 * Get a group. It populates the members and leaders automatically.
 *
 * @param {Object} query - search query
 * @param {Function} done - done(err, group)
 */
function getGroup(query, done) {
  return orm.getModels().collections.group
    .findOne(query)
    .populate("members")
    .populate("leaders")
    .exec(done);
}


/**
 * Get all groups. Members and leaders are not loaded automatically.
 * This is by design; avoid too much data fetching.
 *
 * @param {Function} done - done(err, groups)
 */
function getGroups(done) {
  return orm.getModels()
    .collections.group.find().exec(done);
}


/**
 * Delete a group
 *
 * @param {Object} query
 * @param {Function} done - done(err)
 */
function deleteGroup(query, done) {
  return getGroup(query, function(getGroupErr, group) {
    if (getGroupErr) {
      return done(getGroupErr);
    }

    if (!group) {
      return done(new Error(`group '${query.name || query.id}' not found`));
    }

    return group.destroy(function(destroyErr) {
      return done(destroyErr, group);
    });
  });
}
