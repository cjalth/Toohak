// THIS IS THE FILE FOR HELPER FUNCTIONS
import {
  answerColours,
  QuestionBody,
  User,
  Quiz,
  Session,
  actions,
  sessionStates,
  setData,
  QuizSession,
  Player,
  Question,
  Data,
  getData,
} from './dataStore';

import crypto from 'crypto';

import validator from 'validator';
import { Timer, getTimerData } from './timerStore';

type EmptyObject = Record<string, never>;

export function quizUserIdCheck(
  database: Data,
  token: string
): { error?: string } | EmptyObject {
  const user = findUserByToken(database.user, token);
  if (!user) {
    return { error: "Token doesn't exist" };
  }

  const session = user.sessions.find((session) => session.token === token);

  if (!session.valid) {
    return { error: 'User is logged out' };
  }

  return {};
}

export function quizNameCheck(
  database: Data,
  name: string,
  token: string
): { error?: string } | EmptyObject {
  const invalidName = /[^a-zA-Z0-9 ]/.test(name);

  if (invalidName) {
    return { error: 'Invalid characters in quiz name' };
  }

  if (name.length < 3) {
    return { error: 'Quiz name too short' };
  }

  if (name.length > 30) {
    return { error: 'Quiz name too long' };
  }
  const user = findUserByToken(database.user, token);

  const duplicateQuiz = database.quizzes.find((quizzes) => {
    return quizzes.name === name && quizzes.authUserId === user.userId;
  });

  if (duplicateQuiz) {
    return { error: 'Quiz already exists' };
  }

  return {};
}

export function quizIdCheck(
  database: Data,
  quizId: number,
  token: string
): { error?: string } | EmptyObject {
  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz) {
    return { error: "QuizId doesn't exist" };
  }

  const user = findUserByToken(database.user, token);

  const quizBelongs = database.quizzes.find(
    (quizzes) => quizzes.quizId === quizId && quizzes.authUserId === user.userId
  );
  if (!quizBelongs) {
    return { error: 'Quiz is not owned by this user' };
  }

  return {};
}

export function quizIdInTrashCheck400(
  database: Data,
  quizIds: number[]
): { error?: string } {
  for (const quizId of quizIds) {
    const existsInDatabase = database.trash.some(
      (quiz) => quiz.quizId === quizId
    );
    if (!existsInDatabase) {
      return { error: "QuizId doesn't exist in trash" };
    }
  }

  return {};
}

export function quizIdInTrashCheck401(
  database: Data,
  token: string
): { error?: string } {
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    return userIdCheckResult;
  }

  return {};
}

export function quizIdInTrashCheck403(
  database: Data,
  quizIds: number[],
  token: string
): { error?: string } {
  for (const quizId of quizIds) {
    const quizInTrash = database.trash.find((quiz) => quiz.quizId === quizId);

    const userToken = findUserByToken(database.user, token);
    if (quizInTrash.authUserId !== userToken.userId) {
      return { error: 'Quiz is not owned by this user' };
    }
  }

  return {};
}

export function quizThumbnailCheck(
  imgUrl: string
): { error?: string } | EmptyObject {
  // Define the allowed file extensions and protocols
  const filetypes = ['jpg', 'jpeg', 'png'];
  const protocols = ['http://', 'https://'];

  const validFile = filetypes.some((ext) =>
    imgUrl.toLowerCase().endsWith('.' + ext)
  );
  const validProtocol = protocols.some((begin) => imgUrl.startsWith(begin));

  if (!validFile) {
    return { error: 'Invalid filetype' };
  }

  if (!validProtocol) {
    return { error: 'Starts with invalid protocol' };
  }

  return {};
}

export function quizQuestionIdCheck(
  database: Data,
  quizId: number,
  questionId: number
): { error?: string } | EmptyObject {
  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  const question = quiz.questions.find(
    (question) => question.questionId === questionId
  );

  if (!question) {
    return { error: "QuestionId doesn't exist" };
  }

  return {};
}

export function quizQuestionCheck(
  database: Data,
  questionBody: QuestionBody,
  quizId: number
): { error?: string } | EmptyObject {
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return { error: 'Question must be between 5 and 50 characters long' };
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return { error: 'There must be between 2 and 6 answers' };
  }

  if (questionBody.duration <= 0) {
    return { error: 'Duration must be a positive number' };
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  if (questionBody.duration > 180 || quiz.duration > 180) {
    return { error: 'Question duration exceeds the maximum limit of 3 mins' };
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'Points awarded for the question must be between 1 and 10',
    };
  }

  return {};
}

export function quizAnswerCheck(
  questionBody: QuestionBody
): { error?: string } | EmptyObject {
  const answerSet = new Set<string>();
  let hasCorrectAnswer = false;
  for (const answer of questionBody.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return { error: 'Answer must be between 1 and 30 characters long' };
    }
    if (answerSet.has(answer.answer)) {
      return { error: 'Duplicate answer already exists' };
    }
    answerSet.add(answer.answer);
    if (answer.correct) {
      hasCorrectAnswer = true;
    }
  }

  if (!hasCorrectAnswer) {
    return { error: 'At least one correct answer must be provided' };
  }

  return {};
}

export function getRandomColour(): answerColours {
  const colours = Object.values(answerColours);
  const randIndex = Math.floor(Math.random() * colours.length);
  return colours[randIndex];
}

export function quizSessionCheck(
  database: Data,
  quizId: number,
  sessionId: number
): { error?: string } | EmptyObject {
  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  const session = quiz.sessions.find(
    (session) => session.sessionId === sessionId
  );
  if (!session) {
    return { error: 'Invalid sessionId' };
  }

  return {};
}

export function actionIsValid(
  database: Data,
  action: string,
  quizId: number,
  sessionId: number
): { error?: string } | EmptyObject {
  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  const session = quiz.sessions.find(
    (session) => session.sessionId === sessionId
  );

  if (!(action in actions)) {
    return { error: 'Invalid action' };
  }

  if (session.state === sessionStates.END) {
    return { error: 'Action cannot be performed in this state' };
  } else if (
    session.state === sessionStates.LOBBY &&
    (action === actions.SKIP_COUNTDOWN ||
      action === actions.GO_TO_ANSWER ||
      action === actions.GO_TO_FINAL_RESULTS)
  ) {
    return { error: 'This action cannot be performed in the LOBBY state' };
  } else if (
    session.state === sessionStates.QUESTION_COUNTDOWN &&
    (action === actions.NEXT_QUESTION ||
      action === actions.GO_TO_ANSWER ||
      action === actions.GO_TO_FINAL_RESULTS)
  ) {
    return {
      error: 'This action cannot be performed in the QUESTION_COUNTDOWN state',
    };
  } else if (
    session.state === sessionStates.QUESTION_OPEN &&
    (action === actions.SKIP_COUNTDOWN ||
      action === actions.NEXT_QUESTION ||
      action === actions.GO_TO_FINAL_RESULTS)
  ) {
    return {
      error: 'This action cannot be performed in the QUESTION_OPEN state',
    };
  } else if (
    session.state === sessionStates.QUESTION_CLOSE &&
    action === actions.SKIP_COUNTDOWN
  ) {
    return {
      error: 'This action cannot be performed in the QUESTION_CLOSE state',
    };
  } else if (
    session.state === sessionStates.ANSWER_SHOW &&
    (action === actions.SKIP_COUNTDOWN || action === actions.GO_TO_ANSWER)
  ) {
    return {
      error: 'This action cannot be performed in the ANSWER_SHOW state',
    };
  } else if (
    session.state === sessionStates.FINAL_RESULTS &&
    (action === actions.SKIP_COUNTDOWN ||
      action === actions.NEXT_QUESTION ||
      action === actions.GO_TO_ANSWER ||
      action === actions.GO_TO_FINAL_RESULTS)
  ) {
    return {
      error: 'This action cannot be performed in the FINAL_RESULTS state',
    };
  }

  return {};
}

export function createNewTimer(
  sessionId: number,
  quizId: number,
  questionId: number,
  state: string,
  duration: number
) {
  const timerData = getTimerData();
  const timerId = setTimeout(() => {
    const database = getData();
    const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);

    const session = quiz.sessions.find(
      (session) => session.sessionId === sessionId
    );
    session.state = state;
    changePlayerStates(session.players, state);
    setData(database);
  }, duration);

  const timer: Timer = {
    timeoutId: timerId,
    questionId: questionId,
  };
  timerData.timers.push(timer);
}

export function clearTimer(questionId: number) {
  const timerData = getTimerData();
  const timerToClear = timerData.timers.find(
    (question) => question.questionId === questionId
  );
  if (timerToClear) {
    clearTimeout(timerToClear.timeoutId);
  }
}

// checks if the name is valid
export function isValidName(name: string): boolean {
  return validator.isAlpha(name.replace(/[-']/g, ''), 'en-AU');
}

export function isValidNameLength(name: string): boolean {
  return validator.isLength(name, { min: 2, max: 20 });
}

// since find will always return undefined.
export function findUserByEmail(
  users: User[],
  email: string
): User | undefined {
  return users.find((user) => user.email === email);
}

export function findUserByToken(
  users: User[],
  token: string
): User | undefined {
  for (const user of users) {
    const session = user.sessions.some((session) => session.token === token);
    if (session) {
      return user;
    }
  }
  return undefined; // If no user found, return undefined
}

export function retrieveSession(
  users: User[],
  token: string
): {
  user: User | undefined;
  session: Session | undefined;
} {
  for (const user of users) {
    const session = user.sessions.find((session) => session.token === token);
    if (session) {
      return { user, session };
    }
  }
  return { user: undefined, session: undefined };
}

export function findSessionById(
  quizzes: Quiz[],
  sessionId: number
): QuizSession | undefined {
  const quizWithSessionId = quizzes.find((quiz) =>
    quiz.sessions.find((quizSession) => quizSession.sessionId === sessionId)
  );

  if (quizWithSessionId) {
    return quizWithSessionId.sessions.find(
      (quizSession) => quizSession.sessionId === sessionId
    );
  }
}

export function findQuizBySessionId(sessionId: number, quizzes: Quiz[]): Quiz | undefined {
  let quiz: Quiz;
  for (quiz of quizzes) {
    const session = quiz.sessions.find(session => session.sessionId === sessionId);
    if (session) {
      return quiz;
    }
  }
}

export function isPlayerIdValid(playerId: number, quizzes: Quiz[]): Player | undefined {
  for (const quiz of quizzes) {
    for (const session of quiz.sessions) {
      const player = session.players.find(player => player.playerId === playerId);
      if (player) {
        return player;
      }
    }
  }

  return undefined;
}

export function quizSessionIdCheck(
  database: Data,
  sessionId: number
): { error?: string } | EmptyObject {
  const quizWithSessionId = database.quizzes.find((quiz) =>
    quiz.sessions.find((quizSession) => quizSession.sessionId === sessionId)
  );

  if (!quizWithSessionId) {
    return { error: "SessionId doesn't exist" };
  }
  return {};
}

export function uniqueAnswers(answerIds: number[]): { error?: string } | EmptyObject {
  const uniqueAnswer = new Set<number>();
  for (const answerId of answerIds) {
    if (uniqueAnswer.has(answerId)) {
      return { error: 'Duplicate answerIds' };
    }
    uniqueAnswer.add(answerId);
  }

  return {};
}

export function validAnswerIds(answerIds: number[], question: Question): { error?: string } | EmptyObject {
  for (const answerId of answerIds) {
    const isValidAnswer = question.answers.some(answer => answer.answerId === answerId);
    if (!isValidAnswer) {
      return { error: 'Invalid answerId' };
    }
  }

  return {};
}

export function changePlayerStates(players: Player[], state: string) {
  for (const player of players) {
    player.state = state;
  }
  return {};
}

export function getRandomName(quizSession: QuizSession): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let randomName = '';
  const letterSet = new Set<string>();
  const numberSet = new Set<string>();

  // Generate 5 unique letters
  while (letterSet.size < 5) {
    letterSet.add(letters.charAt(Math.floor(Math.random() * letters.length)));
  }
  randomName += Array.from(letterSet).join('');

  // Generate 3 unique numbers
  while (numberSet.size < 3) {
    numberSet.add(numbers.charAt(Math.floor(Math.random() * numbers.length)));
  }
  randomName += Array.from(numberSet).join('');

  if (!(quizSession.players.some((player) => player.playerName === randomName))) {
    return randomName;
  }
}

export function playerIdCheck(
  database: Data,
  playerId: number
): { error?: string } | EmptyObject {
  // Find the player with the given playerId
  const player: Player | undefined = database.quizzes
    .flatMap((quiz) => quiz.sessions)
    .flatMap((session) => session.players)
    .find((player) => player.playerId === playerId);

  // If no player is found, return an error message
  if (!player) {
    return { error: 'Invalid PlayerId' };
  }
  return {};
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) {
    return 'Password is less than 8 characters.';
  }

  if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return 'Password needs to contain at least 1 letter and 1 number.';
  }
}

export function getHashOf(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

/**
 * Finds the session by player ID.
 */
export function findSessionByPlayerId(
  database: Data,
  playerId: number
): QuizSession | undefined {
  return database.quizzes
    .flatMap((quiz) => quiz.sessions)
    .find((session) =>
      session.players.some((player) => player.playerId === playerId)
    );
}

export function fixPlayerRanks(sessionId: number, database: Data) {
  const session = findSessionById(database.quizzes, sessionId);
  const quiz = findQuizBySessionId(sessionId, database.quizzes);
  let questionNumber = 0;
  for (const question of quiz.questions) {
    const resultData = session.resultData.find(resultData => resultData.questionId === question.questionId);
    for (const player of session.players) {
      if (!resultData.playersCorrectList.includes(player.playerName)) {
        player.questionRanks[questionNumber] = session.players.length - resultData.correctAnswers + 1;
      }
    }
    questionNumber++;
  }
}
