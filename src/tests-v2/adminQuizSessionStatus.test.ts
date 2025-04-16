import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqPlayerJoin,
  reqQuizSessionStatus,
  requestQuizInfo,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let questionId1: { questionId?: number; error?: string };
let questionId2: { questionId?: number; error?: string };
let sessionId: { sessionId?: number; error?: string };
let timeCreated: number;
let timeLastEdited: number;

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'quiz', 'description').body;
  timeCreated = Math.floor(Date.now() / 1000);
  questionId1 = reqQuizCreateQuestion(userId.token, { question: 'question 1', duration: 2, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId).body;
  questionId2 = reqQuizCreateQuestion(userId.token, { question: 'question 2', duration: 2, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' }, quizId.quizId).body;
  timeLastEdited = Math.floor(Date.now() / 1000);
  sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
  reqPlayerJoin(sessionId.sessionId, 'Jane');
  reqPlayerJoin(sessionId.sessionId, 'Bob');
});

describe('successful tests', () => {
  test('Printed correct information', () => {
    expect(reqQuizSessionStatus(userId.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: {
        state: 'LOBBY',
        atQuestion: questionId1.questionId,
        players: [
          'Jane',
          'Bob'
        ],
        metadata: {
          quizId: quizId.quizId,
          name: 'quiz',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: 2,
          questions: [
            {
              questionId: questionId1.questionId,
              question: 'question 1',
              duration: 2,
              thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: questionId2.questionId,
              question: 'question 2',
              duration: 2,
              thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 4,
          thumbnailUrl: ''
        }
      },
      statusCode: 200
    });

    const { body } = requestQuizInfo(userId.token, quizId.quizId);

    expect(body.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(body.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(body.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(body.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });
});

describe('unsuccessful tests', () => {
  test('Invalid Token', () => {
    expect(reqQuizSessionStatus(userId.token + 1, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Empty Token', () => {
    expect(reqQuizSessionStatus(undefined, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userId.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizSessionStatus(userId.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Invalid QuizId', () => {
    expect(reqQuizSessionStatus(userId.token, quizId.quizId + 1, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('User has no quiz with QuizId', () => {
    const user2 = reqAdminAuthRegister('HD.Please@gmail.com', 'P4sswords1', 'HD', 'Please').body;
    expect(reqQuizSessionStatus(user2.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('User has no quiz with SessionId', () => {
    expect(reqQuizSessionStatus(userId.token, quizId.quizId, sessionId.sessionId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
