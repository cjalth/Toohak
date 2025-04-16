import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqUpdateSession,
  reqPlayerJoin,
} from './testHelpers';

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let sessionId: { sessionId?: number; error?: string };
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
});

describe('successful tests', () => {
  beforeEach(() => {
    userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
    quizId = reqQuizCreate(userId.token, 'quiz', '').body;
    reqQuizCreateQuestion(userId.token, { question: 'question', duration: 10, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
    sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
  });
  test('successfully joined session', () => {
    expect(reqPlayerJoin(sessionId.sessionId, 'hello')).toStrictEqual({
      body: { playerId: expect.any(Number) },
      statusCode: 200
    });
  });
  test('successfully joined session with empty name', () => {
    expect(reqPlayerJoin(sessionId.sessionId, '')).toStrictEqual({
      body: { playerId: expect.any(Number) },
      statusCode: 200
    });
  });
});

describe('unsuccessful tests', () => {
  beforeEach(() => {
    userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
    quizId = reqQuizCreate(userId.token, 'quiz', '').body;
    reqQuizCreateQuestion(userId.token, { question: 'question', duration: 10, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
    sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
  });
  test('invalid sessionId', () => {
    expect(reqPlayerJoin(sessionId.sessionId + 1, 'hello')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
  test('session isn\'t in LOBBY state, test 1', () => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'END');
    expect(reqPlayerJoin(sessionId.sessionId, 'hello')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
  test('session isn\'t in LOBBY state, test 2', () => {
    reqPlayerJoin(sessionId.sessionId, '');
    reqPlayerJoin(sessionId.sessionId, '');
    reqPlayerJoin(sessionId.sessionId, '');
    reqPlayerJoin(sessionId.sessionId, '');
    reqPlayerJoin(sessionId.sessionId, '');
    expect(reqPlayerJoin(sessionId.sessionId, 'hello')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
  test('player\'s name is not unique', () => {
    reqPlayerJoin(sessionId.sessionId, 'hi');
    expect(reqPlayerJoin(sessionId.sessionId, 'hi')).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
