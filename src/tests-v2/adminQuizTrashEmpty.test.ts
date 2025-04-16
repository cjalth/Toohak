import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizRemove,
  reqQuizTrash,
  reqTrashEmpty,
} from './testHelpers';

let user: { body: { token: string }; statusCode: number };
let user2: { body: { token: string }; statusCode: number };
let quiz1: { body: { quizId: number }; statusCode: number };
let quiz2: { body: { quizId: number }; statusCode: number };
let quiz3: { body: { quizId: number }; statusCode: number };
let quiz4: { body: { quizId: number }; statusCode: number };
let userQuiz1: number[] = [];
let userQuiz2: number[] = [];
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  // Clear the database before each test
  reqClear();

  // Reset the quiz arrays
  userQuiz1 = [];
  userQuiz2 = [];

  // Register two users and create a quiz for each, then remove those quizzes (simulate moving to trash)
  user = reqAdminAuthRegister('james.sully@unsw.edu.au', 'Password321', 'James', 'Sullivan');
  quiz1 = reqQuizCreate(user.body.token, 'Monster HS', 'Need a job');
  userQuiz1.push(quiz1.body.quizId);
  reqQuizRemove(user.body.token, quiz1.body.quizId);

  user2 = reqAdminAuthRegister('randall.boggs@unsw.edu.au', 'Password123', 'Randall', 'Boggs');
  quiz2 = reqQuizCreate(user2.body.token, 'Monster Work', 'Need a life');
  userQuiz2.push(quiz2.body.quizId);
  reqQuizRemove(user2.body.token, quiz2.body.quizId);
});

describe('Success Empty trash', () => {
  test('Successfully empty the trash for user1', () => {
    expect(reqTrashEmpty(user.body.token, JSON.stringify(userQuiz1))).toStrictEqual({
      body: {},
      statusCode: 200,
    });
  });

  test('Nothing is in the Trash after emptying', () => {
    reqTrashEmpty(user2.body.token, JSON.stringify(userQuiz2));
    reqTrashEmpty(user.body.token, JSON.stringify(userQuiz1));
    expect(reqQuizTrash(user.body.token)).toStrictEqual({
      body: { quizzes: [] },
      statusCode: 200
    });
  });

  test("After emptying User1's trash, trash should still contain User2 quiz", () => {
    // Make sure to empty User1's trash first
    reqTrashEmpty(user.body.token, JSON.stringify(userQuiz1));

    // Expecting User2's trash to still contain their quiz
    expect(reqQuizTrash(user2.body.token)).toStrictEqual({
      body: {
        quizzes: expect.arrayContaining([
          expect.objectContaining({
            quizId: expect.any(Number),
            name: 'Monster Work'
          })
        ])
      },
      statusCode: 200
    });
  });
});

describe('Failing Empty trash', () => {
  test('Quizzes are not in trash', () => {
    const notInTrashQuizIds: number[] = [];

    quiz3 = reqQuizCreate(
      user.body.token,
      'NEW QUIZ',
      'better quiz'
    );
    quiz4 = reqQuizCreate(
      user.body.token,
      'No wait',
      'This one is better'
    );

    notInTrashQuizIds.push(quiz3.body.quizId);
    notInTrashQuizIds.push(quiz4.body.quizId);

    expect(
      reqTrashEmpty(user.body.token, JSON.stringify(notInTrashQuizIds))
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });

  test('Invalid token', () => {
    expect(
      reqTrashEmpty(user.body.token + 24323, JSON.stringify(userQuiz1))
    ).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('Logged out user', () => {
    expect(reqAdminAuthLogout(user.body.token)).toStrictEqual({
      body: {},
      statusCode: 200
    });
    expect(reqTrashEmpty(user.body.token, JSON.stringify(userQuiz1))).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('Quizzes not owned by user', () => {
    expect(
      reqTrashEmpty(user.body.token, JSON.stringify(userQuiz2))
    ).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });
});
