import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuizInfo,
  requestQuizUpdateQuestion,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let user: { token: string };
let quiz1: { quizId: number };
let question1: { questionId: number };
let question2: { questionId: number };
let timeCreated: number;

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

  timeCreated = Math.floor(Date.now() / 1000);

  question1 = reqQuizCreateQuestion(
    user.token,
    {
      question: 'Question 1',
      duration: 10,
      points: 10,
      answers: [
        { answer: 'correct answer', correct: true },
        { answer: 'wrong answer', correct: false }
      ],
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
    }, quiz1.quizId).body;

  question2 = reqQuizCreateQuestion(
    user.token,
    {
      question: 'Question 2',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'correct answer', correct: true },
        { answer: 'wrong answer', correct: false }
      ],
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
    }, quiz1.quizId).body;
});

describe('adminQuizUpdateQuestion Successful Tests', () => {
  test('adminQuizUpdateQuestion Successful Test', () => {
    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 15,
        thumbnailUrl: '',
        numQuestions: 2,
        questions: [
          {
            questionId: question1.questionId,
            question: 'Question 1',
            duration: 10,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 10,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'correct answer',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'wrong answer',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: question2.questionId,
            question: 'Question 2',
            duration: 5,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'correct answer',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'wrong answer',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
        ]
      },
      statusCode: 200,
    });

    requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ],
      },
      quiz1.quizId,
      question1.questionId
    );

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 11,
        thumbnailUrl: '',
        numQuestions: 2,
        questions: [
          {
            questionId: question1.questionId,
            question: 'First Question',
            duration: 6,
            thumbnailUrl: 'http://www.examplepicture.com.png',
            points: 3,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'First answer',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Second answer',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
          {
            questionId: question2.questionId,
            question: 'Question 2',
            duration: 5,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'correct answer',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'wrong answer',
                colour: expect.any(String),
                correct: false
              }
            ]
          },
        ]
      },
      statusCode: 200,
    });
    const quizInfo = requestQuizInfo(user.token, quiz1.quizId).body;

    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });
});

describe('adminQuizTransfer Failing Tests', () => {
  test('Invalid Token', () => {
    expect(requestQuizUpdateQuestion(
      user.token + 1,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(user.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Empty Token', () => {
    expect(requestQuizUpdateQuestion(
      undefined,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Invalid QuizId', () => {
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId + 1,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('User has no quiz with QuizId', () => {
    const user2 = reqAdminAuthRegister('HD.Please@gmail.com', 'P4sswords12', 'HD', 'Please').body;
    expect(requestQuizUpdateQuestion(
      user2.token,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('No Question with given QuestionId in Quiz', () => {
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: 6,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId + question2.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  const string = 'L';
  test.each([
    { question: 'no' },
    { question: string.repeat(60) },
  ])('Invalid question', ({ question }) => {
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: question,
        duration: 10,
        points: 5,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { duration: -1 },
    { duration: 999999 },
  ])('Invalid Duration Length', ({ duration }) => {
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: duration,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { points: -1 },
    { points: 99 },
  ])('Invalid Points Amount', ({ points }) => {
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: 20,
        points: points,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: [
          { answer: 'First answer', correct: true },
          { answer: 'Second answer', correct: false }
        ]
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    {
      answers: [
        { answer: 'answer', correct: true },
        { answer: '', correct: false }
      ]
    },
    {
      answers: [
        { answer: 'answer', correct: true },
        { answer: 'This is longer than 30 characters', correct: false }
      ]
    },
    {
      answers: [
        { answer: 'This is a duplicate', correct: true },
        { answer: 'This is a duplicate', correct: false }
      ]
    },
    {
      answers: [
        { answer: 'answer', correct: false },
        { answer: 'another answer', correct: false },
      ]
    },
  ])('Invalid Answers', ({ answers }) => {
    expect(requestQuizUpdateQuestion(
      user.token,
      {
        question: 'First Question',
        duration: 20,
        points: 3,
        thumbnailUrl: 'http://www.examplepicture.com.png',
        answers: answers,
      },
      quiz1.quizId,
      question1.questionId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { url: '' },
    { url: 'http:/hello.com.png' },
    { url: 'htt:blablabla.jpeg' },
    { url: 'https://www.comp1531.jp' },
    { url: 'http://mycode.pngg' },
  ])('Invalid question url', ({ url }) => {
    expect(
      requestQuizUpdateQuestion(
        user.token,
        {
          question: 'question',
          duration: 10,
          points: 3,
          answers: [
            { answer: 'answer', correct: true },
            { answer: 'answer 2', correct: false },
          ],
          thumbnailUrl: url
        },
        quiz1.quizId,
        question1.questionId
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
