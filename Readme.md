
# common-circle

> A General Implementation of User and Group Management

> :construction: Highly **Work In Progress** :construction:

[![node](https://img.shields.io/node/v/common-circle.svg?style=flat-square)](https://www.npmjs.com/package/common-circle) [![npm](https://img.shields.io/npm/v/common-circle.svg?style=flat-square)](https://www.npmjs.com/package/common-circle) [![Travis](https://img.shields.io/travis/forfutureLLC/common-circle.svg?style=flat-square)](https://travis-ci.org/forfutureLLC/common-circle) [![Gemnasium](https://img.shields.io/gemnasium/forfutureLLC/common-circle.svg?style=flat-square)](https://gemnasium.com/forfutureLLC/common-circle) [![Coveralls](https://img.shields.io/coveralls/forfutureLLC/common-circle.svg?style=flat-square)](https://coveralls.io/github/forfutureLLC/common-circle?branch=master)


## toc:

1. [installation](#installation)
1. [principles](#principles)
1. [API](#api)
1. [adapters](#adapters)
1. [license](#license)


<a name="installation"></a>
## installation:

```bash
$ npm install common-circle
```


<a name="principles"></a>
## principles:

> Why did you make **common-circle**?

Well, we have been working on some applications that require simple user management. In the different applications, we had to build it from scratch. This means more code to write, more tests to run, etc. This is tiring.

Using a single module for user and group management would ensure less work. Let's invent the wheel just once.

> Does it **work** for my application?

If your application requires simple user and group management, this module **might** work.

This module implements common database models and methods such as *user tokens, matching user's password, etc*. It aims at reducing the work of re-implementing such common stuff while **not** enforcing a way of doing things in your application.

This module might **not** satisfy all your application needs. It is up to you to see if the module suits your application. You can always build around it to meet your needs. This way you just focus on the needs the module does **not** satisfy.


<a name="api"></a>
## API:

```js
const circle = require("common-circle");
```

Before starting to handling entities, you'll need to [initialize the circle](#init).

The API is centered around three entities:

* [Group](#entity-group): a group of users, sharing roles (`circle.group`)
  * each group has its own leaders
* [User](#entity-user): an application user (`circle.user`)
* [Token](#entity-token): a user's token, usually for authorization (`circle.token`)

Also, the following inner modules are exported off `circle`:

* `errors`: for handling errors *(currently, almost useless)*


<a name="init"></a>
### circle.init(config, done)

Initializes the circle.

* `config` (Object)
  * `config.adapter` (Object): configurations for your adapter
  * `config.adapter.name` (String): name of adapter e.g. `"sails-disk"`. See [adapters](#adapters).
  * `config.schemas` (Object): mapping of schemas
* `done(err)` (Function): called once the circle is done initialized

By default, circle uses [sails-disk](https://github.com/balderdashy/sails-disk). If you are testing out things, you need **not** configure aything at all. Just pass an empty object, `{}`.

The groups, **admin** and **public**, are created automatically for you.

Since you might want to modify the built-in schemas or even add new ones, `config.schemas` can be used. It is an object of schemas. For example,

```js
{
  dog: {
    attributes: {
      name: { type: "string" },
    },
  },
  cat: {
    attributes: {
      name: { type: "string" },
      meow() {
        console.log("meow");
      },
    },
  },
}
```

The built-in schemas and user schemas (the ones you pass here) are **merged** together. This means that you can simply modify a built-in schema by defining the modified properties in `config.schemas.<identity>`.

For example, modifying user schema,

```js
{
  user: {
    attributes: {
      hometown: {
        type: "string",
      },
    },
  },
}
```

See [how to define schemas](https://github.com/balderdashy/waterline-docs/blob/master/models/models.md). **Note** that the properties `identity` and `connection` can be omitted, in which case, they will default to key of the schema (e.g. `"dog"` or `"cat"`) and `"default"` respectively.

If you wish to modify the built-in schemas, inspect them in the relevant files in `src/`.


Errors may occur if:
  * adapter is **not** installed
  * underlying waterline orm **failed** to initialize



<a name="entity-group"></a>
### Group:

<a name="group-id"></a>
#### group identifier:

* `query`: (Object)
  * `query.name` (String): name of group
  * `query.id` (Number): id of group

`query.name` and `query.id` are mutually exclusive.


#### group.createGroup(params, done)

Creates a new group.

* `params` (Object): group properties
  * `params.name` (String): name of the group
* `done(err)` (Function)
  * `err` (Error)

Errors may occur if:
  * group already exists


#### group.deleteGroup(query, done)

Deletes group.

* `query` (Object): [identifier](#group-id)
* `done(err)` (Function)

Errors may occur if:
  * group does **not** exist


#### group.getGroup(query, done)

Get a single group. The group is populated with its members and leaders.

* `query` (Object): [identifier](#group-id)
* `done(err, group)` (Function)
  * `err` (Error)
  * `group` (Object|null)


#### group.getGroups(done)

Get all groups.

* `done(err, groups)` (Function)
  * `err` (Error)
  * `groups` (Array): an array of groups


<a name="entity-user"></a>
### User:

<a name="user-id"></a>
#### user identifier:

* `query`: (Object)
  * `query.username` (String): username of user
  * `query.id` (Number): id of group

`query.username` and `query.id` are mutually exclusive.


<a name="user-model"></a>
#### user model:

* `username` (String)
* `password` (String)
* `tokens` (String[])
* `matchPassword(password, done)`
  * `password` (String)
  * `done(err, isCorrect)`


#### user.createUser(query, done)

Create a single user.

* `query` (Object):
  * `query.user.username` (String): username of user
  * `query.user.password` (String): password of user
  * `query.group`: [identifier](#user-id). If not specified, user is created in the **public** group.
* `done(err)` (Function)
  * `err` (Error)

Errors may occur if:
  * user already exists
  * group does **not** exist


#### user.updateUser(query, done)

Update user information.

* `query` (Object): ([identifier](#user-id)) + properties to update
* `done(err)` (Function)
  * `err` (Error)


#### user.deleteUser(query, done)

Delete a single user.

* `query` (Object): [identifier](#user-id)
* `done(err)` (Function)
  * `err` (Error)

Errors may occur if:
  * user does **not** exist


#### user.getUser(query, done)

Get a single user. The user, if found, is populated with tokens, groups they are member and leader of.

* `query` (Object): [identifier](#user-id)
* `done(err, user)` (Function)
  * `err` (Error)
  * `user` (Object|null): [user model](#user-model)


#### user.getUsers(done)

Get all users.

* `done(err, users)` (Function):
  * `err` (Error)
  * `users` (Array): array of users


#### user.addLeaderToGroup(query, done)

Add user as leader of group.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
  * `query.group`: [group identifier](#group-id)
* `done(err)` (Function)

Errors may occur if:
  * user is already a leader in the group
  * user does **not** exist
  * group does **not** exist


#### user.addMemberToGroup(query, done)

Add user as member of group.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
  * `query.group`: [group identifier](#group-id)
* `done(err)` (Function)

Errors may occur if:
  * user is already a member in the group
  * user does **not** exist
  * group does **not** exist


#### user.isAdmin(query, done)

Check if user is administrator.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
* `done(err, isAdmin)`
  * `err` (Error)
  * `isAdmin` (Boolean)


#### user.isMemberInGroup(query, done)

Check if user is member of group.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
  * `query.group`: [group identifier](#group-id)
* `done(err, isUser)` (Function)
  * `err` (Error)
  * `isUser` (Boolean)

Errors may occur if:
  * group does **not** exist


#### user.isLeaderInGroup(query, done)

Check if user is a leader of the group.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
  * `query.group`: [group identifier](#group-id)
* `done(err, isUser)` (Function)
  * `err` (Error)
  * `isLeader` (Boolean)

Errors may occur if:
  * group does **not** exist


#### user.removeLeaderFromGroup(query, done)

Remove user as leader from group.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
  * `query.group`: [group identifier](#group-id)
* `done(err, isUser)` (Function)
  * `err` (Error)

Errors may occur if:
  * user is **not** a group leader
  * group does **not** exist


#### user.removeMemberFromGroup(query, done)

Remove user as member from group.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
  * `query.group`: [group identifier](#group-id)
* `done(err, isUser)` (Function)
  * `err` (Error)

Errors may occur if:
  * user is **not** a group member
  * group does **not** exist


<a name="entity-token"></a>
### Token:

<a name="token"></a>
#### token:

A token is a UUID (universally unique identifier). It is hashed and stored into store.


#### token.createToken(query, done)

Create a token for a user.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
* `done(err, token)` (Function)
  * `err` (Error)
  * `token` (String): [token](#token)

Errors may occur if:
  * user does **not** exist


#### token.deleteToken(query, token, done)

Delete a token.

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
* `token` (String): [token](#token)
* `done(err)` (Function)
  * `err` (Error)

Errors may occur if:
  * token does **not** exist
  * user does **not** exist


#### token.tokenExists(query, token, done)

* `query` (Object)
  * `query.user`: [user identifier](#user-id)
* `token` (String): [token](#token)
* `done(err, exists)` (Function)
  * `err` (Error)
  * `exists` (Boolean)

Errors may occur if:
  * user does **not** exist



<a name="adapters"></a>
## adapters:

Since we use different databases for different purposes, we are using an ORM, [Waterline](https://github.com/balderdashy/waterline). It allows us to use different [adapters](#waterline-adapters) for different databases.

See the [supported adapters][waterline-adapters].

[waterline-adapters]:https://github.com/balderdashy/waterline-docs#supported-adapters


<a name="license"></a>
## license:

__The MIT License (MIT)__

Copyright &copy; 2015 Forfuture, LLC <we@forfuture.co.ke>
