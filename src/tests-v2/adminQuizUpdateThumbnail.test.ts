import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  requestQuizInfo,
  reqQuizUpdateThumbnail,
} from './testHelpers';

const ERROR = { error: expect.any(String) };
const correctUrl = 'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg';
let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let timeCreated: number;

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister('helloworld@gmail.com', 'P4ssword', 'John', 'Doe').body;
  quizId = reqQuizCreate(userId.token, 'My Quiz', 'This is my Quiz').body;
  timeCreated = Math.floor(Date.now() / 1000);
});

describe('adminQuizUpdateThumbnail Successful Tests', () => {
  test("Editing quiz's thumbnail", () => {
    expect(requestQuizInfo(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        quizId: quizId.quizId,
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

    reqQuizUpdateThumbnail(userId.token, quizId.quizId, correctUrl);

    const timeLastEdited = Math.floor(Date.now() / 1000);

    expect(requestQuizInfo(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        quizId: quizId.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is my Quiz',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: correctUrl,
      },
      statusCode: 200,
    });

    const quizInfo = requestQuizInfo(userId.token, quizId.quizId).body;

    expect(quizInfo.timeCreated).toBeGreaterThanOrEqual(timeCreated - 1);
    expect(quizInfo.timeCreated).toBeLessThanOrEqual(timeCreated + 2);
    expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(timeLastEdited - 1);
    expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(timeLastEdited + 2);
  });
});

describe('adminQuizUpdateThumbnail Fail Tests', () => {
  test('Invalid token', () => {
    expect(reqQuizUpdateThumbnail(userId.token + 1, quizId.quizId, correctUrl)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('logged out user', () => {
    reqAdminAuthLogout(userId.token);
    expect(reqQuizUpdateThumbnail(userId.token, quizId.quizId, correctUrl)).toStrictEqual({
      body: ERROR,
      statusCode: 401
    });
  });

  test('invalid quizId', () => {
    expect(reqQuizUpdateThumbnail(userId.token, quizId.quizId + 1, correctUrl)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test('quiz does not belong to user', () => {
    const userId2 = reqAdminAuthRegister('ilovecomp1531@gmail.com', 'Comp1531', 'Jane', 'Doe').body;
    expect(reqQuizUpdateThumbnail(userId2.token, quizId.quizId, correctUrl)).toStrictEqual({
      body: ERROR,
      statusCode: 403
    });
  });

  test.each([
    { imgUrl: 'http:/hello.com.png' },
    { imgUrl: 'htt:blablabla.jpeg' },
    { imgUrl: 'https://www.comp1531.jp' },
    { imgUrl: 'http://mycode.pngg' },
  ])('Invalid imgUrl', ({ imgUrl }) => {
    expect(reqQuizUpdateThumbnail(userId.token, quizId.quizId, imgUrl)).toStrictEqual({
      body: ERROR,
      statusCode: 400
    });
  });
});
