import {
  getData,
  setData,
  Player,
  sessionStates,
  SessionResultData,
  SessionResult,
  FinalSessionResult,
} from './dataStore';

import {
  quizSessionIdCheck,
  findSessionById,
  getRandomName,
  findQuizBySessionId,
  findSessionByPlayerId,
  isPlayerIdValid,
  uniqueAnswers,
  validAnswerIds,
  playerIdCheck,
  createNewTimer,
} from './helperFunctions';
import HTTPError from 'http-errors';

/**
 * Allows a guest player to join a session
 *
 * @param {number} sessionId - sessionId of a running quiz
 * @param {string} name - Player's name
 * ...
 *
 * @returns {playerId: number} - player ID
 */
function playerJoin(
  sessionId: number,
  name: string
): { playerId?: number; error?: string } {
  // retrieve data
  const database = getData();

  const idCheckResult = quizSessionIdCheck(database, sessionId);
  if ('error' in idCheckResult) {
    throw HTTPError(400, idCheckResult);
  }

  const quizSession = findSessionById(database.quizzes, sessionId);

  if (quizSession.state !== sessionStates.LOBBY) {
    throw HTTPError(400, "Session isn't in LOBBY state");
  }

  const duplicate = quizSession.players.find(
    (player) => player.playerName === name
  );
  // check that name of player entered is unique
  if (duplicate) {
    throw HTTPError(400, "Name isn't unique");
  }

  let newName: string;
  if (name === '') {
    newName = getRandomName(quizSession);
  } else {
    newName = name;
  }

  const quiz = findQuizBySessionId(sessionId, database.quizzes);
  let playerState = sessionStates.LOBBY;
  let playerQuestion = 0;
  if (quizSession.players.length + 1 >= quizSession.autoStartNum) {
    quizSession.state = sessionStates.QUESTION_COUNTDOWN;
    playerState = sessionStates.QUESTION_COUNTDOWN;
    playerQuestion = 1;
    for (const sessionPlayers of quizSession.players) {
      sessionPlayers.state = sessionStates.QUESTION_COUNTDOWN;
      sessionPlayers.atQuestion = 1;
    }
    const countdownTime = 3;
    createNewTimer(sessionId, quiz.quizId, quiz.questions[0].questionId, sessionStates.QUESTION_OPEN, countdownTime * 1000);
  }

  const player: Player = {
    playerId: database.playerIdCounter++,
    playerName: newName,
    state: playerState,
    score: 0,
    questionScores: [],
    questionRanks: [],
    numQuestions: quiz.questions.length,
    atQuestion: playerQuestion,
  };

  // Push player to quizSession
  quizSession.players.push(player);
  setData(database);

  // Return playerId
  return {
    playerId: player.playerId,
  };
}

/**
 * Allows a player to submit an answer/answers to a given question
 *
 * @param {number[]} answerIds - Array of answerIds that the player submitted
 * @param {number} playerId - ID of player
 * @param {number} questionPos - Question number
 * ...
 *
 * @returns {object} - Empty object
 */
function playerAnswer(
  answerIds: number[],
  playerId: number,
  questionPos: number
) {
  // take time when player submits answer
  const answerTime = Math.floor(Date.now() / 1000);

  // retrieve data
  const database = getData();

  // error checks
  const player = isPlayerIdValid(playerId, database.quizzes);
  if (!player) {
    throw HTTPError(400, "Player ID doesn't exist");
  }

  const quizSession = findSessionByPlayerId(database, playerId);

  if (quizSession.state !== sessionStates.QUESTION_OPEN) {
    throw HTTPError(400, "Session isn't in QUESTION_OPEN state");
  }

  const quiz = findQuizBySessionId(quizSession.sessionId, database.quizzes);

  if (questionPos > quiz.numQuestions) {
    throw HTTPError(400, 'Invalid question position');
  }

  const question = quiz.questions[questionPos - 1];
  if ((question.questionId !== quizSession.atQuestion) ||
      questionPos !== player.atQuestion) {
    throw HTTPError(400, 'Session or Player is at wrong question');
  }

  const duplicateAnswersCheck = uniqueAnswers(answerIds);
  if ('error' in duplicateAnswersCheck) {
    throw HTTPError(400, 'Duplicate answerIds');
  }

  const validAnswersCheck = validAnswerIds(answerIds, question);
  if ('error' in validAnswersCheck) {
    throw HTTPError(400, 'Invalid answerId');
  }

  if (answerIds.length === 0) {
    throw HTTPError(400, 'No answer submitted');
  }

  // check if player submitted correct answers
  let correctPlayerName: string;
  let correctPlayerCount = 0;
  const correctAnswers = question.answers
    .filter((answer) => answer.correct)
    .map((answer) => answer.answerId);
  if (answerIds.every((answerId) => correctAnswers.includes(answerId))) {
    correctPlayerName = player.playerName;
    correctPlayerCount = 1;
  }

  const playerAnswerTime = answerTime - quizSession.questionOpenTime;

  // check if data for question results already exists
  const resultData = quizSession.resultData.find(resultData => resultData.questionId === question.questionId);
  let results: SessionResultData;
  if (correctPlayerName) {
    if (!resultData) {
      // if not, create it
      results = {
        questionId: question.questionId,
        playersCorrectList: [],
        answerTimes: [],
        correctAnswers: correctPlayerCount
      };
      results.playersCorrectList.push(correctPlayerName);
      results.answerTimes.push(playerAnswerTime);
      quizSession.resultData.push(results);
      const score = question.points;
      player.score += score;
      player.questionScores.push(score);
      player.questionRanks.push(1);
    } else {
      // if so, push to data
      resultData.playersCorrectList.push(correctPlayerName);
      resultData.answerTimes.push(playerAnswerTime);
      resultData.correctAnswers++;
      const scalingFactor = 1 / resultData.correctAnswers;
      const score = question.points * scalingFactor;
      player.score += score;
      player.questionScores.push(score);
      player.questionRanks.push(resultData.correctAnswers);
    }
  } else {
    if (!resultData) {
      // if not, create it
      results = {
        questionId: question.questionId,
        playersCorrectList: [],
        answerTimes: [],
        correctAnswers: correctPlayerCount
      };
      results.answerTimes.push(playerAnswerTime);
      quizSession.resultData.push(results);
    } else {
      // if so, push to data
      resultData.answerTimes.push(playerAnswerTime);
    }
    player.questionScores.push(0);
    player.questionRanks.push(quizSession.players.length);
  }

  setData(database);
  return {};
}

/**
 * Given the playerId, shows the status of the guest player in the session.
 *
 * @param {number} playerId - playerId of a player in a quiz's session
 * ...
 *
 * @returns {state: string} - State of player
 * @returns {numQuestions: number} - Number of questions done by player
 * @returns {atQuestion: number} - The question player is at
 */

function playerStatusInfo(playerId: number): {
  state?: string;
  numQuestions?: number;
  atQuestion?: number;
} {
  // retrieve data
  const database = getData();

  const playerCheckResult = playerIdCheck(database, playerId);
  if ('error' in playerCheckResult) {
    throw HTTPError(400, playerCheckResult);
  }

  const player: Player | undefined = database.quizzes
    .flatMap((quiz) => quiz.sessions)
    .flatMap((session) => session.players)
    .find((player) => player.playerId === playerId);

  return {
    state: player.state,
    numQuestions: player.numQuestions,
    atQuestion: player.atQuestion,
  };
}

/**
 * Sends a chat message in a session.
 *
 * @param {number} playerId - ID of the player sending the message
 * @param {string} message - The message content
 * @returns {object} - Confirmation of message sent or error
 */
function playerChatSend(playerId: number, message: string): { error?: string } {
  if (message.length < 1 || message.length > 100) {
    throw HTTPError(400, 'Message must be between 1 and 100 characters');
  }

  const database = getData();

  const playerCheckResult = playerIdCheck(database, playerId);
  if ('error' in playerCheckResult) {
    throw HTTPError(400, playerCheckResult);
  }

  const session = findSessionByPlayerId(database, playerId);

  const player: Player | undefined = database.quizzes
    .flatMap((quiz) => quiz.sessions)
    .flatMap((session) => session.players)
    .find((player) => player.playerId === playerId);

  const newMessage = {
    message: message,
    playerId: player.playerId,
    playerName: player.playerName,
    timeSent: Math.floor(Date.now() / 1000),
  };

  session.messages.push(newMessage);
  setData(database);

  return {};
}

/**
 * Views the chats of the given player in a session for the quiz.
 *
 * @param {number} playerId - ID of the player sending the message
 * @returns {messages: object} - Information of the player's message
 */
function playerChatView(playerId: number): { messages: {
  message: string,
  playerId: number,
  playerName: string,
  timeSent: number,}[];
  error?: string } {
  const database = getData();

  const playerCheckResult = playerIdCheck(database, playerId);
  if ('error' in playerCheckResult) {
    throw HTTPError(400, playerCheckResult);
  }

  const session = findSessionByPlayerId(database, playerId);

  const messages = session.messages.map((message) => ({
    message: message.message,
    playerId: message.playerId,
    playerName: message.playerName,
    timeSent: message.timeSent,
  }));

  return { messages };
}

/**
 * Get the information about a question that the guest player is on.
 *
 * @param {number} playerId - playerId of a player in a quiz's session
 * @param {number} questionPosition - position of the question starting from 1
 * ...
 *
 * @returns {questionId: number} - id of the question that the player is on
 * @returns {playersCorrectList: string} - List of players who got the answer correct
 * @returns {averageAnswerTime: number} - player's average answer time
 * @returns {percentCorrect: string} - how many questions player got correct
 *
 */

function questionResults(
  playerId: number,
  questionPosition: number
): {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentCorrect: number
} {
  const database = getData();

  // error checks
  const player = isPlayerIdValid(playerId, database.quizzes);
  if (!player) {
    throw HTTPError(400, 'Player ID doesn\'t exist');
  }

  const quizSession = findSessionByPlayerId(database, playerId);
  const quiz = findQuizBySessionId(quizSession.sessionId, database.quizzes);
  const question = quiz.questions[questionPosition - 1];

  // If question position is not valid for the session this player is in
  if (questionPosition > quiz.numQuestions || questionPosition < 1) {
    throw HTTPError(400, 'invalid question position');
  }

  if (quizSession.state !== sessionStates.ANSWER_SHOW) {
    throw HTTPError(400, 'Session must be in ANSWER_SHOW state');
  }

  if (question.questionId !== quizSession.atQuestion) {
    throw HTTPError(400, 'Session at wrong question');
  }

  const result = quizSession.resultData.find(resultData => resultData.questionId === question.questionId);
  let sum = 0;
  for (const time of result.answerTimes) {
    sum += time;
  }
  const avgAT = Math.round(sum / result.answerTimes.length);
  const avgPC = Math.round(result.correctAnswers / quizSession.players.length * 100);

  const newResult: SessionResult = {
    questionId: result.questionId,
    playersCorrectList: result.playersCorrectList,
    averageAnswerTime: avgAT,
    percentCorrect: avgPC
  };
  quizSession.results.push(newResult);
  setData(database);

  return newResult;
}

/**
 * Get the information about a question that the guest player is on.
 *
 * @param {number} playerId - playerId of a player in a quiz's session
 * @param {number} questionPosition - position of the question starting from 1
 * ...
 *
 * @returns {questionId: number} - id of the question that the player is on
 * @returns {question: string} - name of teh question the player is on
 * @returns {duration: number} - duration of the question teh player is on
 * @returns {thumbnailUrl: string} - link to graphics
 * @returns {points: number} - number of points for teh question the player is on
 * @returns {answers: answers[]} - Answer array
 *
 */

function questionInfo(
  playerId: number,
  questionPosition: number
): {
  questionId: number,
  question: string,
  duration: number,
  thumbnailUrl: string,
  points: number,
  answers: [
      {
        answerId: number,
        answer: string,
        colour: string
      }
    ]
} {
  const database = getData();

  // error checks
  const player = isPlayerIdValid(playerId, database.quizzes);
  if (!player) {
    throw HTTPError(400, 'Player ID doesn\'t exist');
  }

  const quizSession = findSessionByPlayerId(database, playerId); // CHANGED THIS LINE
  const quiz = findQuizBySessionId(quizSession.sessionId, database.quizzes);

  // If question position is not valid for the session this player is in
  if (questionPosition > quiz.numQuestions || questionPosition < 1) {
    throw HTTPError(400, 'invalid question position');
  }

  const question = quiz.questions[questionPosition - 1];

  // If session is not currently on this question
  if (quizSession.atQuestion !== question.questionId) {
    throw HTTPError(400, 'session is not on this question');
  }

  // Session is in LOBBY, QUESTION_COUNTDOWN, or END state
  if (quizSession.state === sessionStates.LOBBY ||
  quizSession.state === sessionStates.QUESTION_COUNTDOWN ||
  quizSession.state === sessionStates.END) {
    throw HTTPError(400, 'Session is in the wrong state');
  }

  const answer = question.answers.find(answer => answer.correct === true);

  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: [
      {
        answerId: answer.answerId,
        answer: answer.answer,
        colour: answer.colour
      }
    ]
  };
}

/**
 * Get the final results for all players for a completed quiz session
 *
 * @param {number} playerId
 * ..
 *
 * @returns {results} - array of all users ranked by score and array of results from each question
 */
function playerSessionResults(playerId: number): FinalSessionResult {
  const database = getData();

  // error checking
  const playerIdCheck = isPlayerIdValid(playerId, database.quizzes);
  if (!playerIdCheck) {
    throw HTTPError(400, 'PlayerId is not valid');
  }

  const session = findSessionByPlayerId(database, playerId);
  if (session.state !== sessionStates.FINAL_RESULTS) {
    throw HTTPError(400, 'Quiz is not at FINAL_RESULTS state');
  }

  const results: FinalSessionResult = {
    usersRankedByScore: [],
    questionResults: [],
  };

  // collate results for each question of the quiz
  const quiz = findQuizBySessionId(session.sessionId, database.quizzes);
  for (const question of quiz.questions) {
    const result = session.resultData.find(resultData => resultData.questionId === question.questionId);
    let sum = 0;
    for (const time of result.answerTimes) {
      sum += time;
    }
    const avgAT = Math.round(sum / result.answerTimes.length);
    const avgPC = Math.round(result.correctAnswers / session.players.length * 100);

    const questionResult: SessionResult = {
      questionId: result.questionId,
      playersCorrectList: result.playersCorrectList,
      averageAnswerTime: avgAT,
      percentCorrect: avgPC
    };
    results.questionResults.push(questionResult);
  }

  // add and sort all players' scores
  for (const player of session.players) {
    results.usersRankedByScore.push({
      name: player.playerName,
      score: player.score,
    });
  }

  results.usersRankedByScore.sort((a, b) => b.score - a.score);

  return results;
}

export { playerJoin, playerAnswer, playerStatusInfo, playerChatSend, playerChatView, questionResults, questionInfo, playerSessionResults };
