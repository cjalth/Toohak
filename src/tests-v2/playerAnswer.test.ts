import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqUpdateSession,
  reqPlayerJoin,
  reqPlayerAnswer,
  requestQuizInfo,
} from './testHelpers';

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let sessionId: { sessionId?: number; error?: string };
let playerId: { playerId?: number; error?: string };
let answersQ1;
let answerQ1Id1: number;
let answerQ1Id2: number;
let answerQ1Id3: number;
let answersQ2;
let answerQ2Id1: number;
let answerQ2Id2: number;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
  reqQuizCreateQuestion(userId.token, { question: 'question 1', duration: 1, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: true }, { answer: 'answer 3', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
  reqQuizCreateQuestion(userId.token, { question: 'question 2', duration: 1, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);

  answersQ1 = requestQuizInfo(userId.token, quizId.quizId).body.questions[0].answers;
  answerQ1Id1 = answersQ1[0].answerId;
  answerQ1Id2 = answersQ1[1].answerId;
  answerQ1Id3 = answersQ1[2].answerId;

  answersQ2 = requestQuizInfo(userId.token, quizId.quizId).body.questions[1].answers;
  answerQ2Id1 = answersQ2[0].answerId;
  answerQ2Id2 = answersQ2[1].answerId;

  sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
  playerId = reqPlayerJoin(sessionId.sessionId, 'John Doe').body;

  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
});

describe('unsuccessful tests', () => {
  test('player id does not exist', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId.playerId + 1, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('invalid question position', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId.playerId, 10)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('quiz not in question open state', () => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'END');
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('session not up to question', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId.playerId, 2)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('invalid answer id', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id2 + 50], playerId.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('duplicate answer ids', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id1], playerId.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('no answer ids provided', () => {
    expect(reqPlayerAnswer([], playerId.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});

describe('successful tests', () => {
  test('correct answers q1', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId.playerId, 1)).toStrictEqual({
      body: {},
      statusCode: 200,
    });
  });

  test('incorrect answers q1', () => {
    expect(reqPlayerAnswer([answerQ1Id1, answerQ1Id3], playerId.playerId, 1)).toStrictEqual({
      body: {},
      statusCode: 200,
    });
  });

  test('correct answers q2', () => {
    const slync = require('slync');
    const questionDuration = 1;
    slync(questionDuration * 1000);
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    expect(reqPlayerAnswer([answerQ2Id1], playerId.playerId, 2)).toStrictEqual({
      body: {},
      statusCode: 200,
    });
  });

  test('incorrect answers q2', () => {
    const slync = require('slync');
    const questionDuration = 1;
    slync(questionDuration * 1000);
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    expect(reqPlayerAnswer([answerQ2Id2], playerId.playerId, 2)).toStrictEqual({
      body: {},
      statusCode: 200,
    });
  });
});
