import { adminQuizCreate } from '../quiz';
import {
  reqAdminAuthLogin,
  reqAdminAuthRegister,
  reqClear,
  requestQuizInfo,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let user: { token?: string; error?: string };

describe('clears existing data', () => {
  reqClear();
  user = reqAdminAuthRegister('hayden.smith@unsw.edu.au', 'Abcdef123', 'Hayden', 'Smith').body;
  expect(user).toStrictEqual({ token: expect.any(String) });
  const quiz = adminQuizCreate(user.token, 'My Quiz', 'This is my Quiz');
  expect(quiz).toStrictEqual({ quizId: expect.any(Number) });

  const expectedUser: {
    quizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
    numQuestions: number;
    questions: [];
    duration: number;
    thumbnailUrl: string;
  } = {
    quizId: quiz.quizId,
    name: 'My Quiz',
    timeCreated: expect.any(Number),
    timeLastEdited: expect.any(Number),
    description: 'This is my Quiz',
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: ''
  };

  test('Admin quiz information retrieval', () => {
    const responseBody = requestQuizInfo(user.token, quiz.quizId).body;
    expect(responseBody).toEqual(expectedUser);
  });

  test('adminAuthLogin found dataset successfully', () => {
    const authLoginJson = reqAdminAuthLogin('hayden.smith@unsw.edu.au', 'Abcdef123');
    expect(authLoginJson.body).toStrictEqual({ token: expect.any(String) });
  });

  test('returns empty dictionary', () => {
    const response = reqClear();
    expect(response).toStrictEqual({});
  });

  test('adminQuizInfo cannot find quiz in the database', () => {
    const quizInfoJson = requestQuizInfo(user.token, quiz.quizId);
    expect(quizInfoJson.body).toStrictEqual(ERROR);
  });

  test('Registering duplicate user after clear called Successfully', () => {
    const adminAuthRegisterRes = reqAdminAuthRegister('hayden.smith@unsw.edu.au', 'Abcdef123', 'Hayden', 'Smith');
    expect(adminAuthRegisterRes.statusCode).toStrictEqual(200);
    expect(adminAuthRegisterRes.body).toStrictEqual({ token: expect.any(String) });
  });

  test('adminAuthLogin cannot find user in the database', () => {
    const response = reqClear();
    expect(response).toStrictEqual({});
    const authLoginRes = reqAdminAuthLogin('hayden.smith@unsw.edu.au', 'Abcdef123');
    expect(authLoginRes.statusCode).toStrictEqual(400);
    expect(authLoginRes.body).toStrictEqual(ERROR);
  });
});
