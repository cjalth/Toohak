import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizRemove,
  reqQuizRestore,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userToken1: { token?: string; error?: string };
let userToken2: { token?: string; error?: string };

let quizId1: { quizId?: number; error?: string };
let quizId2: { quizId?: number; error?: string };
beforeEach(() => {
  reqClear();
  userToken1 = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;

  userToken2 = reqAdminAuthRegister('hellrld@gmail.com', 'P4ssword', 'John', 'Doe').body;

  quizId1 = reqQuizCreate(userToken1.token, 'quiz1', 'jkdsvrs').body;

  quizId2 = reqQuizCreate(userToken2.token, 'quiz2', 'jkdsvrs').body;
});

describe('Successful tests', () => {
  test('Successful quiz restoration', () => {
    reqQuizRemove(userToken1.token, quizId1.quizId);
    expect(reqQuizRestore(userToken1.token, quizId1.quizId)).toStrictEqual({
      body: {},
      statusCode: 200
    });
  });
});

describe('Unsuccessful tests', () => {
  test('Invalid token', () => {
    reqQuizRemove(userToken1.token, quizId1.quizId);

    expect(reqQuizRestore(userToken1.token + userToken2.token, quizId1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    reqQuizRemove(userToken1.token, quizId1.quizId);
    expect(reqAdminAuthLogout(userToken1.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizRestore(userToken1.token, quizId1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Invalid quizId', () => {
    reqQuizRemove(userToken1.token, quizId1.quizId);
    expect(reqQuizRestore(userToken1.token, quizId1.quizId + quizId2.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('QuizId doesnt belong to user', () => {
    reqQuizRemove(userToken2.token, quizId2.quizId);

    expect(reqQuizRestore(userToken1.token, quizId2.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('Quiz not in trash', () => {
    expect(reqQuizRestore(userToken1.token, quizId1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('Quiz name in use by a different quiz', () => {
    reqQuizRemove(userToken1.token, quizId1.quizId);
    reqQuizCreate(userToken2.token, 'quiz1', 'dvhbjkvs');

    expect(reqQuizRestore(userToken1.token, quizId1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
