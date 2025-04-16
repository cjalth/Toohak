import fs from 'fs';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
interface Data {
  user: User[];
  quizzes: Quiz[];
  trash: Quiz[];
  quizIdCounter: number;
  authUserIdCounter: number;
  questionIdCounter: number;
  answerIdCounter: number;
  playerIdCounter: number;
  sessionIdCounter: number;
  quizSessionIdCounter: number;
}

interface Session {
  token: string;
  valid: boolean;
}

interface Message {
  message: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

interface SessionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

interface SessionResultData {
  questionId: number;
  playersCorrectList: string[];
  answerTimes: number[];
  correctAnswers: number;
}

interface FinalSessionResult {
  usersRankedByScore: { name: string; score: number; }[];
  questionResults: SessionResult[];
}

interface QuizSession {
  sessionId: number;
  state: string;
  atQuestion: number;
  players: Player[];
  messages: Message[];
  results: SessionResult[];
  resultData: SessionResultData[];
  finalResults: FinalSessionResult;
  questionOpenTime: number;
  autoStartNum: number;
}

interface Player {
  playerId: number;
  playerName: string;
  state: string;
  score: number;
  questionScores: number[];
  questionRanks: number[];
  numQuestions: number;
  atQuestion: number;
}

interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  previousPasswords: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  numQuizMade: number;
  sessions: Session[];
}

interface Quiz {
  quizId: number;
  authUserId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl: string;
  sessions: QuizSession[];
}

interface Question {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: Answer[];
}

interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerBody[];
  thumbnailUrl: string;
}

interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

interface AnswerBody {
  answer: string;
  correct: boolean;
}

enum answerColours {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
  purple = 'purple',
  brown = 'brown',
  orange = 'orange',
}

enum sessionStates {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

enum actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
}

let data: Data = {
  user: [],
  quizzes: [],
  trash: [],
  quizIdCounter: 0,
  authUserIdCounter: 0,
  questionIdCounter: 0,
  answerIdCounter: 0,
  playerIdCounter: 0,
  sessionIdCounter: 0,
  quizSessionIdCounter: 0,
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): Data {
  const dataString = fs.readFileSync('./dataStore.json');
  data = JSON.parse(dataString.toString());
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data): void {
  fs.writeFileSync('./dataStore.json', JSON.stringify(newData));
  data = newData;
}

export {
  getData,
  setData,
  User,
  Quiz,
  Question,
  Answer,
  QuestionBody,
  AnswerBody,
  answerColours,
  sessionStates,
  actions,
  Session,
  Player,
  Data,
  QuizSession,
  SessionResult,
  SessionResultData,
  FinalSessionResult,
};
