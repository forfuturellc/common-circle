/**
 * Error definitions
 */


// npm-installed modules
import errors from "common-errors";


export default {
  GroupExistsError: errors.helpers.generateClass("GroupExistsError"),
  GroupNotFoundError: errors.helpers.generateClass("GroupNotFoundError"),
  MissingAdapterError: errors.helpers.generateClass("MissingAdapterError"),
  OrmInitError: errors.helpers.generateClass("OrmInitError"),
  TokenNotFoundError: errors.helpers.generateClass("TokenNotFoundError"),
  UserAlreadyLeaderError: errors.helpers.generateClass("UserAlreadyLeaderError"),
  UserAlreadyMemberError: errors.helpers.generateClass("UserAlreadyMemberError"),
  UserNotLeaderError: errors.helpers.generateClass("UserNotLeaderError"),
  UserNotMemberError: errors.helpers.generateClass("UserNotMemberError"),
  UserExistsError: errors.helpers.generateClass("UserExistsError"),
  UserNotFoundError: errors.helpers.generateClass("UserNotFoundError"),
};
