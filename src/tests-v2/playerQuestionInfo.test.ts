import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuestionInfo,
  reqStartSession,
  reqUpdateSession,
  reqPlayerJoin
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let user: { token: string };
let quiz1: { quizId: number };
let question1: { questionId: number };
let question2: { questionId: number };
let sessionId: { sessionId?: number; error?: string };
let player: { playerId?: number; error?: string };

beforeEach(() => {
  reqClear();
  user = reqAdminAuthRegister(
    'helloworld@gmail.com',
    'P4sswords',
    'Hello',
    'World'
  ).body;

  quiz1 = reqQuizCreate(
    user.token,
    'My Quiz',
    'This is my Quiz'
  ).body;

  question1 = reqQuizCreateQuestion(
    user.token,
    {
      question: 'Question 1',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'correct answer', correct: true },
        { answer: 'wrong answer', correct: false }
      ],
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
    },
    quiz1.quizId
  ).body;

  question2 = reqQuizCreateQuestion(
    user.token,
    {
      question: 'Question 2',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'correct answer', correct: true },
        { answer: 'wrong answer', correct: false }
      ],
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
    },
    quiz1.quizId
  ).body;

  sessionId = reqStartSession(user.token, 5, quiz1.quizId).body;
  player = reqPlayerJoin(sessionId.sessionId, 'player').body;
});

describe('Errors', () => {
  test('player id does not exist', () => {
    expect(requestQuestionInfo(player.playerId + 1, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('invalid question positon', () => {
    expect(requestQuestionInfo(player.playerId, -1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session not on this question', () => {
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    expect(requestQuestionInfo(player.playerId, 2)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session is in lobby', () => {
    expect(requestQuestionInfo(player.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session is in question countdown', () => {
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    expect(requestQuestionInfo(player.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session is in end state ', () => {
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'END');
    expect(requestQuestionInfo(player.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});

describe('Successes', () => {
  test('first question', () => {
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionInfo(player.playerId, 1)).toStrictEqual({
      body: {
        questionId: question1.questionId,
        question: 'Question 1',
        duration: 2,
        thumbnailUrl: expect.any(String),
        points: 10,
        answers: [
          {
            answerId: expect.any(Number),
            answer: expect.any(String),
            colour: expect.any(String)
          }
        ]
      },
      statusCode: 200
    });
  });

  test('second question', () => {
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionInfo(player.playerId, 2)).toStrictEqual({
      body: {
        questionId: question2.questionId,
        question: 'Question 2',
        duration: 2,
        thumbnailUrl: expect.any(String),
        points: 10,
        answers: [
          {
            answerId: expect.any(Number),
            answer: expect.any(String),
            colour: expect.any(String)
          }
        ]
      },
      statusCode: 200
    });
  });
});
