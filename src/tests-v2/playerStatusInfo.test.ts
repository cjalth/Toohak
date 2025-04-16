import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqPlayerJoin,
  reqPlayerStatusInfo,
} from './testHelpers';

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let sessionId: { sessionId?: number; error?: string };
let playerId: { playerId?: number; error?: string };

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
  reqQuizCreateQuestion(userId.token, { question: 'question', duration: 10, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId);
  sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
  playerId = reqPlayerJoin(sessionId.sessionId, 'hello').body;
});

describe('successful tests', () => {
  test('Shows status of player', () => {
    expect(reqPlayerStatusInfo(playerId.playerId)).toStrictEqual({
      body: {
        state: 'LOBBY',
        numQuestions: 1,
        atQuestion: 0,
      },
      statusCode: 200,
    });
  });
  test('Shows status of player with multiple players', () => {
    reqPlayerJoin(sessionId.sessionId, 'omg124');
    reqPlayerJoin(sessionId.sessionId, 'Iwanttoquit');
    expect(reqPlayerStatusInfo(playerId.playerId)).toStrictEqual({
      body: {
        state: 'LOBBY',
        numQuestions: 1,
        atQuestion: 0,
      },
      statusCode: 200,
    });
  });
});

describe('unsuccessful tests', () => {
  test('invalid playerId', () => {
    expect(reqPlayerStatusInfo(playerId.playerId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
