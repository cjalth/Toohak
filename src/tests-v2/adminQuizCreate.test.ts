import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId:{ token?: string; error?: string };
beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
});

describe('Successful tests (POST /v1/admin/quiz)', () => {
  test.each([
    { name: 'quiz', description: 'quizzical quiz' },
    { name: 'hey', description: '' },
    { name: 'hello world', description: 'aksfdaskdfnaksdfks' },
  ])('Successful quiz creation', ({ name, description }) => {
    expect(reqQuizCreate(userId.token, name, description)).toStrictEqual({
      body: { quizId: expect.any(Number) },
      statusCode: 200
    });
  });
});

describe('Unsuccessful tests (POST /v1/admin/quiz)', () => {
  test('Invalid token', () => {
    expect(reqQuizCreate(userId.token + 1, 'quiz', '')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userId.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizCreate(userId.token, 'quiz', '')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test.each([
    { name: '...' },
    { name: 'hi' },
    { name: 'hi this is a really long quiz name' },
    { name: 'dupe quiz' },
  ])('Invalid name', ({ name }) => {
    reqQuizCreate(userId.token, 'dupe quiz', '');
    expect(reqQuizCreate(userId.token, name, '')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('Invalid description', () => {
    const description = 'a';
    expect(reqQuizCreate(userId.token, 'quiz', description.repeat(120))).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
