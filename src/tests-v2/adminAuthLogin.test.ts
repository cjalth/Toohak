import {
  reqAdminAuthLogin,
  reqAdminAuthRegister,
  reqClear,
  reqUserDetails,
} from './testHelpers';

let user: { token: string };

const ERROR = { error: expect.any(String) };
const SUCCESS = { token: expect.any(String) };

beforeEach(() => {
  reqClear();
  user = reqAdminAuthRegister('dean.hardscrabble@unsw.edu.au', 'Password1', 'Dean', 'Hardscrabble').body;
});

describe('Successful Test Case', () => {
  test('Test: Successfully logged in.', () => {
    expect(
      reqAdminAuthLogin('dean.hardscrabble@unsw.edu.au', 'Password1')
    ).toStrictEqual({
      body: SUCCESS,
      statusCode: 200,
    });
  });
});

describe('Error Cases', () => {
  test.each([
    { email: 'dean.hardscrabble@gmail.com', password: 'Password1' },
    { email: 'dean.hardscrabble@unsw.edu.au', password: 'Notrightpass2' },
    { email: null, password: 'Password1' },
    { email: 'dean.hardscrabblei@unsw.edu.au', password: null },
    { email: null, password: null },
  ])(
    'error with email="$email", password="$password" ',
    ({ email, password }) => {
      expect(reqAdminAuthLogin(email, password)).toStrictEqual({
        body: ERROR,
        statusCode: 400,
      });
    }
  );

  test('Login and Password Failed Counter', () => {
    expect(
      reqAdminAuthLogin('dean.hardscrabble@unsw.edu.au', 'Password1')
    ).toStrictEqual({
      body: SUCCESS,
      statusCode: 200,
    });

    expect(
      reqAdminAuthLogin('dean.hardscrabble@unsw.edu.au', 'Password1')
    ).toStrictEqual({
      body: SUCCESS,
      statusCode: 200,
    });

    expect(
      reqAdminAuthLogin('dean.hardscrabble@unsw.edu.au', 'Password1')
    ).toStrictEqual({
      body: SUCCESS,
      statusCode: 200,
    });

    expect(
      reqAdminAuthLogin('dean.hardscrabble@unsw.edu.au', 'Password21')
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });

    expect(
      reqAdminAuthLogin('dean.hardscrabble@unsw.edu.au', 'Password21')
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });

    expect(reqUserDetails(user.token).body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Dean Hardscrabble',
        email: 'dean.hardscrabble@unsw.edu.au',
        numSuccessfulLogins: 4,
        numFailedPasswordsSinceLastLogin: 2,
      },
    });
  });
});
