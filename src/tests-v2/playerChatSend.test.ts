import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqPlayerJoin,
  reqPlayerChat,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let playerId: { playerId: number; error?: string };
let sessionId: { sessionId?: number; error?: string };

beforeEach(() => {
  reqClear();
  userId = reqAdminAuthRegister(
    'brucewayne@gmail.com',
    'Password1',
    'Bruce',
    'Wayne'
  ).body;
  quizId = reqQuizCreate(userId.token, 'The BatCave', '').body;
  reqQuizCreateQuestion(
    userId.token,
    {
      question: "What's my butler's name?",
      duration: 2,
      points: 5,
      answers: [
        { answer: 'Alfred', correct: true },
        { answer: 'Michael-angelo', correct: false },
      ],
      thumbnailUrl:
        'https://miro.medium.com/v2/resize:fit:1200/1*LpxLQj3xgPwMaUjaM3NW7g.jpeg',
    },
    quizId.quizId
  );
  sessionId = reqStartSession(userId.token, 5, quizId.quizId).body;
  playerId = reqPlayerJoin(sessionId.sessionId, 'hello').body;
});

describe('Chat Functionality Tests', () => {
  test('Successfully send a chat message', () => {
    const message = { messageBody: 'I LOVE BATMAN!' };
    expect(reqPlayerChat(playerId.playerId, message.messageBody)).toStrictEqual(
      {
        body: {},
        statusCode: 200,
      }
    );
  });

  test('Fail to send a chat message with empty body', () => {
    expect(reqPlayerChat(playerId.playerId, '')).toStrictEqual(
      {
        body: ERROR,
        statusCode: 400,
      }
    );
  });

  test('Fail to send a chat message with overly long body', () => {
    expect(reqPlayerChat(playerId.playerId, 'NANA'.repeat(101))).toStrictEqual(
      {
        body: ERROR,
        statusCode: 400,
      }
    );
  });

  test('Fail to send a chat message with invalid player ID', () => {
    const message = { messageBody: "I'm cooler than Batman." };
    expect(
      reqPlayerChat(playerId.playerId + 999, message.messageBody)
    ).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
