import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqUserDetails,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
});

test('Token passed is not a valid user.', () => {
  const userToken = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe');
  expect(reqUserDetails(userToken.body.token + 1)).toStrictEqual({
    body: ERROR,
    statusCode: 401
  });
});

test('Logged out user', () => {
  const userToken = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe');
  expect(reqAdminAuthLogout(userToken.body.token)).toStrictEqual({
    body: {},
    statusCode: 200
  });
  expect(reqUserDetails(userToken.body.token)).toStrictEqual({
    body: ERROR,
    statusCode: 401
  });
});

test('Correct return type.', () => {
  const userToken = reqAdminAuthRegister('helloworld@gmail.com', 'Password1', 'John', 'Doe');
  expect(reqUserDetails(userToken.body.token)).toStrictEqual({
    body: {
      user: {
        userId: expect.any(Number),
        name: 'John Doe',
        email: 'helloworld@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      },
    },
    statusCode: 200
  });
});
