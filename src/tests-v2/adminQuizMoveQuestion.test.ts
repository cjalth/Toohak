import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuizInfo,
  requestQuizMoveQuestion,
} from './testHelpers';

const ERROR = { error: expect.any(String) };
let user: { token: string };
let quiz1: { quizId: number };
let timeCreated: number;
let question1: { questionId: number };
let question2: { questionId: number };
let question3: { questionId: number };

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
    },
    quiz1.quizId
  ).body;

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
    },
    quiz1.quizId
  ).body;

  question3 = reqQuizCreateQuestion(
    user.token,
    {
      question: 'Question 3',
      duration: 7,
      points: 7,
      answers: [
        { answer: 'correct answer', correct: true },
        { answer: 'wrong answer', correct: false }
      ],
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
    },
    quiz1.quizId
  ).body;
});

describe('adminQuizMoveQuestion Successful Tests', () => {
  test('Move Question to the back (n - 1 position)', () => {
    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 22,
        thumbnailUrl: '',
        numQuestions: 3,
        questions: [
          {
            questionId: expect.any(Number),
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
            questionId: expect.any(Number),
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
          {
            questionId: expect.any(Number),
            question: 'Question 3',
            duration: 7,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 7,
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

    requestQuizMoveQuestion(user.token, quiz1.quizId, question1.questionId, 2);

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 22,
        thumbnailUrl: '',
        numQuestions: 3,
        questions: [
          {
            questionId: expect.any(Number),
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
          {
            questionId: expect.any(Number),
            question: 'Question 3',
            duration: 7,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 7,
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
            questionId: expect.any(Number),
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

  test('Move Question to the front (0 position)', () => {
    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 22,
        thumbnailUrl: '',
        numQuestions: 3,
        questions: [
          {
            questionId: expect.any(Number),
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
            questionId: expect.any(Number),
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
          {
            questionId: expect.any(Number),
            question: 'Question 3',
            duration: 7,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 7,
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

    requestQuizMoveQuestion(user.token, quiz1.quizId, question2.questionId, 0);

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 22,
        thumbnailUrl: '',
        numQuestions: 3,
        questions: [
          {
            questionId: expect.any(Number),
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
          {
            questionId: expect.any(Number),
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
            questionId: expect.any(Number),
            question: 'Question 3',
            duration: 7,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 7,
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

  test('Move Question to the middle (1 position)', () => {
    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 22,
        thumbnailUrl: '',
        numQuestions: 3,
        questions: [
          {
            questionId: expect.any(Number),
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
            questionId: expect.any(Number),
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
          {
            questionId: expect.any(Number),
            question: 'Question 3',
            duration: 7,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 7,
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

    requestQuizMoveQuestion(user.token, quiz1.quizId, question3.questionId, 1);

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        duration: 22,
        thumbnailUrl: '',
        numQuestions: 3,
        questions: [
          {
            questionId: expect.any(Number),
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
            questionId: expect.any(Number),
            question: 'Question 3',
            duration: 7,
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
            points: 7,
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
            questionId: expect.any(Number),
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

describe('adminQuizMoveQuestion Failing Tests', () => {
  test('Invalid Token', () => {
    const user2 = reqAdminAuthRegister('HD.Please@gmail.com', 'P4sswords1', 'HD', 'Please').body;
    expect(requestQuizMoveQuestion(user.token + user2.token, quiz1.quizId, question1.questionId, 0)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Empty Token', () => {
    expect(requestQuizMoveQuestion(undefined, quiz1.quizId, question1.questionId, 0)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(user.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(requestQuizMoveQuestion(user.token, quiz1.quizId, question1.questionId, 0)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Invalid QuizId', () => {
    expect(requestQuizMoveQuestion(user.token, quiz1.quizId + 1, question1.questionId, 0)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('User has no quiz with QuizId', () => {
    const user2 = reqAdminAuthRegister('HD.Please@gmail.com', 'P4sswords1', 'HD', 'Please').body;
    expect(requestQuizMoveQuestion(user2.token, quiz1.quizId, question1.questionId, 0)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('No Question with given QuestionId in Quiz', () => {
    expect(requestQuizMoveQuestion(user.token, quiz1.quizId, question1.questionId + question2.questionId + question3.questionId, 0)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test.each([
    { newPosition: -1 },
    { newPosition: 10 },
    { newPosition: 0 },
  ])('Invalid new position', ({ newPosition }) => {
    expect(requestQuizMoveQuestion(user.token, quiz1.quizId, question1.questionId, newPosition)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
