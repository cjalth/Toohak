import {
  reqAdminAuthRegister,
  reqAdminAuthLogout,
  reqClear
} from './testHelpers';

let user: { body: { token: string }; statusCode: number };
const ERROR = { error: expect.any(String) };

describe('adminAuthLogout Tests', () => {
  beforeEach(() => {
    reqClear();

    user = reqAdminAuthRegister(
      'randall.boggs@unsw.edu.au',
      'Password123',
      'Randall',
      'Boggs'
    );

    reqAdminAuthRegister(
      'james.sully@unsw.edu.au',
      'Password321',
      'James',
      'Sullivan'
    );
  });

  describe('Logout Error Cases', () => {
    test.each([
      {
        token: null,
        description: 'Session is null',
        expectedStatusCode: 401,
        expectedBody: ERROR,
      },
      {
        token: '444444444',
        description: 'Session is invalid',
        expectedStatusCode: 401,
        expectedBody: ERROR,
      },
    ])(
      'Error with $description',
      ({ token, expectedStatusCode, expectedBody }) => {
        const result = reqAdminAuthLogout(token);
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(result.body).toStrictEqual(expectedBody);
      }
    );
  });

  test('Sucessful Logout Case', () => {
    expect(
      reqAdminAuthLogout(user.body.token)
    ).toStrictEqual({
      body: {},
      statusCode: 200,
    });
  });
});
