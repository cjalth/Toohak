import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqQuizRemove,
  reqQuizRemoveQuestion,
  reqStartSession,
  reqUpdateSession
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let questionId: {questionId?: number; error?: string };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
  questionId = reqQuizCreateQuestion(userId.token, { question: 'question', duration: 10, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId).body;
});

describe('successful tests', () => {
  test('successful new session', () => {
    expect(reqStartSession(userId.token, 5, quizId.quizId)).toStrictEqual({
      body: { sessionId: expect.any(Number) },
      statusCode: 200
    });
  });
});

describe('unsuccessful tests', () => {
  test('invalid token', () => {
    expect(reqStartSession(userId.token + 1, 5, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('logged out user', () => {
    reqAdminAuthLogout(userId.token);
    expect(reqStartSession(userId.token, 5, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('invalid quizId', () => {
    expect(reqStartSession(userId.token, 5, quizId.quizId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('quiz does not belong to user', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;
    expect(reqStartSession(userId2.token, 5, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test.each([
    { autoStartNum: 51 },
    { autoStartNum: -1 },
  ])('invalid autoStartNum', ({ autoStartNum }) => {
    expect(reqStartSession(userId.token, autoStartNum, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('too many active quizzes', () => {
    const sessionId2 = reqStartSession(userId.token, 5, quizId.quizId).body;
    reqUpdateSession(userId.token, quizId.quizId, sessionId2.sessionId, 'END');
    for (let i = 0; i < 10; i++) {
      reqStartSession(userId.token, 5, quizId.quizId);
    }
    const sessionId3 = reqStartSession(userId.token, 5, quizId.quizId).body;
    reqUpdateSession(userId.token, quizId.quizId, sessionId3.sessionId, 'END');
    expect(reqStartSession(userId.token, 5, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('no questions in quiz', () => {
    reqQuizRemoveQuestion(userId.token, quizId.quizId, questionId.questionId);
    expect(reqStartSession(userId.token, 5, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('quiz in trash', () => {
    reqQuizRemove(userId.token, quizId.quizId);
    expect(reqStartSession(userId.token, 5, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
