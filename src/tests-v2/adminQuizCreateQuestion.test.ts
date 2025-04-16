import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  requestQuizInfo,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let timeCreated: number;
beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;

  timeCreated = Math.floor(Date.now() / 1000);
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
});

describe('Successful tests (POST /v2/admin/quiz/{quizid}/question)', () => {
  test('Successful question creation', () => {
    const output = reqQuizCreateQuestion(
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
      quizId.quizId
    );
    expect(output).toStrictEqual({
      body: { questionId: expect.any(Number) },
      statusCode: 200,
    });
    const timeLastEdited = Math.floor(Date.now() / 1000);
    const questionId = output.body;

    const quizInfo = requestQuizInfo(userId.token, quizId.quizId).body;

    expect(quizInfo).toStrictEqual({
      quizId: quizId.quizId,
      name: 'quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 1,
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
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'answer 2',
              colour: expect.any(String),
              correct: false,
            },
          ],
        },
      ],
      duration: 10,
      thumbnailUrl: ''
    });

    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });
});

describe('Unsuccessful tests (POST /v2/admin/quiz/{quizid}/question)', () => {
  test('Invalid token', () => {
    expect(
      reqQuizCreateQuestion(
        userId.token + 1,
        {
          question: 'question',
          duration: 10,
          points: 5,
          answers: [
            { answer: 'answer', correct: true },
            { answer: 'answer 2', correct: false },
          ],
          thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
        },
        quizId.quizId
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(userId.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqQuizCreateQuestion(
      userId.token,
      {
        question: 'question',
        duration: 10,
        thumbnailUrl: '',
        points: 5,
        answers: [
          { answer: 'answer', correct: true },
          { answer: 'answer 2', correct: false },
        ],
      },
      quizId.quizId
    )).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Not owner of the quiz', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;

    expect(
      reqQuizCreateQuestion(
        userId2.token,
        {
          question: 'question',
          duration: 10,
          points: 5,
          answers: [
            { answer: 'answer', correct: true },
            { answer: 'answer 2', correct: false },
          ],
          thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
        },
        quizId.quizId
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  test('Invalid quizId', () => {
    expect(
      reqQuizCreateQuestion(
        userId.token,
        {
          question: 'question',
          duration: 10,
          points: 5,
          answers: [
            { answer: 'answer', correct: true },
            { answer: 'answer 2', correct: false },
          ],
          thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
        },
        quizId.quizId + 1
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  const string = 'a';
  test.each([{ question: 'hi' }, { question: string.repeat(60) }])(
    'Invalid question',
    ({ question }) => {
      expect(
        reqQuizCreateQuestion(
          userId.token,
          {
            question: question,
            duration: 10,
            points: 5,
            answers: [
              { answer: 'answer', correct: true },
              { answer: 'answer 2', correct: false },
            ],
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
          },
          quizId.quizId
        )
      ).toStrictEqual({
        body: ERROR,
        statusCode: 400,
      });
    }
  );

  test.each([
    {
      answers: [
        { answer: 'answer1', correct: true },
        { answer: 'answer2', correct: false },
        { answer: 'answer3', correct: false },
        { answer: 'answer4', correct: false },
        { answer: 'answer5', correct: false },
        { answer: 'answer6', correct: false },
        { answer: 'answer7', correct: false },
      ],
    },
    {
      answers: [{ answer: 'answer1', correct: true }],
    },
    {
      answers: [
        { answer: 'answer1', correct: true },
        { answer: 'answer1', correct: false },
      ],
    },
    {
      answers: [
        { answer: 'answer1', correct: true },
        { answer: '', correct: false },
      ],
    },
    {
      answers: [
        { answer: 'answer1', correct: true },
        { answer: string.repeat(40), correct: false },
      ],
    },
    {
      answers: [
        { answer: 'answer1', correct: false },
        { answer: 'answer2', correct: false },
      ],
    },
  ])('Invalid question answers', ({ answers }) => {
    expect(
      reqQuizCreateQuestion(
        userId.token,
        { question: 'question', duration: 10, points: 5, answers: answers, thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg' },
        quizId.quizId
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test.each([{ duration: -1 }, { duration: 1000 }])(
    'Invalid question duration',
    ({ duration }) => {
      reqQuizCreateQuestion(
        userId.token,
        {
          question: 'question',
          duration: 10,
          points: 5,
          answers: [
            { answer: 'answer', correct: true },
            { answer: 'answer 2', correct: false },
          ],
          thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
        },
        quizId.quizId
      );
      expect(
        reqQuizCreateQuestion(
          userId.token,
          {
            question: 'question',
            duration: duration,
            points: 5,
            answers: [
              { answer: 'answer', correct: true },
              { answer: 'answer 2', correct: false },
            ],
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
          },
          quizId.quizId
        )
      ).toStrictEqual({
        body: ERROR,
        statusCode: 400,
      });
    }
  );

  test.each([{ points: -1 }, { points: 1000 }])(
    'Invalid question points',
    ({ points }) => {
      expect(
        reqQuizCreateQuestion(
          userId.token,
          {
            question: 'question',
            duration: 10,
            points: points,
            answers: [
              { answer: 'answer', correct: true },
              { answer: 'answer 2', correct: false },
            ],
            thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg'
          },
          quizId.quizId
        )
      ).toStrictEqual({
        body: ERROR,
        statusCode: 400,
      });
    }
  );

  test.each([
    { url: '' },
    { url: 'http:/hello.com.png' },
    { url: 'htt:blablabla.jpeg' },
    { url: 'https://www.comp1531.jp' },
    { url: 'http://mycode.pngg' },
  ])('Invalid question url', ({ url }) => {
    expect(
      reqQuizCreateQuestion(
        userId.token,
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
        quizId.quizId
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
