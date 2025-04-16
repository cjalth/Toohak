import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizRemove,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;

  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
});

describe('Successful tests (DELETE /v1/admin/quiz/{quizid})', () => {
  test('Successful quiz deletion', () => {
    expect(reqQuizRemove(userId.token, quizId.quizId)).toStrictEqual({
      body: {},
      statusCode: 200
    });
  });
});

describe('Unsuccessful tests (DELETE /v1/admin/quiz/{quizid})', () => {
  let userId2: { token?: string; error?: string };
  let quizId2: { quizId?: number; error?: string };

  beforeEach(() => {
    userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;

    quizId2 = reqQuizCreate(userId2.token, 'quiz', '').body;
  });

  test('Invalid token', () => {
    expect(reqQuizRemove(userId.token + userId2.token, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userId.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizRemove(userId.token, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Invalid quizId', () => {
    expect(reqQuizRemove(userId.token, quizId.quizId + quizId2.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('QuizId doesnt belong to user', () => {
    expect(reqQuizRemove(userId.token, quizId2.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
    expect(reqQuizRemove(userId2.token, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });
});
