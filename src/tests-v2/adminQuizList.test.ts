import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizList,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
});

describe('Successful tests (GET /v1/admin/quiz/list)', () => {
  test('Empty list', () => {
    expect(reqQuizList(userId.token)).toStrictEqual({
      body: { quizzes: [] },
      statusCode: 200
    });
  });

  test('1 course', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;

    const quizId1 = reqQuizCreate(userId.token, 'quiz', '').body;

    reqQuizCreate(userId2.token, 'quiz', '');

    expect(reqQuizList(userId.token)).toStrictEqual({
      body: { quizzes: [{ quizId: quizId1.quizId, name: 'quiz' }] },
      statusCode: 200
    });
  });

  test('multiple courses', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;

    const quizId1 = reqQuizCreate(userId.token, 'quiz', '').body;

    reqQuizCreate(userId2.token, 'quiz', '');

    const quizId2 = reqQuizCreate(userId.token, 'quiz2', '').body;

    const quizId3 = reqQuizCreate(userId.token, 'quiz3', '').body;

    expect(reqQuizList(userId.token)).toStrictEqual({
      body: {
        quizzes: [
          { quizId: quizId1.quizId, name: 'quiz' },
          { quizId: quizId2.quizId, name: 'quiz2' },
          { quizId: quizId3.quizId, name: 'quiz3' },
        ]
      },
      statusCode: 200
    });
  });
});

describe('Unsuccessful tests', () => {
  test('Invalid token', () => {
    expect(reqQuizList(userId.token + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userId.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizList(userId.token)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });
});
