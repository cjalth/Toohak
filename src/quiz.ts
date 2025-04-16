import {
  getData,
  setData,
  Quiz,
  Question,
  Answer,
  QuestionBody,
  AnswerBody,
  actions,
  sessionStates,
  QuizSession,
  FinalSessionResult,
  SessionResult
} from './dataStore';
import {
  quizIdCheck,
  quizUserIdCheck,
  quizNameCheck,
  quizQuestionCheck,
  quizAnswerCheck,
  quizSessionCheck,
  findUserByToken,
  quizQuestionIdCheck,
  getRandomColour,
  findUserByEmail,
  quizIdInTrashCheck400,
  quizIdInTrashCheck401,
  quizIdInTrashCheck403,
  actionIsValid,
  createNewTimer,
  clearTimer,
  findSessionById,
  quizThumbnailCheck,
  changePlayerStates,
  fixPlayerRanks,
} from './helperFunctions';
import HTTPError from 'http-errors';
import fs from 'fs';
import path from 'path';

/**
 * Permanently delete the trash array in the dataStore
 *
 * @param {number} token - Author's current token
 * @param {number} quizId - Array of current quizIds that are in the trash
 * ...
 *
 * @returns {object} - Empty Object
 */

function adminQuizTrashEmpty(
  token: string,
  quizIds: string
): { error?: string } {
  const parsedQuizIds = JSON.parse(quizIds);
  const data = getData();

  const quizIdCheckResult400 = quizIdInTrashCheck400(data, parsedQuizIds);
  if ('error' in quizIdCheckResult400) {
    throw HTTPError(400, quizIdCheckResult400);
  }

  const quizIdCheckResult401 = quizIdInTrashCheck401(data, token);
  if ('error' in quizIdCheckResult401) {
    throw HTTPError(401, quizIdCheckResult401);
  }

  const quizIdCheckResult403 = quizIdInTrashCheck403(data, parsedQuizIds, token);
  if ('error' in quizIdCheckResult403) {
    throw HTTPError(403, quizIdCheckResult403);
  }

  const userToken = findUserByToken(data.user, token);

  data.trash = data.trash.filter(
    (quiz) =>
      !(
        parsedQuizIds.includes(quiz.quizId) &&
        quiz.authUserId === userToken.userId
      )
  );

  setData(data);

  return {};
}

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} token - Author's current Session ID
 * ...
 *
 * @returns {quizzes: {quizId: number}} - Quiz ID
 * @returns {quizzes: {name: string}} - Quiz name
 */

function adminQuizList(token: string): {
  quizzes?: { quizId: number; name: string }[];
  error?: string;
} {
  // retrieve data
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  // filter through database to find quizzes that are attached to authUserId
  // return only the quizId and name
  const user = findUserByToken(database.user, token);

  const userQuizzes = database.quizzes
    .filter((quiz) => quiz.authUserId === user.userId)
    .map(({ quizId, name }) => ({ quizId, name }));

  return {
    quizzes: userQuizzes,
  };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {number} token - Author's current Session ID
 * @param {string} name - Quiz name
 * @param {string} description - Description of the quiz
 * ...
 *
 * @returns {quizId: number} - Quiz ID
 */

function adminQuizCreate(
  token: string,
  name: string,
  description: string
): { quizId?: number; error?: string } {
  // retrieve data
  const database = getData();

  // check if token provided is valid
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  // check if name provided is valid
  const nameCheckResult = quizNameCheck(database, name, token);
  if ('error' in nameCheckResult) {
    throw HTTPError(400, nameCheckResult);
  }

  if (description.length > 100) {
    throw HTTPError(400, 'Quiz description too long');
  }

  const user = findUserByToken(database.user, token);
  // if passed all errors, create and initialise the quiz
  const time = Math.floor(Date.now() / 1000);
  const quiz: Quiz = {
    quizId: database.quizIdCounter++,
    authUserId: user.userId,
    name: name,
    timeCreated: time,
    timeLastEdited: time,
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: '',
    sessions: [],
  };

  // push quiz to database
  database.quizzes.push(quiz);
  setData(database);

  // return quizId
  return {
    quizId: quiz.quizId,
  };
}

/**
 * Given a particular quiz, remove the quiz and send it to trash.
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * ...
 *
 * @returns {object} - Empty object
 */

function adminQuizRemove(token: string, quizId: number): { error?: string } {
  // retrieve data
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const user = findUserByToken(database.user, token);

  // move quiz to trash
  const quiz = database.quizzes.find(
    (quiz) => quiz.quizId === quizId && quiz.authUserId === user.userId
  );
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  database.trash.push(quiz);

  // remove quiz from quizzes
  const quizIndex = database.quizzes.findIndex(
    (quiz) => quiz.quizId === quizId && quiz.authUserId === user.userId
  );
  database.quizzes.splice(quizIndex, 1);
  setData(database);

  // return empty object
  return {};
}

/**
 * Gets all of the relevant information about the current quiz.
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * ...
 *
 * @returns {quizId: number} - Quiz ID
 * @returns {name: string} - Quiz name
 * @returns {timeCreated: number} - Time the quiz was created
 * @returns {timeLastEdited: number} - Time the quiz was last edited
 * @returns {description: string} - Description of the quiz
 * @returns {numQuestions: number} - Number of questions in the quiz
 * @returns {questions: array} - A list of the quiz's questions & answers
 * @returns {duration: number} - how long the quiz runs for
 * @returns {thumbnailUrl: string} - URL of the thumbnail of the quiz
 */

function adminQuizInfo(
  token: string,
  quizId: number
): {
  quizId?: number;
  name?: string;
  timeCreated?: number;
  timeLastEdited?: number;
  description?: string;
  numQuestions?: number;
  questions?: Question[];
  duration?: number;
  thumbnailUrl?: string;
  error?: string;
} {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);

  if ('error' in quizIdCheckResult) {
    const quizTrash = database.trash.find(
      (quizTrash) => quizTrash.quizId === quizId
    );

    if (!quizTrash) {
      throw HTTPError(403, "QuizId doesn't exist");
    }

    const user = findUserByToken(database.user, token);

    const quizBelongs = database.trash.find(
      (trash) => trash.quizId === quizId && trash.authUserId === user.userId
    );

    if (!quizBelongs) {
      throw HTTPError(403, 'Quiz is not owned by this user');
    }
  }

  let quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz) {
    quiz = database.trash.find((quiz) => quiz.quizId === quizId);
  }

  const questionsList = quiz.questions.map((question) => {
    const answersList = question.answers.map((answers) => ({
      answerId: answers.answerId,
      answer: answers.answer,
      colour: answers.colour,
      correct: answers.correct,
    }));
    return {
      questionId: question.questionId,
      question: question.question,
      duration: question.duration,
      thumbnailUrl: question.thumbnailUrl,
      points: question.points,
      answers: answersList,
    };
  });

  // Returns the information of the quiz
  return {
    quizId: quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: questionsList,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl,
  };
}

/**
 * Updates the name of the relevant quiz.
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * @param {string} name - Name of the quiz
 * ...
 *
 * @returns {object} - Empty object
 */

function adminQuizNameUpdate(
  token: string,
  quizId: number,
  name: string
): { error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const nameCheckResult = quizNameCheck(database, name, token);
  if ('error' in nameCheckResult) {
    throw HTTPError(400, nameCheckResult);
  }

  // Sets quiz's name to a new name
  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  quiz.name = name;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);

  return {};
}

function adminQuizRestore(token: string, quizId: number): { error?: string } {
  const database = getData();

  const user = findUserByToken(database.user, token);
  if (user === undefined) {
    throw HTTPError(401, "Session doesn't exist");
  }

  const session = user.sessions.find((session) => session.token === token);

  if (!session.valid) {
    throw HTTPError(401, 'User is logged out');
  }

  const quiz = database.trash.find((quiz) => quiz.quizId === quizId);
  const quizInQuiz = database.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz && quizInQuiz) {
    throw HTTPError(400, 'Quiz not in trash');
  }

  const quizBelongs = database.trash.find(
    (trash) => trash.quizId === quizId && trash.authUserId === user.userId
  );
  if (!quizBelongs) {
    throw HTTPError(403, 'Quiz is not owned by this user');
  }

  const nameInUse = database.quizzes.find(
    (quizzes) => quizzes.name === quiz.name
  );
  if (nameInUse) {
    throw HTTPError(
      400,
      'Quiz name of the restored quiz is already used by another active quiz'
    );
  }

  // move quiz to quizzes
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  database.quizzes.push(quiz);

  // remove quiz from trash
  const quizIndex = database.trash.findIndex((quiz) => quiz.quizId === quizId);
  database.trash.splice(quizIndex, 1);
  setData(database);

  return {};
}

/**
 * Updates the description of the relevant quiz.
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * @param {string} description - Description of the quiz
 * ...
 *
 * @returns {object} - empty object
 */

function adminQuizDescriptionUpdate(
  token: string,
  quizId: number,
  description: string
): { error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  if (description.length > 100) {
    throw HTTPError(400, 'Quiz description is too long');
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  quiz.description = description;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);

  return {};
}

/**
 * Given basic details about a new question, create one for a given quiz.
 *
 * @param {number} token - Author's current Session ID
 * @param {QuestionBody} questionBody - Information for the question, including answers
 * @param {number} quizId - Quiz ID
 * ...
 *
 * @returns {questionId: number} - Question ID
 */

function adminQuizCreateQuestion(
  token: string,
  questionBody: QuestionBody,
  quizId: number
): { questionId?: number; error?: string } {
  const database = getData();

  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, userIdCheckResult);
  }

  const quizQuestionCheckResult = quizQuestionCheck(database, questionBody, quizId);
  if ('error' in quizQuestionCheckResult) {
    throw HTTPError(400, quizQuestionCheckResult);
  }

  const quizAnswerCheckResult = quizAnswerCheck(questionBody);
  if ('error' in quizAnswerCheckResult) {
    throw HTTPError(400, quizAnswerCheckResult);
  }

  if (questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'ThumbnailUrl can\'t be an empty string');
  }

  const thumbnailCheckResult = quizThumbnailCheck(questionBody.thumbnailUrl);
  if ('error' in thumbnailCheckResult) {
    throw HTTPError(400, thumbnailCheckResult);
  }

  const quizIndex = database.quizzes.findIndex(
    (quiz) => quiz.quizId === quizId
  );
  const newQuestion: Question = {
    questionId: database.quizIdCounter++,
    question: questionBody.question,
    duration: questionBody.duration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: [],
  };

  questionBody.answers.forEach((answerBody: AnswerBody) => {
    const newAnswer: Answer = {
      answerId: database.answerIdCounter++,
      answer: answerBody.answer,
      colour: getRandomColour(),
      correct: answerBody.correct,
    };
    newQuestion.answers.push(newAnswer);
  });

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  quiz.numQuestions++;
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  // push quiz to database
  database.quizzes[quizIndex].questions.push(newQuestion);
  setData(database);

  return { questionId: newQuestion.questionId };
}

/**
 * Removes a question from a relevant quiz.
 *
 * @param {number} token - ID relating to a user's session
 * @param {number} quizId - Quiz ID
 * @param {number} questionId - Question ID
 * ...
 *
 * @returns {object} - empty object
 */

function adminQuizRemoveQuestion(
  token: string,
  quizId: number,
  questionId: number
): { error?: string } {
  // retrieve data
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const questionIdCheckResult = quizQuestionIdCheck(database, quizId, questionId);
  if ('error' in questionIdCheckResult) {
    throw HTTPError(400, questionIdCheckResult);
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);

  const quizEnd = quiz.sessions.find((session) => session.state !== sessionStates.END);
  if (quizEnd) {
    throw HTTPError(400, 'A quiz session isn\'t in END state');
  }

  // edit timeLastEdited for quiz
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.numQuestions -= 1;

  const question = quiz.questions.find(
    (question) => question.questionId === questionId
  );
  quiz.duration -= question.duration;

  // remove question from quiz
  const questionIndex = quiz.questions.findIndex(
    (question) => question.questionId === questionId
  );
  quiz.questions.splice(questionIndex, 1);
  setData(database);

  // return empty object
  return {};
}

/**
 * Copies a question from a relevant quiz.
 *
 * @param {number} token - ID relating to a user's session
 * @param {number} quizId - Quiz ID
 * @param {number} questionId - Question ID
 * ...
 *
 * @returns {newQuestionId: number} - New Question ID
 */
function adminQuizDuplicateQuestion(
  token: string,
  quizId: number,
  questionId: number
): { newQuestionId?: number; error?: string } {
  const database = getData();

  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  const question = quiz.questions.find(
    (question) => question.questionId === questionId
  );
  if (!question) {
    throw HTTPError(400, "QuestionId doesn't exist");
  }

  const newQuestion: Question = {
    questionId: database.questionIdCounter++,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: question.answers,
  };

  quiz.duration += question.duration;
  quiz.numQuestions++;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  quiz.questions.push(newQuestion);
  setData(database);

  return { newQuestionId: newQuestion.questionId };
}

/**
 * Provide a list of all quizzes that are in trash
 *
 * @param {number} authUserId - Author's user ID
 * ...
 *
 * @returns {quizzes: {quizId: number}} - Quiz ID
 * @returns {quizzes: {name: string}} - Quiz name
 */

function adminQuizTrash(token: string): {
  quizzes?: { quizId: number; name: string }[];
  error?: string;
} {
  // retrieve data
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const userToken = findUserByToken(database.user, token);

  // return only the quizId and name
  const trashQuizzes = database.trash
    .filter((quiz) => quiz.authUserId === userToken.userId) // This line was added to filter quizzes by authUserId
    .map(({ quizId, name }) => ({
      quizId,
      name,
    }));

  return {
    quizzes: trashQuizzes,
  };
}

/**
 * Transfers the ownership of a quiz to a different
 * user based on their email.
 *
 * @param {number} authUserId - ID of user's session
 * @param {string} userEmail - Target user's email
 * @param {number} quizId - Quiz ID
 * ...
 *
 * @returns {object} - empty object
 */

function adminQuizTransfer(
  token: string,
  userEmail: string,
  quizId: number
): { error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const targetUser = findUserByEmail(database.user, userEmail);
  if (!targetUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }

  const user = findUserByToken(database.user, token);

  if (user.email === userEmail) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);

  const duplicateQuiz = database.quizzes.find(
    (quizzes) =>
      quizzes.name === quiz.name && quizzes.authUserId === targetUser.userId
  );
  if (duplicateQuiz) {
    throw HTTPError(400, 'Name of quiz with Quiz ID is used by target user ');
  }

  const quizEnd = quiz.sessions.find((session) => session.state !== sessionStates.END);
  if (quizEnd) {
    throw HTTPError(400, 'A quiz session isn\'t in END state');
  }

  quiz.authUserId = targetUser.userId;
  setData(database);

  return {};
}

/**
 * Moves a specified question's position in a quiz.
 *
 * @param {number} token - ID of user's session
 * @param {number} quizId - Quiz ID
 * @param {number} questionId - Question ID
 * @param {number} newPosition - new Position in Quiz
 * ...
 *
 * @returns {object} - empty object
 */

function adminQuizMoveQuestion(
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
): { error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  const targetQuestion = quiz.questions.find(
    (question) => question.questionId === questionId
  );
  const questionIndex = quiz.questions.findIndex(
    (question) => targetQuestion === question
  );

  const questionIdCheckResult = quizQuestionIdCheck(database, quizId, questionId);
  if ('error' in questionIdCheckResult) {
    throw HTTPError(400, questionIdCheckResult);
  }

  if (newPosition < 0 || newPosition > quiz.numQuestions - 1) {
    throw HTTPError(400, 'Invalid position');
  }

  if (newPosition === questionIndex) {
    throw HTTPError(400, 'New position is position of current question');
  }

  // Remove the element at the current position
  const removedElement = quiz.questions.splice(questionIndex, 1)[0];

  // Insert the removed element at the new position
  quiz.questions.splice(newPosition, 0, removedElement);

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);

  return {};
}

/**
 * Updates the relevant details of a particular
 * question within a quiz.
 *
 * @param {number} token - ID of user's session
 * @param {QuestionBody} questionBody - Question's Info (including answers)
 * @param {number} quizId - Quiz ID
 * @param {number} questionId - Question ID
 * ...
 *
 * @returns {object} - empty object
 */
function adminQuizUpdateQuestion(
  token: string,
  questionBody: QuestionBody,
  quizId: number,
  questionId: number
): { error?: string } {
  const database = getData();

  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }
  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const questionIdCheckResult = quizQuestionIdCheck(database, quizId, questionId);
  if ('error' in questionIdCheckResult) {
    throw HTTPError(400, questionIdCheckResult);
  }

  const quizQuestionCheckResult = quizQuestionCheck(database, questionBody, quizId);
  if ('error' in quizQuestionCheckResult) {
    throw HTTPError(400, quizQuestionCheckResult);
  }

  const quizAnswerCheckResult = quizAnswerCheck(questionBody);
  if ('error' in quizAnswerCheckResult) {
    throw HTTPError(400, quizAnswerCheckResult);
  }

  if (questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'ThumbnailUrl can\'t be an empty string');
  }

  const thumbnailCheckResult = quizThumbnailCheck(questionBody.thumbnailUrl);
  if ('error' in thumbnailCheckResult) {
    throw HTTPError(400, thumbnailCheckResult);
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  const question = quiz.questions.find(
    (question) => question.questionId === questionId
  );

  quiz.duration = quiz.duration - question.duration + questionBody.duration;
  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.thumbnailUrl = questionBody.thumbnailUrl;
  question.points = questionBody.points;

  questionBody.answers.forEach((newAnswer, newAnswerIndex) => {
    const answerIndex = question.answers.findIndex(
      (answer, index) => index === newAnswerIndex
    );
    question.answers[answerIndex].answer = newAnswer.answer;
    question.answers[answerIndex].correct = newAnswer.correct;
  });

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(database);

  return {};
}

/**
 * Starts a session for a given quiz.
 *
 * @param {string} token - ID of a user's session
 * @param {number} quizId - Quiz ID
 * @param {number} autoStartNum - Number of people required to autostart the quiz
 *
 * @returns {sesionId: sessionId} - ID of quiz session
 */
function adminQuizSessionStart(
  token: string,
  quizId: number,
  autoStartNum: number
): { sessionId?: number; error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  const quizInTrash = database.trash.find((quiz) => quiz.quizId === quizId);
  if ('error' in quizIdCheckResult) {
    if (quizInTrash) {
      throw HTTPError(400, 'Quiz is in trash');
    } else {
      throw HTTPError(403, quizIdCheckResult);
    }
  }

  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  if (quiz.numQuestions === 0) {
    throw HTTPError(400, 'Quiz has no questions');
  }

  if (!(autoStartNum >= 0 && autoStartNum <= 50)) {
    throw HTTPError(
      400,
      'AutoStartNum cannot be greater than 50 or less than 0'
    );
  }

  let count = 0;
  for (const session of quiz.sessions) {
    if (session.state !== sessionStates.END) {
      count++;
    }
  }
  if (count >= 10) {
    throw HTTPError(400, 'Too many active quiz sessions');
  }

  // initialise quiz session to LOBBY state
  const session: QuizSession = {
    sessionId: database.quizSessionIdCounter++,
    state: 'LOBBY',
    players: [],
    atQuestion: quiz.questions[0].questionId,
    messages: [],
    results: [],
    resultData: [],
    finalResults: {
      usersRankedByScore: [],
      questionResults: []
    },
    questionOpenTime: 0,
    autoStartNum: autoStartNum,
  };

  quiz.sessions.push(session);
  setData(database);

  return { sessionId: session.sessionId };
}

/**
 * Updates given session of a given quiz through a given action.
 *
 * @param {string} token - Token relating to a user's session
 * @param {number} quizId - Quiz ID
 * @param {number} sessionId - Session ID
 * @param {string} action - Action used to change quiz session states
 * ...
 * @returns {object} - empty object
 */
function adminQuizSessionUpdate(token: string, quizId: number, sessionId: number, action: string): { error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const sessionIdCheckResult = findSessionById(database.quizzes, sessionId);
  if (!sessionIdCheckResult) {
    throw HTTPError(400, 'Invalid sessionId');
  }

  const quiz = database.quizzes.find(quiz => quiz.quizId === quizId);
  const session = quiz.sessions.find(session => session.sessionId === sessionId);

  const actionIsValidResult = actionIsValid(database, action, quizId, sessionId);
  if ('error' in actionIsValidResult) {
    throw HTTPError(400, actionIsValidResult);
  }

  // changing session state depending on given action
  const currQuestion = quiz.questions.find(question => question.questionId === session.atQuestion);
  let questionIndex = quiz.questions.findIndex(question => question.questionId === session.atQuestion);
  if (action === actions.END) {
    clearTimer(currQuestion.questionId);
    session.state = sessionStates.END;
    changePlayerStates(session.players, sessionStates.END);
  } else if (action === actions.NEXT_QUESTION) {
    // move to next question
    if (questionIndex === quiz.questions.length - 1 && session.state !== sessionStates.LOBBY) {
      throw HTTPError(400, 'You are at the last question');
    }

    if (session.state !== sessionStates.LOBBY) {
      session.atQuestion = quiz.questions[++questionIndex].questionId;
    }
    for (const player of session.players) {
      player.atQuestion++;
      player.state = sessionStates.QUESTION_COUNTDOWN;
    }
    session.state = sessionStates.QUESTION_COUNTDOWN;

    // countdown 3 seconds unless SKIP_COUNTDOWN action is given
    const countdownTime = 3;
    createNewTimer(sessionId, quizId, currQuestion.questionId, sessionStates.QUESTION_OPEN, countdownTime * 1000);
  } else if (action === actions.SKIP_COUNTDOWN) {
    // clear 3 second countdown
    clearTimer(currQuestion.questionId);
    session.state = sessionStates.QUESTION_OPEN;
    session.questionOpenTime = Math.floor(Date.now() / 1000);
    changePlayerStates(session.players, sessionStates.QUESTION_OPEN);

    // make countdown according to duration of current question
    createNewTimer(sessionId, quizId, currQuestion.questionId, sessionStates.QUESTION_CLOSE, currQuestion.duration * 1000);
  } else if (action === actions.GO_TO_ANSWER) {
    clearTimer(currQuestion.questionId);
    session.state = sessionStates.ANSWER_SHOW;
    changePlayerStates(session.players, sessionStates.ANSWER_SHOW);
  } else {
    session.state = sessionStates.FINAL_RESULTS;
    changePlayerStates(session.players, sessionStates.FINAL_RESULTS);
  }
  setData(database);
  return {};
}

/**
 * Lists active and inactive sessions for a specific quiz.
 *
 * @param token - Token of the user making the request.
 * @param quizId - The ID of the quiz for which to retrieve sessions.
 * @returns An object containing arrays of active and inactive session IDs.
 * @throws HTTPError if authentication fails or quiz is not found.
 */
function adminQuizSessionList(token: string, quizId: number) {
  const database = getData();

  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const quiz = database.quizzes.find(quiz => quiz.quizId === quizId);

  const activeSessions: number[] = [];
  const inactiveSessions: number[] = [];

  quiz.sessions.forEach(session => {
    if (session.state !== 'END') {
      activeSessions.push(session.sessionId);
    } else {
      inactiveSessions.push(session.sessionId);
    }
  });

  // Sort the session IDs in ascending order
  activeSessions.sort((a, b) => a - b);
  inactiveSessions.sort((a, b) => a - b);

  return {
    activeSessions,
    inactiveSessions
  };
}
/**
 * Updates the thumbnail of a relevant quiz.
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * @param {string} imgUrl - URL of thumbnail image
 * ...
 *
 * @returns {object} - Empty object
*/

function adminQuizUpdateThumbnail(
  token: string,
  quizId: number,
  imgUrl: string
): { error?: string } {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const thumbnailCheckResult = quizThumbnailCheck(imgUrl);
  if ('error' in thumbnailCheckResult) {
    throw HTTPError(400, thumbnailCheckResult);
  }

  // Sets quiz's thumbnail to a new thumbnail
  const quiz = database.quizzes.find((quiz) => quiz.quizId === quizId);
  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);

  return {};
}

/**
 * Gets the status of a particular quiz session and prints it
 *
 * @param {string} token - Token relating to a user's session
 * @param {number} quizId - Quiz ID
 * @param {number} sessionId - Session ID
 * ...
 * @returns {state: string} - The state of the session
 * @returns {atQuestion: number} - The question the session is up to
 * @returns {players: array} - An array of the players in the session
 * @returns {metadata: {quizId: number}} - Quiz ID
 * @returns {metadata: {name: string}} - Quiz name
 * @returns {metadata: {timeCreated: number}} - Time the quiz was created
 * @returns {metadata: {timeLastEdited: number}} - Time the quiz was last edited
 * @returns {metadata: {description: string}} - Description of the quiz
 * @returns {metadata: {numQuestions: number}} - Number of questions in the quiz
 * @returns {metadata: {questions: array}} - A list of the quiz's questions & answers
 * @returns {metadata: {duration: number}} - how long the quiz runs for
 * @returns {metadata: {thumbnailUrl: string}} - URL of the thumbnail of the quiz
 */
function adminQuizSessionStatus(token: string, quizId: number, sessionId: number): {
  state?: string;
  atQuestion?: number;
  players?: string[];
  metadata?: {
    quizId?: number;
    name?: string;
    timeCreated?: number;
    timeLastEdited?: number;
    description?: string;
    numQuestions?: number;
    questions?: Question[];
    duration?: number;
    thumbnailUrl?: string;
  }
  error?: string;
} {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const sessionIdCheckResult = quizSessionCheck(database, quizId, sessionId);
  if ('error' in sessionIdCheckResult) {
    throw HTTPError(400, sessionIdCheckResult);
  }

  const quiz = database.quizzes.find(quiz => quiz.quizId === quizId);
  const session = quiz.sessions.find(session => session.sessionId === sessionId);

  const playersList = session.players.map((players) => (players.playerName));

  const metadata = adminQuizInfo(token, quizId);

  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: playersList,
    metadata: metadata,
  };
}

/**
 * Get the final results for all players for a completed quiz session
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * @param {number} sessionId - Session ID
 * ...
 * @returns {usersRankedByScore} - array of all users ranked by score
 * @returns {questionResults} - object results of all questions
 */
function quizSessionResults(token: string, quizId: number, sessionId: number): FinalSessionResult {
  const database = getData();

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const sessionIdCheckResult = findSessionById(database.quizzes, sessionId);
  if (!sessionIdCheckResult) {
    throw HTTPError(400, 'Invalid sessionId');
  }

  const quiz = database.quizzes.find(quiz => quiz.quizId === quizId);
  const session = quiz.sessions.find(session => session.sessionId === sessionId);

  if (session.state !== sessionStates.FINAL_RESULTS) {
    throw HTTPError(400, 'Session must be in FINAL_RESULTS state');
  }

  setData(database);

  // Calculate users' scores
  const usersScores: { [name: string]: number } = {};
  session.players.forEach(player => {
    usersScores[player.playerName] = player.score;
  });

  // Calculate question results
  const questionResults: SessionResult[] = [];
  session.resultData.forEach(result => {
    const playersCorrectList = result.playersCorrectList;
    const percentCorrect = Math.round(playersCorrectList.length / session.players.length * 100);
    const averageAnswerTime = Math.round(result.answerTimes.reduce((acc, val) => acc + val, 0) / result.answerTimes.length);

    questionResults.push({
      questionId: result.questionId,
      playersCorrectList,
      averageAnswerTime,
      percentCorrect,
    });
  });

  // Rank users by score
  const usersRankedByScore = Object.entries(usersScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([name, score]) => ({ name, score }));

  return { usersRankedByScore, questionResults };
}

/**
 * Get the final results for all players for a completed quiz session in CSV format
 *
 * @param {number} token - Author's current Session ID
 * @param {number} quizId - Quiz ID
 * @param {number} sessionId - Session ID
 * ...
 *
 * @returns {string} - url of CSV file
 */
function adminQuizSessionResultsCSV(token: string, quizId: number, sessionId: number): { url?: string; error?: string } {
  const database = getData();
  const port = process.env.PORT || 49099;

  // error checking
  const userIdCheckResult = quizUserIdCheck(database, token);
  if ('error' in userIdCheckResult) {
    throw HTTPError(401, userIdCheckResult);
  }

  const quizIdCheckResult = quizIdCheck(database, quizId, token);
  if ('error' in quizIdCheckResult) {
    throw HTTPError(403, quizIdCheckResult);
  }

  const sessionIdCheckResult = quizSessionCheck(database, quizId, sessionId);
  if ('error' in sessionIdCheckResult) {
    throw HTTPError(400, sessionIdCheckResult);
  }

  // fix player ranks
  fixPlayerRanks(sessionId, database);

  // generate csv
  const session = findSessionById(database.quizzes, sessionId);
  const sessionResults = quizSessionResults(token, quizId, sessionId);
  sessionResults.usersRankedByScore.sort((a, b) => a.name.localeCompare(b.name));

  // generate header for question scores and ranks
  let csvHeader = 'Player';
  sessionResults.questionResults.forEach((question, index) => {
    index++;
    csvHeader += `,question${index}score,question${index}rank`;
  });
  csvHeader += '\n';

  let csvBody = '';
  sessionResults.usersRankedByScore.forEach(player => {
    csvBody += `${player.name}`;
    sessionResults.questionResults.forEach((question, index) => {
      const currPlayer = session.players.find((targetPlayer) => targetPlayer.playerName === player.name);
      const score = question.playersCorrectList.includes(player.name) ? currPlayer.questionScores[index] : 0;
      const rank = currPlayer.questionRanks[index];
      csvBody += `,${score},${rank}`;
      index++;
    });
    csvBody += '\n';
  });

  const csv = csvHeader + csvBody;

  const csvFileName = `${sessionId}.csv`;
  const dir = 'src/csv_results';
  const filePath = path.join(dir, csvFileName);
  fs.writeFileSync(filePath, csv);

  const csvUrl = `http://localhost:${port}/csv_results/${csvFileName}.csv`;

  return { url: csvUrl };
}

export {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTrash,
  adminQuizRemoveQuestion,
  adminQuizCreateQuestion,
  adminQuizDuplicateQuestion,
  adminQuizMoveQuestion,
  adminQuizTransfer,
  adminQuizRestore,
  adminQuizUpdateQuestion,
  adminQuizTrashEmpty,
  adminQuizSessionStart,
  adminQuizSessionUpdate,
  adminQuizSessionList,
  adminQuizUpdateThumbnail,
  quizSessionResults,
  adminQuizSessionStatus,
  adminQuizSessionResultsCSV,
};
