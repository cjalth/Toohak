import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqQuizRemoveQuestion,
  requestQuizInfo,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let questionId: { questionId?: number; error?: string };
let timeCreated: number;
beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;

  timeCreated = Math.floor(Date.now() / 1000);
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;

  questionId = reqQuizCreateQuestion(
    userId.token,
    {
      question: 'question',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'answer 1', correct: true },
        { answer: 'answer 2', correct: false },
      ],
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
    },
    quizId.quizId).body;
});

describe('Successful tests (DELETE /v1/admin/quiz/{quizid}/question/{questionid})', () => {
  test('Successful question deletion return', () => {
    expect(reqQuizRemoveQuestion(userId.token, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: {},
      statusCode: 200
    });
  });

  test('Successful question deletion details update', () => {
    reqQuizRemoveQuestion(userId.token, quizId.quizId, questionId.questionId);
    const timeLastEdited = Math.floor(Date.now() / 1000);

    const quizInfo = requestQuizInfo(userId.token, quizId.quizId).body;

    expect(quizInfo).toStrictEqual({
      quizId: quizId.quizId,
      name: 'quiz',
      timeCreated: timeCreated,
      timeLastEdited: timeLastEdited,
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
      thumbnailUrl: ''
    });
  });
});

describe('Unsuccessful tests (DELETE /v1/admin/quiz/{quizid}/question/{questionid})', () => {
  test('Invalid token', () => {
    expect(reqQuizRemoveQuestion(userId.token + 1, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userId.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizRemoveQuestion(userId.token, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Not owner of the quiz', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;

    expect(reqQuizRemoveQuestion(userId2.token, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('Invalid quizId', () => {
    expect(reqQuizRemoveQuestion(userId.token, quizId.quizId + 1, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('Invalid questionId', () => {
    expect(reqQuizRemoveQuestion(userId.token, quizId.quizId, questionId.questionId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
