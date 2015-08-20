/**
 * Controlling the waterline orm
 */


export default {
  getModels,
  init,
  loadSchema,
};


// npm-installed modules
import _ from "lodash";
import Waterline from "waterline";


// module variables
let models;
const orm = new Waterline();


/**
 * Load schema into the ORM
 *
 * @param {Object} schema
 */
function loadSchema(schema) {
  return orm.loadCollection(schema);
}


/**
 * Return the models
 */
function getModels() {
  return models;
}


/**
 * initialize the orm
 *
 * @param {Object} config - configurations
 * @param {String} config.adapter - configurations for adapter
 * @param {String} config.adapter.name - name of adapter e.g "sails-disk"
 * @param {Function} done - done(err)
 */
function init(config, done) {
  let adapter;

  const c = _.merge({}, {
    adapter: {
      adapter: "default",
      name: "sails-disk",
    },
  }, config);

  // try load the adapter
  try {
    adapter = require(c.adapter.name);
  } catch(err) {
    console.error(`adapter '${c.adapter.name}' is missing. Ensure you do 'npm install ${c.adapter.name}'!`);
    return done(err);
  }

  // orm configurations
  const ormConfig = {
    adapters: {
      default: adapter,
    },
    connections: {
      default: c.adapter,
    },
  };

  return orm.initialize(ormConfig, function(err, m) {
    if (err) {
      return done(err);
    }

    // make the models available as soon as possible for other functions
    models = m;
    return done(null);
  });
}
