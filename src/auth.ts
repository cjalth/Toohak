import validator from 'validator';
import { getData, setData, Data } from './dataStore';
import {
  findUserByEmail,
  isValidName,
  isValidNameLength,
  validatePassword,
  findUserByToken,
  retrieveSession,
  getHashOf,
} from './helperFunctions';
import HTTPError from 'http-errors';
/**
 * Registers a user with an email, password, names and returns their authUserID
 * Handles errors for the database.
 * @param {string} email - email of user
 * @param {string} password - password of user
 * @param {string} nameFirst - first name
 * @param {string} nameLast - last name
 *
 * @returns {token: string} - The current session ID of the user.
 */

function generateRandomToken(database: Data): string {
  database.sessionIdCounter++;
  const tokenToHash = database.sessionIdCounter;
  return getHashOf(tokenToHash.toString());
}

function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): { token?: string; error?: string } {
  const database = getData();

  // find if the user email exists already
  const duplicateEmail = findUserByEmail(database.user, email);
  if (duplicateEmail) {
    throw HTTPError(400, 'Email address is used by another user.');
  }

  // validate the email address
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Email is not valid.');
  }

  // only takes first name that is lowercase/uppercase letters, spaces, hyphens, or apostrophes
  if (!isValidName(nameFirst)) {
    throw HTTPError(400, 'First name contains invalid characters.');
  }

  // ensures the name is in range of 2 and 20
  if (!isValidNameLength(nameFirst)) {
    throw HTTPError(400, 'First name length should be between 2 and 20 characters.');
  }

  // only takes last name that is lowercase/uppercase letters, spaces, hyphens, or apostrophes
  if (!isValidName(nameLast)) {
    throw HTTPError(400, 'Last name contains invalid characters.');
  }

  // ensures the name is in range of 2 and 20
  if (!isValidNameLength(nameLast)) {
    throw HTTPError(400, 'Last name length should be between 2 and 20 characters.');
  }

  // password should be correct length
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw HTTPError(400, passwordError);
  }

  const hashPassword = getHashOf(password);

  // passing all errors, create and populate the database
  const user = {
    userId: database.authUserIdCounter++,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: hashPassword,
    previousPasswords: [hashPassword],
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
    numQuizMade: 0,
    sessions: [{ token: generateRandomToken(database), valid: true }],
  };
  user.numSuccessfulLogins++;
  // set the user in the database
  database.user.push(user);
  setData(database);

  return {
    token: user.sessions[0].token,
  };
}

/**
 * Given a registered user's email and password returns their authUserId value.
 * Count the Number of Successful logins if the password is correct, or else count the number
 * of failed attempts and store that inside of the user object.
 * @param {string} email - email of user
 * @param {string} password - password of user
 *
 * @returns {token: string} - The current session ID of the user.
 */

function adminAuthLogin(
  email: string,
  password: string
): { token?: string; error?: string } {
  if (!email || !password) {
    throw HTTPError(400, 'Email and Password are required');
  }

  const database = getData();
  const userFound = findUserByEmail(database.user, email);
  const hashPassword = getHashOf(password);

  // ensure the userFound variable contains the email
  if (!userFound) {
    throw HTTPError(400, 'Email does not exist');
  } else if (userFound.password !== hashPassword) {
    userFound.numFailedPasswordsSinceLastLogin++;
    setData(database);
    throw HTTPError(400, 'Password is not correct for the given email');
  }

  const newSession = { token: generateRandomToken(database), valid: true };
  userFound.numSuccessfulLogins++;
  userFound.sessions.push(newSession);
  setData(database);

  return {
    token: newSession.token,
  };
}

/**
 * Logout is called with on a token that is returned after
 * either a login or register has been made.
 * This function will log that user session out.
 * @param {number} token - email of user
 *
 * @returns {error?: string} error? if logout unsuccessful
 */

function adminAuthLogout(
  token: string
): { error?: string } {
  const database = getData();
  const { user, session } = retrieveSession(database.user, token);

  if (!user || !session) {
    throw HTTPError(401, 'Session not found');
  }

  session.valid = false;
  setData(database);
  return {};
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 *
 * @param {token: string} - The current session ID of the user.
 * @returns {user: {userId: number}}   - The user ID of the admin user.
 * @returns {user: {name: string}}  - The first and last name of the admin user concatenated with a single space between them.
 * @returns {user: {email: string}}  - The email address of the admin user.
 * @returns {user: {numSuccessfulLogins: number}}    - The number of successful logins by the admin user.
 * @returns {user: {numFailedPasswordsSinceLastLogin: number}}  - The number of failed password attempts since the last successful login.
 */
function adminUserDetails(token: string): {
  user?: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };

  error?: string;
} {
  const database = getData();
  const user = findUserByToken(database.user, token);

  if (!user) {
    throw HTTPError(401, 'User not found');
  }

  const session = user.sessions.find((session) => session.token === token);
  if (!session.valid) {
    throw HTTPError(401, 'User is logged out');
  }

  return {
    user: {
      userId: user.userId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    },
  };
}

/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 *
 * @param {token: string} - The current session ID of the user.
 * @param {email: string}  - The updated email of the admin user.
 * @param {nameFirst: string}  - The updated first name of the admin user.
 * @param {nameLast: string}  - The updated last name of the admin user.
 *
 * @returns {object} - An empty object indicating successful update.
 */
function adminUserDetailsUpdate(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): { error?: string } {
  // getting the data and setting up the validator
  const data = getData();

  const user = findUserByToken(data.user, token);

  if (!user) {
    throw HTTPError(401, 'User not found');
  }

  const session = user.sessions.find((session) => session.token === token);
  if (!session.valid) {
    throw HTTPError(401, 'User is logged out');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Email is not a valid email address.');
  }

  if (findUserByEmail(data.user, email)) {
    throw HTTPError(400, 'Email is currently used by another user.');
  }

  if (!isValidNameLength(nameFirst)) {
    throw HTTPError(400, 'NameFirst must be between 2 and 20 characters long.');
  }

  if (!isValidName(nameFirst)) {
    throw HTTPError(400, 'NameFirst contains invalid characters.');
  }

  if (!isValidNameLength(nameLast)) {
    throw HTTPError(400, 'NameLast must be between 2 and 20 characters long.');
  }

  // returns error if last name contains invalid characters
  if (!isValidName(nameLast)) {
    throw HTTPError(400, 'NameLast contains invalid characters.');
  }
  // sets the new data
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);

  return {};
}

/**
 * Updates the password of a logged in user.
 *
 * @param {token: string} - The current session ID of the user.
 * @param {oldPassword: string}  - The old password of the user.
 * @param {newPassword: string}  - The new password to be set for the user.
 *
 * @returns {object} - An empty object indicating successful password update.
 */
function adminUserPasswordUpdate(
  token: string,
  oldPassword: string,
  newPassword: string
): { error?: string } {
  const data = getData();
  // Hash passwords correctly
  const hashedOldPass = getHashOf(oldPassword);
  const hashedNewPass = getHashOf(newPassword);

  const user = findUserByToken(data.user, token);

  if (!user) {
    throw HTTPError(401, 'User not found');
  }

  const session = user.sessions.find((session) => session.token === token);
  if (!session.valid) {
    throw HTTPError(401, 'User is logged out');
  }

  // Compare hashed old password correctly
  if (user.password !== hashedOldPass) {
    throw HTTPError(400, 'Old Password does not match');
  }

  // Ensure new password is different from the old password
  if (hashedOldPass === hashedNewPass) {
    throw HTTPError(400, 'New password and old password cannot match');
  }

  // Check against hashed previous passwords
  if (user.previousPasswords.includes(hashedNewPass)) {
    throw HTTPError(400, 'New Password has already been used before by this user.');
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    throw HTTPError(400, passwordError);
  }

  // Store the hashed new password
  user.password = hashedNewPass;

  // Add the hashed new password to the list of previous passwords
  user.previousPasswords.push(hashedNewPass);

  setData(data);

  return {};
}

export {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
  adminUserPasswordUpdate,
  adminUserDetailsUpdate,
  adminAuthLogout
};
