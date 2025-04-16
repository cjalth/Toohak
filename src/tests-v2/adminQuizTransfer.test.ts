import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizList,
  requestQuizTransfer,
  requestQuizNameUpdate,
  reqQuizCreateQuestion,
  reqStartSession,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  reqClear();
});

describe('adminQuizTransfer Successful Test', () => {
  test('Transferring quiz from person 1 to person 2', () => {
    const user1 = reqAdminAuthRegister(
      'unhingedcode@gmail.com',
      'P4ssword1s',
      'Unhinged',
      'Code'
    ).body;

    const user2 = reqAdminAuthRegister(
      'haydensmith@gmail.com',
      'H4ydenSmith',
      'Hayden',
      'Smith'
    ).body;

    const quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    const quiz2 = reqQuizCreate(
      user1.token,
      'My Quiz 2',
      'Another Quiz yay'
    ).body;

    expect(reqQuizList(user1.token)).toStrictEqual({
      body: {
        quizzes: [
          { quizId: quiz1.quizId, name: 'My Quiz' },
          { quizId: quiz2.quizId, name: 'My Quiz 2' }
        ]
      },
      statusCode: 200
    });

    requestQuizTransfer(user1.token, 'haydensmith@gmail.com', quiz1.quizId);

    expect(reqQuizList(user1.token)).toStrictEqual({
      body: {
        quizzes: [
          { quizId: quiz2.quizId, name: 'My Quiz 2' }
        ]
      },
      statusCode: 200
    });

    expect(reqQuizList(user2.token)).toStrictEqual({
      body: {
        quizzes: [
          { quizId: quiz1.quizId, name: 'My Quiz' }
        ]
      },
      statusCode: 200
    });
  });
});

describe('adminQuizTransfer Failing Tests', () => {
  let user1: { token: string };
  let user2: { token: string };
  let quiz1: { quizId: number };
  let quiz2: { quizId: number };

  beforeEach(() => {
    user1 = reqAdminAuthRegister(
      'helloworld@gmail.com',
      'P4sswords',
      'Hello',
      'World'
    ).body;

    user2 = reqAdminAuthRegister(
      'pleasepass@gmail.com',
      'tH1sPasS23',
      'Please',
      'Pass'
    ).body;

    quiz1 = reqQuizCreate(
      user1.token,
      'My Quiz',
      'This is my Quiz'
    ).body;

    quiz2 = reqQuizCreate(
      user2.token,
      'My Quiz',
      'Another Quiz yay'
    ).body;
  });

  test('Invalid Token', () => {
    expect(requestQuizTransfer(user1.token + user2.token, 'pleasepass@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Empty Token', () => {
    expect(requestQuizTransfer(undefined, 'pleasepass@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(user1.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(requestQuizTransfer(user1.token, 'pleasepass@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Invalid QuizId', () => {
    expect(requestQuizTransfer(user1.token, 'pleasepass@gmail.com', quiz1.quizId + quiz2.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('User doesn\'t own quiz', () => {
    expect(requestQuizTransfer(user1.token, 'pleasepass@gmail.com', quiz2.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('Invalid userEmail', () => {
    expect(requestQuizTransfer(user1.token, '1531@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('userEmail used by current logged in user', () => {
    expect(requestQuizTransfer(user1.token, 'helloworld@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('QuizId refers to quiz that has same name as target user\'s quiz', () => {
    expect(requestQuizTransfer(user1.token, 'pleasepass@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });

  test('A quiz session isn\'t in the end state', () => {
    requestQuizNameUpdate(user1.token, quiz1.quizId, 'Discarded Quiz');
    reqQuizCreateQuestion(user1.token, { question: 'question', duration: 10, points: 5, answers: [{ answer: 'answer 1', correct: true }, { answer: 'answer 2', correct: false }], thumbnailUrl: 'https://www.example.com.jpeg' }, quiz1.quizId);
    reqStartSession(user1.token, 5, quiz1.quizId);
    expect(requestQuizTransfer(user1.token, 'pleasepass@gmail.com', quiz1.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
