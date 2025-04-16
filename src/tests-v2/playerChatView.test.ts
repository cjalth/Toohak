import {
  reqAdminAuthRegister,
  reqClear,
  reqQuizCreate,
  reqQuizCreateQuestion,
  reqStartSession,
  reqPlayerJoin,
  reqPlayerChat,
  reqPlayerChatView,
} from './testHelpers';

const ERROR = { error: expect.any(String) };

let userId: { token?: string; error?: string };
let quizId: { quizId?: number; error?: string };
let sessionId: { sessionId?: number; error?: string };
let playerId: { playerId: number; error?: string };

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
  playerId = reqPlayerJoin(sessionId.sessionId, 'Batman').body;
});

describe('Chat Retrieval Functionality Tests', () => {
  test('Send chat from 1 player', () => {
    reqPlayerChat(playerId.playerId, 'Hello from Batman!');
    reqPlayerChat(playerId.playerId, 'Anyone here?');
    expect(reqPlayerChatView(playerId.playerId)).toStrictEqual({
      body: {
        messages: [
          {
            message: 'Hello from Batman!',
            playerId: playerId.playerId,
            playerName: 'Batman',
            timeSent: expect.any(Number),
          },
          {
            message: 'Anyone here?',
            playerId: playerId.playerId,
            playerName: 'Batman',
            timeSent: expect.any(Number),
          },
        ],
      },
      statusCode: 200,
    });
  });

  test('Fail to retrieve messages with invalid player ID', () => {
    expect(reqPlayerChatView(playerId.playerId + 999)).toStrictEqual({
      body: ERROR,
      statusCode: 400,
    });
  });
});
