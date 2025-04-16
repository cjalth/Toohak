import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuizInfo,
  reqStartSession,
  reqUpdateSession,
  reqPlayerJoin,
  reqPlayerAnswer,
  reqQuizSessionResultsCSV,
  reqAdminAuthLogout,
  csvReturn,
} from './testHelpers';
import slync from 'slync';

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };

let answersQ1: { answerId: number, answer: string, colour: string, correct: boolean}[];
let answerQ1Id1: number;
let answerQ1Id2: number;
let answerQ1Id3: number;

let answersQ2: { answerId: number, answer: string, colour: string, correct: boolean}[];
let answerQ2Id1: number;
let answerQ2Id2: number;

let sessionId: { sessionId?: number; error?: string };
let playerId1: { playerId?: number; error?: string };
let playerId2: { playerId?: number; error?: string };
let playerId3: { playerId?: number; error?: string };
let playerId4: { playerId?: number; error?: string };

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;

  reqQuizCreateQuestion(userId.token, { question: 'question 1', duration: 2, points: 10, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: true }, { answer: 'answer 3', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
  answersQ1 = requestQuizInfo(userId.token, quizId.quizId).body.questions[0].answers;
  answerQ1Id1 = answersQ1[0].answerId;
  answerQ1Id2 = answersQ1[1].answerId;
  answerQ1Id3 = answersQ1[2].answerId;

  reqQuizCreateQuestion(userId.token, { question: 'question 2', duration: 2, points: 10, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
  answersQ2 = requestQuizInfo(userId.token, quizId.quizId).body.questions[1].answers;
  answerQ2Id1 = answersQ2[0].answerId;
  answerQ2Id2 = answersQ2[1].answerId;

  sessionId = reqStartSession(userId.token, 4, quizId.quizId).body;
  playerId1 = reqPlayerJoin(sessionId.sessionId, 'John Doe').body;
  playerId2 = reqPlayerJoin(sessionId.sessionId, 'Jane Doe').body;
  playerId3 = reqPlayerJoin(sessionId.sessionId, 'Hayden Smith').body;
  playerId4 = reqPlayerJoin(sessionId.sessionId, 'Sandeep Das').body;

  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
  slync(500);
  reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId1.playerId, 1);
  slync(500);
  reqPlayerAnswer([answerQ1Id2, answerQ1Id3], playerId2.playerId, 1);
  slync(500);
  reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId3.playerId, 1);
  reqPlayerAnswer([answerQ1Id2, answerQ1Id3], playerId4.playerId, 1);
  slync(500);

  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
  slync(500);
  reqPlayerAnswer([answerQ2Id1], playerId1.playerId, 2);
  slync(500);
  reqPlayerAnswer([answerQ2Id2], playerId2.playerId, 2);
  slync(500);
  reqPlayerAnswer([answerQ2Id1], playerId3.playerId, 2);
  reqPlayerAnswer([answerQ2Id2], playerId4.playerId, 2);
  slync(500);
  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
});

describe('successful tests', () => {
  test('csv generated', () => {
    expect(reqQuizSessionResultsCSV(userId.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: { url: expect.any(String) },
      statusCode: 200
    });
  });

  test('url returned', () => {
    reqQuizSessionResultsCSV(userId.token, quizId.quizId, sessionId.sessionId);
    expect(csvReturn(sessionId.sessionId)).toStrictEqual({
      statusCode: 200
    });
  });
});

describe('unsuccessful tests', () => {
  test('invalid token', () => {
    expect(reqQuizSessionResultsCSV(userId.token + 1, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('logged out user', () => {
    reqAdminAuthLogout(userId.token);
    expect(reqQuizSessionResultsCSV(userId.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('not owner of quiz', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;
    expect(reqQuizSessionResultsCSV(userId2.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('invalid quizId', () => {
    expect(reqQuizSessionResultsCSV(userId.token, quizId.quizId + 1, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('invalid sessionId', () => {
    expect(reqQuizSessionResultsCSV(userId.token, quizId.quizId, sessionId.sessionId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('invalid session state', () => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'END');
    expect(reqQuizSessionResultsCSV(userId.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
