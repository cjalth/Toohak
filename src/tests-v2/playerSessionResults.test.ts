import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuizInfo,
  reqStartSession,
  reqUpdateSession,
  reqPlayerJoin,
  reqPlayerSessionResults,
  reqPlayerAnswer,
} from './testHelpers';
import slync from 'slync';

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };

let questionId1: { questionId?: number; error?: string };
let answersQ1: { answerId: number, answer: string, colour: string, correct: boolean}[];
let answerQ1Id1: number;
let answerQ1Id2: number;
let answerQ1Id3: number;

let questionId2: { questionId?: number; error?: string };
let answersQ2: { answerId: number, answer: string, colour: string, correct: boolean}[];
let answerQ2Id1: number;
let answerQ2Id2: number;

let sessionId: { sessionId?: number; error?: string };
let playerId1: { playerId?: number; error?: string };
let playerId2: { playerId?: number; error?: string };
let playerId3: { playerId?: number; error?: string };

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;

  questionId1 = reqQuizCreateQuestion(userId.token, { question: 'question 1', duration: 2, points: 10, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: true }, { answer: 'answer 3', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId).body;
  answersQ1 = requestQuizInfo(userId.token, quizId.quizId).body.questions[0].answers;
  answerQ1Id1 = answersQ1[0].answerId;
  answerQ1Id2 = answersQ1[1].answerId;
  answerQ1Id3 = answersQ1[2].answerId;

  questionId2 = reqQuizCreateQuestion(userId.token, { question: 'question 2', duration: 2, points: 10, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId).body;
  answersQ2 = requestQuizInfo(userId.token, quizId.quizId).body.questions[1].answers;
  answerQ2Id1 = answersQ2[0].answerId;
  answerQ2Id2 = answersQ2[1].answerId;

  sessionId = reqStartSession(userId.token, 3, quizId.quizId).body;
  playerId1 = reqPlayerJoin(sessionId.sessionId, 'John Doe').body;
  playerId2 = reqPlayerJoin(sessionId.sessionId, 'Jane Doe').body;
  playerId3 = reqPlayerJoin(sessionId.sessionId, 'Hayden Smith').body;

  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
  slync(500);
  reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId1.playerId, 1);
  slync(500);
  reqPlayerAnswer([answerQ1Id2, answerQ1Id3], playerId2.playerId, 1);
  slync(500);
  reqPlayerAnswer([answerQ1Id1, answerQ1Id2], playerId3.playerId, 1);
  slync(500);

  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'SKIP_COUNTDOWN');
  slync(500);
  reqPlayerAnswer([answerQ2Id1], playerId1.playerId, 2);
  slync(500);
  reqPlayerAnswer([answerQ2Id2], playerId2.playerId, 2);
  slync(500);
  reqPlayerAnswer([answerQ2Id1], playerId3.playerId, 2);
  slync(500);
  reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
});

describe('successful tests', () => {
  test('gets final results', () => {
    expect(reqPlayerSessionResults(playerId1.playerId)).toStrictEqual({
      body: {
        usersRankedByScore: [
          {
            name: 'John Doe',
            score: 20
          },
          {
            name: 'Hayden Smith',
            score: 10
          },
          {
            name: 'Jane Doe',
            score: 0
          }
        ],
        questionResults: [
          {
            questionId: questionId1.questionId,
            playersCorrectList: [
              'John Doe', 'Hayden Smith'
            ],
            averageAnswerTime: 1,
            percentCorrect: 67
          },
          {
            questionId: questionId2.questionId,
            playersCorrectList: [
              'John Doe', 'Hayden Smith'
            ],
            averageAnswerTime: 1,
            percentCorrect: 67
          },
        ]
      },
      statusCode: 200,
    });
  });
});

describe('unsuccessful tests', () => {
  test('invalid playerId', () => {
    expect(reqPlayerSessionResults(playerId3.playerId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('session not in FINAL_RESULTS state', () => {
    reqUpdateSession(userId.token, quizId.quizId, sessionId.sessionId, 'END');
    expect(reqPlayerSessionResults(playerId1.playerId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
