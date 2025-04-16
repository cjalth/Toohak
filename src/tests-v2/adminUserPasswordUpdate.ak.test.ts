import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqPassUpdate,
} from './testHelpers';

const ERROR = { error: expect.any(String) };
let userToken: {body: {token: string}, statusCode: number};

beforeEach(() => {
  reqClear();
  userToken = reqAdminAuthRegister('helloworld@gmail.com', 'Password1', 'John', 'Doe');
});

describe('Errors', () => {
  test('invalid user', () => {
    expect(
      reqPassUpdate(userToken.body.token + 32, 'Password1', 'Password2')
    ).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userToken.body.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqPassUpdate(userToken.body.token, 'Password1', 'Password2')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test.each([
    { oldPass: 'Password1', newPass: 'Password1' },
    { oldPass: 'Password3', newPass: 'Password2' },
    { oldPass: 'Password1', newPass: 'Pa1' },
    { oldPass: 'Password1', newPass: 'Passwordfdbfd' },
    { oldPass: 'Password1', newPass: '59259895298' },
  ])('error cases', ({ oldPass, newPass }) => {
    expect(
      reqPassUpdate(userToken.body.token, oldPass, newPass)
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('password used previously', () => {
    reqPassUpdate(userToken.body.token, 'Password1', 'Password2');
    expect(reqPassUpdate(userToken.body.token, 'Password2', 'Password1')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});

test('correct return type', () => {
  expect(
    reqPassUpdate(userToken.body.token, 'Password1', 'Password2')
  ).toStrictEqual({
    body: {},
    statusCode: 200
  });
});
