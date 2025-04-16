import slync from 'slync';
import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqUpdateSession,
} from './testHelpers';

const ERROR = { error: expect.any(String) };
const questionDuration = 0.5;

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let sessionId: { sessionId?: number; error?: string };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister(
    'helloworld@gmail.com',
    'P4ssword',
    'John',
    'Doe'
  ).body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
  reqQuizCreateQuestion(userId.token, { question: 'question 1', duration: 0.5, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
  reqQuizCreateQuestion(userId.token, { question: 'question 2', duration: 0.5, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
  sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
});

describe('successful tests', () => {
  test.each([{ action: 'NEXT_QUESTION' }, { action: 'END' }])(
    'successful action for LOBBY state',
    ({ action }) => {
      expect(
        reqUpdateSession(
          userId.token,
          quizId.quizId,
          sessionId.sessionId,
          action
        )
      ).toStrictEqual({
        body: {},
        statusCode: 200,
      });
      // GET STATE
    }
  );

  test.each([
    { action: 'SKIP_COUNTDOWN' },
    { action: 'END' },
  ])('successful action for QUESTION_COUNTDOWN state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    // GET STATE
  });

  test.each([
    { action: 'GO_TO_ANSWER' },
    { action: 'END' },
  ])('successful action for QUESTION_OPEN state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    // GET STATE
  });

  test.each([
    { action: 'NEXT_QUESTION' },
    { action: 'GO_TO_ANSWER' },
    { action: 'GO_TO_FINAL_RESULTS' },
    { action: 'END' },
  ])('successful action for QUESTION_CLOSE state', async ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    slync(questionDuration * 1000);
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    // GET STATE
  });

  test.each([
    { action: 'NEXT_QUESTION' },
    { action: 'GO_TO_FINAL_RESULTS' },
    { action: 'END' },
  ])('successful action for ANSWER_SHOW state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    // GET STATE
  });

  test.each([
    { action: 'END' },
  ])('successful action for FINAL_RESULTS state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    // GET STATE
  });
});

describe('unsuccessful tests', () => {
  test('invalid token', () => {
    expect(reqUpdateSession(userId.token + 1, quizId.quizId, sessionId.sessionId, 'END')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('logged out user', () => {
    reqAdminAuthLogout(userId.token);
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'END')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('invalid quizId', () => {
    expect(reqUpdateSession(userId.token, quizId.quizId + 1, sessionId.sessionId, 'END')).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('quiz does not belong to user', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;
    expect(reqUpdateSession(userId2.token, quizId.quizId + 1, sessionId.sessionId, 'END')).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('invalid sessionId', () => {
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId + 1, 'END')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('invalid action', () => {
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'BLAH')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'SKIP_COUNTDOWN' },
    { action: 'GO_TO_ANSWER' },
    { action: 'GO_TO_FINAL_RESULTS' },
  ])('invalid action for LOBBY state', ({ action }) => {
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'NEXT_QUESTION' },
    { action: 'GO_TO_ANSWER' },
    { action: 'GO_TO_FINAL_RESULTS' },
  ])('invalid action for QUESTION_COUNTDOWN state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'SKIP_COUNTDOWN' },
    { action: 'NEXT_QUESTION' },
    { action: 'GO_TO_FINAL_RESULTS' },
  ])('invalid action for QUESTION_OPEN state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'SKIP_COUNTDOWN' },
  ])('invalid action for QUESTION_CLOSE state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    slync(questionDuration * 1000);
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('at last question', () => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    slync(questionDuration * 1000);
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    slync(questionDuration * 1000);
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'SKIP_COUNTDOWN' },
    { action: 'GO_TO_ANSWER' },
  ])('invalid action for ANSWER_SHOW state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'SKIP_COUNTDOWN' },
    { action: 'NEXT_QUESTION' },
    { action: 'GO_TO_ANSWER' },
    { action: 'GO_TO_FINAL_RESULTS' },
  ])('invalid action for FINAL_RESULTS state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { action: 'SKIP_COUNTDOWN' },
    { action: 'NEXT_QUESTION' },
    { action: 'GO_TO_ANSWER' },
    { action: 'GO_TO_FINAL_RESULTS' },
    { action: 'END' },
  ])('invalid action for END state', ({ action }) => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'END');
    expect(reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, action)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
