import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuizInfo,
  requestQuestionResults,
  reqStartSession,
  reqUpdateSession,
  reqPlayerJoin,
  reqPlayerAnswer
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let user1: { token: string };
let quiz1: { quizId: number };
let question1: { questionId: number };
let question2: { questionId: number };
let sessionId: { sessionId?: number; error?: string };
let player1: { playerId?: number; error?: string };
let player2: { playerId?: number; error?: string };
let answersQ1;
let q1Correct: number;
let q1Incorrect: number;
let answersQ2;
let q2Incorrect: number;

beforeEach(() => {
  reqClear();
  user1 = reqAdminAuthRegister(
    'helloworld@gmail.com',
    'P4sswords',
    'Hello',
    'World'
  ).body;

  quiz1 = reqQuizCreate(
    user1.token,
    'My Quiz',
    'This is my Quiz'
  ).body;

  question1 = reqQuizCreateQuestion(
    user1.token,
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
    user1.token,
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

  answersQ1 = requestQuizInfo(user1.token, quiz1.quizId).body.questions[0].answers;
  q1Correct = answersQ1[0].answerId;
  q1Incorrect = answersQ1[1].answerId;

  answersQ2 = requestQuizInfo(user1.token, quiz1.quizId).body.questions[1].answers;
  q2Incorrect = answersQ2[1].answerId;

  sessionId = reqStartSession(user1.token, 5, quiz1.quizId).body;
  player1 = reqPlayerJoin(sessionId.sessionId, 'player1').body;
  player2 = reqPlayerJoin(sessionId.sessionId, 'player2').body;
});

describe('Errors', () => {
  test('player id does not exist', () => {
    expect(requestQuestionResults(player1.playerId + player2.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('invalid question positon', () => {
    expect(requestQuestionResults(player1.playerId, -1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session not on this question', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionResults(player1.playerId, 2)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session is not in answer show state', () => {
    expect(requestQuestionResults(player1.playerId, 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});

describe('Successes', () => {
  test('q1, one correct one incorrect', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    //  player 1 correct player 2 incorrect
    reqPlayerAnswer([q1Correct], player1.playerId, 1);
    reqPlayerAnswer([q1Incorrect], player2.playerId, 1);
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionResults(player1.playerId, 1)).toStrictEqual({
      body: {
        questionId: question1.questionId,
        playersCorrectList: [
          'player1'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 50
      },
      statusCode: 200
    });
  });

  test('q1 both correct', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    //  player 1 correct player 2 correct
    reqPlayerAnswer([q1Correct], player1.playerId, 1);
    reqPlayerAnswer([q1Correct], player2.playerId, 1);
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionResults(player1.playerId, 1)).toStrictEqual({
      body: {
        questionId: question1.questionId,
        playersCorrectList: [
          'player1', 'player2'
        ],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 100
      },
      statusCode: 200
    });
  });

  test('q2, both incorrect', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    //  player 1 incorrect player 2 incorrect
    reqPlayerAnswer([q2Incorrect], player1.playerId, 2);
    reqPlayerAnswer([q2Incorrect], player2.playerId, 2);
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionResults(player1.playerId, 2)).toStrictEqual({
      body: {
        questionId: question2.questionId,
        playersCorrectList: [],
        averageAnswerTime: expect.any(Number),
        percentCorrect: 0
      },
      statusCode: 200
    });
  });
});
