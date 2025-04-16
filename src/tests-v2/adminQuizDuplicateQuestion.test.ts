import { adminAuthRegister } from '../auth';
import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqQuizDuplicateQuestion,
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

  questionId = reqQuizCreateQuestion(userId.token, {
    question: 'question',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'answer 1', correct: true },
      { answer: 'answer 2', correct: false },
    ],
    thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
  }, quizId.quizId).body;
});

describe('Successful tests (POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate)', () => {
  test('Successful question duplication return', () => {
    expect(reqQuizDuplicateQuestion(userId.token, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: { newQuestionId: expect.any(Number) },
      statusCode: 200
    });
  });

  test('Successful question duplication details update', () => {
    const output = reqQuizDuplicateQuestion(userId.token, quizId.quizId, questionId.questionId);
    const timeLastEdited = Math.floor(Date.now() / 1000);
    const newQuestionId = output.body;

    const quizInfo = requestQuizInfo(userId.token, quizId.quizId).body;

    expect(quizInfo).toStrictEqual({
      quizId: quizId.quizId,
      name: 'quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 2,
      questions: [
        {
          questionId: questionId.questionId,
          question: 'question',
          duration: 10,
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
            },
          ]
        },
        {
          questionId: newQuestionId.newQuestionId,
          question: 'question',
          duration: 10,
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
            },
          ]
        },
      ],
      duration: 20,
      thumbnailUrl: ''
    });
    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });
});

describe('Unsuccessful tests (POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate)', () => {
  test('Invalid token', () => {
    expect(reqQuizDuplicateQuestion(userId.token + 1, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Not owner of the quiz', () => {
    const userId2 = adminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe');

    expect(reqQuizDuplicateQuestion(userId2.token, quizId.quizId, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('Invalid quizId', () => {
    expect(reqQuizDuplicateQuestion(userId.token, quizId.quizId + 1, questionId.questionId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('Invalid questionId', () => {
    expect(reqQuizDuplicateQuestion(userId.token, quizId.quizId, questionId.questionId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
