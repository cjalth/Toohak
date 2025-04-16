import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizRemove,
  reqQuizTrash,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userToken: { token?: string; error?: string };
let quiz1: { quizId?: number; error?: string };
let quiz2: { quizId?: number; error?: string };
let quiz3: { quizId?: number; error?: string };
beforeEach(() => {
  reqClear();
  userToken = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;

  quiz1 = reqQuizCreate(userToken.token, 'Quiz Name 1', 'A description of my quiz 1').body;
  quiz2 = reqQuizCreate(userToken.token, 'Quiz Name 2', 'A description of my quiz 2').body;
  quiz3 = reqQuizCreate(userToken.token, 'Quiz Name 3', 'A description of my quiz 3').body;
});

describe('Unsuccessful tests', () => {
  test('Invalid token', () => {
    expect(reqQuizTrash(userToken.token + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  }
  );

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userToken.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizTrash(userToken.token)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });
});

describe('Successful tests', () => {
  test('Nothing in trash', () => {
    expect(reqQuizTrash(userToken.token)).toStrictEqual({
      body: { quizzes: [] },
      statusCode: 200
    });
  });

  test('1 quiz (in trash)', () => {
    reqQuizRemove(userToken.token, quiz1.quizId);

    expect(reqQuizTrash(userToken.token)).toStrictEqual({
      body: {
        quizzes: [
          {
            quizId: expect.any(Number),
            name: 'Quiz Name 1'
          }
        ]
      },
      statusCode: 200
    });
  });

  test('multiple quizzes', () => {
    reqQuizRemove(userToken.token, quiz1.quizId);
    reqQuizRemove(userToken.token, quiz2.quizId);
    reqQuizRemove(userToken.token, quiz3.quizId);

    expect(reqQuizTrash(userToken.token)).toStrictEqual({
      body: {
        quizzes: [
          {
            quizId: expect.any(Number),
            name: 'Quiz Name 1'
          },
          {
            quizId: expect.any(Number),
            name: 'Quiz Name 2'
          },
          {
            quizId: expect.any(Number),
            name: 'Quiz Name 3'
          }
        ]
      },
      statusCode: 200
    });
  });
});
