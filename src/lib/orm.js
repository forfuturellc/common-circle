/**
 * Controlling the waterline orm
 */


export default {
  getModels,
  init,
  registerSchema,
};


// npm-installed modules
import _ from "lodash";
import Waterline from "waterline";


// module variables
let models;
let schemas = { };
let userSchemas = { };
const orm = new Waterline();


/**
 * Return the models
 */
function getModels() {
  return models;
}


/**
 * Register base schemas
 *
 * @param {Object} schema
 */
function registerSchema(schema) {
  schemas[schema.identity] = schema;
}


/**
 * Load schema into the ORM
 *
 * @param {Object} schema
 */
function loadSchemas() {
  let all = {};
  _.merge(all, schemas, userSchemas);
  for (let key in all) {
    let schema = all[key];
    schema.identity = schema.identity || key;
    schema.connection = schema.connection || "default";
    const s = Waterline.Collection.extend(schema);
    orm.loadCollection(s);
  }
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
  userSchemas = config.schemas || { }; // store globally

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

  // load the schemas
  loadSchemas();

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
