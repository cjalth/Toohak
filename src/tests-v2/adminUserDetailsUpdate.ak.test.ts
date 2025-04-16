import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqDetailsUpdate,
  reqUserDetails
} from './testHelpers';

const ERROR: { error: string } = { error: expect.any(String) };

let userToken: { body: {token: string}, statusCode: number };
beforeEach(() => {
  reqClear();
  userToken = reqAdminAuthRegister('helloworld@gmail.com', 'P1ssword', 'John', 'Doe');
});

describe('Errors', () => {
  test('invalid user', () => {
    expect(
      reqDetailsUpdate(
        userToken.body.token + 432,
        'euierjnerinreijk',
        'euierjnerinreijk',
        'euierjnerinreijk'
      )
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
    expect(reqDetailsUpdate(userToken.body.token, 'jayden.jmith@unsw.edu.au', 'Jayden', 'Jmith')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test.each([
    { email: 'haydfchgcjmhv', nameFirst: 'Hayden', nameLast: 'Smith' },
    {
      email: 'hayden.smith@unsw.edu.au',
      nameFirst: 'Hayd!en',
      nameLast: 'Smith',
    },
    {
      email: 'hayden.smith@unsw.edu.au',
      nameFirst: 'Hayden',
      nameLast: 'Smi@th',
    },
    { email: 'hayden.smith@unsw.edu.au', nameFirst: 'H', nameLast: 'Smith' },
    {
      email: 'hayden.smith@unsw.edu.au',
      nameFirst: 'Hadvdfsdhbsdjkbsdvvjvnklnelksmkjvdnyden',
      nameLast: 'Smith',
    },
    { email: 'hayden.smith@unsw.edu.au', nameFirst: 'Hayden', nameLast: 'S' },
    {
      email: 'hayden.smith@unsw.edu.au',
      nameFirst: 'Hayden',
      nameLast: 'Smdbhxfgbnsffgffrtihfkjrenkjdsntsdklndsjlmdklgith',
    },
  ])('error cases', ({ email, nameFirst, nameLast }) => {
    expect(
      reqDetailsUpdate(userToken.body.token, email, nameFirst, nameLast)
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('email used by someone else', () => {
    reqAdminAuthRegister('emma.smith@unsw.edu.au', 'P4ssword', 'John', 'Doe');
    expect(
      reqDetailsUpdate(
        userToken.body.token,
        'emma.smith@unsw.edu.au',
        'Hayden',
        'Smith'
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('correct return type raw', () => {
    expect(
      reqDetailsUpdate(
        userToken.body.token,
        'jayden.jmith@unsw.edu.au',
        'Jayden',
        'Jmith'
      )
    ).toStrictEqual({
      body: {},
      statusCode: 200
    });
  });
});

test('correct return type use adminUserDetails', () => {
  reqDetailsUpdate(
    userToken.body.token,
    'jayden.jmith@unsw.edu.au',
    'Jayden',
    'Jmith'
  );
  expect(reqUserDetails(userToken.body.token)).toStrictEqual({
    body: {
      user: {
        userId: expect.any(Number),
        name: 'Jayden Jmith',
        email: 'jayden.jmith@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    },
    statusCode: 200
  });
});
