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
  reqQuizSessionResults
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let user1: { token: string };
let user2: { token: string };
let quiz1: { quizId: number };
let question1: { questionId: number };
let question2: { questionId: number };
let question3: { questionId: number };
let sessionId: { sessionId?: number; error?: string };
let player1: { playerId?: number; error?: string };
let player2: { playerId?: number; error?: string };
let player3: { playerId?: number; error?: string };
let answersQ1;
let q1Correct: number;
let q1Incorrect: number;
let answersQ2;
let q2Correct: number;
let q2Incorrect: number;
let answersQ3;
let q3Correct: number;
let q3Incorrect: number;

beforeEach(() => {
  reqClear();
  user1 = reqAdminAuthRegister(
    'helloworld@gmail.com',
    'P4sswords',
    'Hello',
    'World'
  ).body;
  user2 = reqAdminAuthRegister(
    'helworld@gmail.com',
    'P4sswords',
    'Jhn',
    'De'
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

  question3 = reqQuizCreateQuestion(
    user1.token,
    {
      question: 'Question 3',
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
  q2Correct = answersQ2[0].answerId;
  q2Incorrect = answersQ2[1].answerId;

  answersQ3 = requestQuizInfo(user1.token, quiz1.quizId).body.questions[2].answers;
  q3Correct = answersQ3[0].answerId;
  q3Incorrect = answersQ3[1].answerId;

  sessionId = reqStartSession(user1.token, 5, quiz1.quizId).body;
  player1 = reqPlayerJoin(sessionId.sessionId, 'player1').body;
  player2 = reqPlayerJoin(sessionId.sessionId, 'player2').body;
  player3 = reqPlayerJoin(sessionId.sessionId, 'player3').body;
});

describe('Successes', () => {
  test('success', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    //  correct incorrect incorrect
    reqPlayerAnswer([q1Correct], player1.playerId, 1);
    reqPlayerAnswer([q1Incorrect], player2.playerId, 1);
    reqPlayerAnswer([q1Correct], player3.playerId, 1);
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    //  incorrect incorrect incorrect
    reqPlayerAnswer([q2Correct], player1.playerId, 2);
    reqPlayerAnswer([q2Incorrect], player2.playerId, 2);
    reqPlayerAnswer([q2Incorrect], player3.playerId, 2);
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    //  correct correct correct
    reqPlayerAnswer([q3Correct], player1.playerId, 3);
    reqPlayerAnswer([q3Incorrect], player2.playerId, 3);
    reqPlayerAnswer([q3Correct], player3.playerId, 3);
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    // p1: c c c p2: i i i p3: c i c
    // q1: c i c q2: c i i q3: c i c
    expect(reqQuizSessionResults(user1.token, quiz1.quizId, sessionId.sessionId)).toStrictEqual({
      body: {
        usersRankedByScore: [
          {
            name: 'player1',
            score: expect.any(Number)
          },
          {
            name: 'player3',
            score: expect.any(Number)
          },
          {
            name: 'player2',
            score: expect.any(Number)
          }
        ],
        questionResults: [
          {
            questionId: question1.questionId,
            playersCorrectList: [
              'player1', 'player3'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 67
          },
          {
            questionId: question2.questionId,
            playersCorrectList: [
              'player1'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 33
          },
          {
            questionId: question3.questionId,
            playersCorrectList: [
              'player1', 'player3'
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 67
          }
        ]
      },
      statusCode: 200
    });
  });
});

describe('Errors', () => {
  test('session is not in final results state', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    expect(reqQuizSessionResults(user1.token, quiz1.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('invalid session id', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(reqQuizSessionResults(user1.token, quiz1.quizId, sessionId.sessionId + 2)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('invalid token', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(reqQuizSessionResults(user1.token + 1, quiz1.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('user is not an owner of this quiz', () => {
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_ANSWER');
    reqUpdateSession(user1.token, quiz1.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(reqQuizSessionResults(user2.token, quiz1.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });
});
