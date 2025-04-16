import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizRemove,
  requestQuizInfo,
  requestQuizNameUpdate,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
});

describe('adminQuizInfo Successful Tests', () => {
  test("Printing quiz's info from quizzes", () => {
    const user1 = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    const timeCreated = Math.floor(Date.now() / 1000);

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

    const quizInfo = requestQuizInfo(user1.token, quiz1.quizId).body;

    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeCreated + 2);
  });

  test("Printing quizzes's info from trash", () => {
    const user = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    const quiz1 = reqQuizCreate(
      user.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    const timeCreated = Math.floor(Date.now() / 1000);

    reqQuizRemove(user.token, quiz1.quizId);

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(user.token, quiz1.quizId)).toStrictEqual({
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

    const quizInfo = requestQuizInfo(user.token, quiz1.quizId).body;

    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });

  test('Editing quiz & adding questions then printing info', () => {
    const user1 = reqAdminAuthRegister(
      'WhatisThis@gmail.com',
      'P4sswords',
      'What',
      'This'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    const timeCreated = Math.floor(Date.now() / 1000);

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

    const quizInfo = requestQuizInfo(user1.token, quiz1.quizId).body;

    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });
});

describe('adminQuizInfo Fail Tests', () => {
  const user1 = reqAdminAuthRegister(
    'Ilovecomp@gmail.com',
    'P4sswords12',
    'Love',
    'Comp'
  ).body;

  const quiz1 = reqQuizCreate(
    user1.token,
    'My Quiz',
    'This is my Quiz'
  ).body;

  const user2 = reqAdminAuthRegister(
    'johnsmith@gmail.com',
    'Us3rnames',
    'John',
    'Smith'
  ).body;

  test('token invalid test', () => {
    expect(requestQuizInfo(user1.token + user2.token, quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('Logged out user', () => {
    const user1 = reqAdminAuthRegister(
      'Ilovecomp@gmail.com',
      'P4sswords12',
      'Love',
      'Comp'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    expect(reqAdminAuthLogout(user1.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(requestQuizInfo(user1.token, quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('QuizId has no valid quiz test', () => {
    const user1 = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;
    expect(requestQuizInfo(user1.token, quiz1.quizId + 1)).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  test('User has no quiz with QuizId', () => {
    const user1 = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    const user2 = reqAdminAuthRegister(
      'johnsmith@gmail.com',
      'Us3rnames',
      'John',
      'Smith'
    ).body;
    expect(requestQuizInfo(user2.token, quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });

  test('User doesn\'t own quiz in trash', () => {
    const user1 = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    const user2 = reqAdminAuthRegister(
      'johnsmith@gmail.com',
      'Us3rnames',
      'John',
      'Smith'
    ).body;

    reqQuizRemove(user1.token, quiz1.quizId);

    expect(requestQuizInfo(user2.token, quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });
});
