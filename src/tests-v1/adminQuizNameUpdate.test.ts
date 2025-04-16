import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  requestQuizInfo,
  requestQuizNameUpdate,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
});

describe('adminQuizNameUpdate Successful Tests', () => {
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

  test("Editing quiz1's info 1", () => {
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

    requestQuizNameUpdate(user1.token, quiz1.quizId, 'Discarded Quiz');

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user1.token, quiz1.quizId)).toStrictEqual({
      body: {
        quizId: quiz1.quizId,
        name: 'Discarded Quiz',
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

    const response = requestQuizInfo(user1.token, quiz1.quizId);
    const { body } = response;

    expect(body.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(body.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(body.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(body.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });

  test("Editing quiz2's info", () => {
    expect(requestQuizInfo(user1.token, quiz2.quizId)).toStrictEqual({
      body: {
        quizId: quiz2.quizId,
        name: 'My Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Another Quiz yay',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      },
      statusCode: 200,
    });

    requestQuizNameUpdate(user1.token, quiz2.quizId, 'My Quiz but better');
    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user1.token, quiz2.quizId)).toStrictEqual({
      body: {
        quizId: quiz2.quizId,
        name: 'My Quiz but better',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Another Quiz yay',
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
});

describe('adminQuizNameUpdate Fail Tests', () => {
  let quiz1: { quizId?: number; error?: string };
  let user1: { token?: string; error?: string };
  let user2: { token?: string; error?: string };

  test('token invalid test', () => {
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

    expect(
      requestQuizNameUpdate(
        user1.token + user2.token,
        quiz1.quizId,
        'a name'
      )
    ).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('Logged out user', () => {
    const user = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    const quiz = reqQuizCreate(
      user.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    expect(reqAdminAuthLogout(user.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(requestQuizNameUpdate(user.token, quiz.quizId, 'Quizzzz')).toStrictEqual({
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

    user2 = reqAdminAuthRegister(
      'johnsmith@gmail.com',
      'Us3rnames',
      'John',
      'Smith'
    ).body;

    expect(
      requestQuizNameUpdate(user1.token, quiz1.quizId + 1, 'a name')
    ).toStrictEqual({
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

    expect(
      requestQuizNameUpdate(user2.token, quiz1.quizId, 'a name')
    ).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  test.each([
    { name: '!@#$' },
    { name: 'ok' },
    { name: 'this quiz name is invalid as it is too long' },
    { name: 'My Quiz 2' },
  ])('Invalid name test', ({ name }) => {
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
    reqQuizCreate(user1.token, 'My Quiz 2', 'Another Quiz yay');

    expect(
      requestQuizNameUpdate(user1.token, quiz1.quizId, name)
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
