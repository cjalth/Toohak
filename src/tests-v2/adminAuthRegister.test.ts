import {
  reqAdminAuthRegister,
  reqClear,
} from './testHelpers';

const SUCCESS = { token: expect.any(String) };
const ERROR = { error: expect.any(String) };
beforeEach(() => {
  reqClear();
});

describe('Successfully Registered User', () => {
  test('Correct status code and return value', () => {
    expect(
      reqAdminAuthRegister(
        'mike.wazowski@unsw.edu.au',
        'Password1',
        'Mike',
        'Wazowski'
      )
    ).toStrictEqual({
      body: SUCCESS,
      statusCode: 200,
    });
  });
});

describe('Error Case with failed return value', () => {
  test.each([
    {
      email: 'username@!nval!d',
      password: 'Password1',
      nameFirst: 'Mike',
      nameLast: 'Wazowski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'Password1',
      nameFirst: 'Mike$$',
      nameLast: 'Wazowski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'Password1',
      nameFirst: 'Mike',
      nameLast: 'Wazow$k!',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'Password1',
      nameFirst: 'MikeyWikeyNikeyPikeySikey',
      nameLast: 'Wazowski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'Password1',
      nameFirst: 'M',
      nameLast: 'Wazowski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'Password1',
      nameFirst: 'Mike',
      nameLast: 'Wazowskibroskitoskiloskimoski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'Password1',
      nameFirst: 'Mike',
      nameLast: 'W',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'lol2',
      nameFirst: 'Mike',
      nameLast: 'Wazowski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: 'passwordiscool',
      nameFirst: 'Mike',
      nameLast: 'Wazowski',
    },
    {
      email: 'mike.wazowski@unsw.edu.au',
      password: '1203423413',
      nameFirst: 'Mike',
      nameLast: 'Wazowski',
    },
  ])(
    'Error with email="$email", password="$password", nameFirst="$nameFirst", nameLast="$nameLast"',
    ({ email, password, nameFirst, nameLast }) => {
      expect(
        reqAdminAuthRegister(email, password, nameFirst, nameLast)
      ).toStrictEqual({
        body: ERROR,
        statusCode: 400,
      });
    }
  );

  test('Email is used by another user', () => {
    expect(
      reqAdminAuthRegister(
        'hayden.smith@unsw.edu.au',
        'Abcdef123',
        'Hayden',
        'Smith'
      )
    ).toStrictEqual({
      body: SUCCESS,
      statusCode: 200,
    });

    expect(
      reqAdminAuthRegister(
        'hayden.smith@unsw.edu.au',
        'Password1',
        'Mike',
        'Wazowski'
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
