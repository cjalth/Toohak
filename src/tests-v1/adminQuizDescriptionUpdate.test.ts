import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  requestQuizDescriptionUpdate,
  requestQuizInfo,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
});

describe('adminQuizDescriptionUpdate Successful Tests', () => {
  let user1: { token: string };
  let quiz1: { quizId: number };
  let timeCreated: number;
  let quiz2: { quizId: number };
  let timeCreated2: number;
  beforeEach(() => {
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

    timeCreated = Math.floor(Date.now() / 1000);

    quiz2 = reqQuizCreate(
      user1.token,
      'My Quiz 2',
      'Another Quiz yay'
    ).body;
    timeCreated2 = Math.floor(Date.now() / 1000);
  });

  test("Editing quiz1's description", () => {
    expect(requestQuizInfo(user1.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      },
      statusCode: 200,
    });

    const resQDU = requestQuizDescriptionUpdate(user1.token, quiz1.quizId, '');
    expect(resQDU.statusCode).toStrictEqual(200);
    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user1.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'My Quiz',
        timeCreated: timeCreated,
        timeLastEdited: timeLastEdited,
        description: '',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      },
      statusCode: 200,
    });

    const response = requestQuizInfo(user1.token, quiz2.quizId);
    const { body } = response;

    expect(body.timeCreated).toBeGreaterThanOrEqual(timeCreated2 - 1);
    expect(body.timeCreated).toBeLessThanOrEqual(timeCreated2 + 2);
    expect(body.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(body.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });

  test("Editing quiz2's description, twice", () => {
    expect(requestQuizInfo(user1.token, quiz2.quizId)).toStrictEqual({
      body: {
        quizId: quiz2.quizId,
        name: 'My Quiz 2',
        timeCreated: timeCreated2,
        timeLastEdited: timeCreated2,
        description: 'Another Quiz yay',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      },
      statusCode: 200,
    });

    requestQuizDescriptionUpdate(user1.token, quiz2.quizId, 'A description');

    expect(requestQuizInfo(user1.token, quiz2.quizId)).toStrictEqual({
      body: {
        quizId: quiz2.quizId,
        name: 'My Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'A description',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      },
      statusCode: 200,
    });

    requestQuizDescriptionUpdate(user1.token, quiz2.quizId, '');
    const timeLastEdited2 = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user1.token, quiz2.quizId)).toStrictEqual({
      body: {
        quizId: quiz2.quizId,
        name: 'My Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      },
      statusCode: 200,
    });

    const response = requestQuizInfo(user1.token, quiz2.quizId);
    const { body } = response;

    expect(body.timeCreated).toBeGreaterThanOrEqual(timeCreated2 - 1);
    expect(body.timeCreated).toBeLessThanOrEqual(timeCreated2 + 2);
    expect(body.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited2 - 1);
    expect(body.timeLastEdited).toBeLessThanOrEqual(timeLastEdited2 + 2);
  });
});

describe('adminQuizDescriptionUpdate Fail Tests', () => {
  let quiz1: { quizId?: number; error?: string };
  let user1: { token?: string; error?: string };
  let user2: { token?: string; error?: string };

  test('Token invalid test', () => {
    user1 = reqAdminAuthRegister(
      'CodeAway@gmail.com',
      'P4sswords',
      'Code',
      'Away'
    ).body;

    quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    user2 = reqAdminAuthRegister(
      'johnsmith@gmail.com',
      'Us3rnames',
      'John',
      'Smith'
    ).body;

    expect(
      requestQuizDescriptionUpdate(
        user1.token + user2.token,
        quiz1.quizId,
        'description'
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('Logged out user', () => {
    user1 = reqAdminAuthRegister(
      'CodeAway@gmail.com',
      'P4sswords',
      'Code',
      'Away'
    ).body;

    quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    expect(reqAdminAuthLogout(user1.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(requestQuizDescriptionUpdate(user1.token, quiz1.quizId, 'description')).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('QuizId has no valid quiz test', () => {
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
    expect(requestQuizDescriptionUpdate(user1.token, quiz1.quizId + 1, '')).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  test('User has no quiz with QuizId', () => {
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

    user2 = reqAdminAuthRegister(
      'johnsmith@gmail.com',
      'Us3rnames',
      'John',
      'Smith'
    ).body;
    expect(requestQuizDescriptionUpdate(user2.token, quiz1.quizId, '')).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  test('Invalid description test', () => {
    const desc =
      'This is a very long description name that is definitely invalid as it is actually above 100 characters';

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
    expect(requestQuizDescriptionUpdate(user1.token, quiz1.quizId, desc)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
