import {
  reqAdminAuthLogout,
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqQuizSessionList,
  reqUpdateSession,
} from './testHelpers';

import slync from 'slync';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let activeSession1: { sessionId?: number; error?: string };
let activeSession2: { sessionId?: number; error?: string };
let activeSession3: { sessionId?: number; error?: string };
let activeSession4: { sessionId?: number; error?: string };
let inactiveSession1: { sessionId?: number; error?: string };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister(
    'mikewazowski@gmail.com',
    'Password1',
    'Mike',
    'Wazowski'
  ).body;
  quizId = reqQuizCreate(userId.token, 'quiz', '').body;
  reqQuizCreateQuestion(
    userId.token,
    {
      question: 'question 1',
      duration: 2,
      points: 5,
      answers: [
        { answer: 'answer 1', correct: true },
        { answer: 'answer 2', correct: false },
      ],
      thumbnailUrl:
        'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
    },
    quizId.quizId
  );
  reqQuizCreateQuestion(
    userId.token,
    {
      question: 'question 2',
      duration: 2,
      points: 5,
      answers: [
        { answer: 'answer 1', correct: true },
        { answer: 'answer 2', correct: false },
      ],
      thumbnailUrl:
        'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
    },
    quizId.quizId
  );
  activeSession1 = reqStartSession(userId.token, 5, quizId.quizId).body;
});

describe('Successful tests', () => {
  test('LOBBY state after session start', () => {
    const sessions = reqQuizSessionList(userId.token, quizId.quizId);
    expect(sessions).toStrictEqual({
      body: {
        activeSessions: expect.arrayContaining([activeSession1.sessionId]),
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('Checking ascending Order', () => {
    activeSession2 = reqStartSession(userId.token, 5, quizId.quizId).body;
    activeSession3 = reqStartSession(userId.token, 2, quizId.quizId).body;
    activeSession4 = reqStartSession(userId.token, 1, quizId.quizId).body;
    const sessions = reqQuizSessionList(userId.token, quizId.quizId);
    expect(sessions).toStrictEqual({
      body: {
        activeSessions: [
          activeSession1.sessionId,
          activeSession2.sessionId,
          activeSession3.sessionId,
          activeSession4.sessionId
        ],
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('QUESTION_COUNTDOWN state ', () => {
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'NEXT_QUESTION'
    );
    expect(reqQuizSessionList(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        activeSessions: expect.arrayContaining([activeSession1.sessionId]),
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('QUESTION_OPEN state ', () => {
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'NEXT_QUESTION'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'SKIP_COUNTDOWN'
    );
    expect(reqQuizSessionList(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        activeSessions: [activeSession1.sessionId],
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('ANSWER_SHOW state ', () => {
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'NEXT_QUESTION'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'SKIP_COUNTDOWN'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'GO_TO_ANSWER'
    );
    expect(reqQuizSessionList(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        activeSessions: [activeSession1.sessionId],
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('QUESTION_CLOSE state ', () => {
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'NEXT_QUESTION'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'SKIP_COUNTDOWN'
    );
    slync(0.5 * 1000);
    expect(reqQuizSessionList(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        activeSessions: [activeSession1.sessionId],
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('FINAL_RESULT state ', () => {
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'NEXT_QUESTION'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'SKIP_COUNTDOWN'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'GO_TO_ANSWER'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'GO_TO_FINAL_RESULT'
    );
    expect(reqQuizSessionList(userId.token, quizId.quizId)).toStrictEqual({
      body: {
        activeSessions: [activeSession1.sessionId],
        inactiveSessions: [],
      },
      statusCode: 200,
    });
  });

  test('Verify sessions after END action to confirm inactivity', () => {
    inactiveSession1 = reqStartSession(userId.token, 5, quizId.quizId).body;
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      inactiveSession1.sessionId,
      'END'
    );
    reqUpdateSession(
      userId.token,
      quizId.quizId,
      activeSession1.sessionId,
      'END'
    );
    const sessions = reqQuizSessionList(userId.token, quizId.quizId);
    expect(sessions).toStrictEqual({
      body: {
        activeSessions: [],
        inactiveSessions: [
          activeSession1.sessionId,
          inactiveSession1.sessionId,
        ],
      },
      statusCode: 200,
    });
  });
});

describe('Failing test cases', () => {
  test('User is Logged out', () => {
    reqAdminAuthLogout(userId.token);
    expect(reqQuizSessionList(userId.token, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('User is not Valid', () => {
    expect(reqQuizSessionList('what', quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 401,
    });
  });

  test('Quiz does not belong to user', () => {
    const userId2 = reqAdminAuthRegister(
      'ilovecomp1531@gmail.com',
      'Comp1531',
      'Queenie',
      'Smith'
    ).body;
    expect(reqQuizSessionList(userId2.token, quizId.quizId)).toStrictEqual({
      body: ERROR,
      statusCode: 403,
    });
  });
});
