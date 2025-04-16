import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import { clear } from './other';
import {
  adminQuizCreate,
  adminQuizRestore,
  adminQuizTrash,
  adminQuizList,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTransfer,
  adminQuizDuplicateQuestion,
  adminQuizCreateQuestion,
  adminQuizRemoveQuestion,
  adminQuizMoveQuestion,
  adminQuizUpdateQuestion,
  adminQuizTrashEmpty,
  adminQuizSessionStart,
  adminQuizSessionUpdate,
  adminQuizSessionList,
  adminQuizUpdateThumbnail,
  quizSessionResults,
  adminQuizSessionStatus,
  adminQuizSessionResultsCSV,
} from './quiz';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminAuthLogout,
} from './auth';
import {
  playerAnswer,
  playerJoin,
  playerStatusInfo,
  questionResults,
  playerChatSend,
  playerChatView,
  questionInfo,
  playerSessionResults
} from './player';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use(
  '/docs',
  sui.serve,
  sui.setup(YAML.parse(file), {
    swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' },
  })
);

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// ================================ OTHER.TS ===============================
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
});

// ================================ AUTH.TS ===============================
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(result);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  return res.json(result);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);
  return res.json(result);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  return res.json(result);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPass, newPass } = req.body;
  const result = adminUserPasswordUpdate(token, oldPass, newPass);
  return res.json(result);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminAuthLogout(token);
  return res.json(result);
});

// ================================ QUIZ.TS ===============================

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token.toString();
  const response = adminQuizTrash(token);
  return res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token } = req.body;
  const response = adminQuizRestore(token, quizId);
  return res.json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token.toString();
  const quizId = req.query.quizId as string;
  const response = adminQuizTrashEmpty(token, quizId);
  return res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token.toString();
  const response = adminQuizList(token);
  return res.json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  return res.json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const token = req.query.token.toString();
  const response = adminQuizRemove(token, quizid);
  return res.json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token.toString();
  const response = adminQuizInfo(token, quizId);
  return res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, name } = req.body;
  const response = adminQuizNameUpdate(token, quizId, name);
  return res.json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, description } = req.body;
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  return res.json(response);
});

app.delete(
  '/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.query.token.toString();
    const response = adminQuizRemoveQuestion(token, quizId, questionId);
    return res.json(response);
  }
);

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, questionBody } = req.body;
  const response = adminQuizCreateQuestion(token, questionBody, quizId);
  return res.json(response);
});

app.post(
  '/v1/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const { token } = req.body;
    const response = adminQuizDuplicateQuestion(token, quizId, questionId);
    return res.json(response);
  }
);

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, userEmail } = req.body;
  const response = adminQuizTransfer(token, userEmail, quizId);
  return res.json(response);
});

app.put(
  '/v1/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const { token, newPosition } = req.body;
    const response = adminQuizMoveQuestion(
      token,
      quizId,
      questionId,
      newPosition
    );
    return res.json(response);
  }
);

app.put(
  '/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const { token, questionBody } = req.body;
    const response = adminQuizUpdateQuestion(
      token,
      questionBody,
      quizId,
      questionId
    );
    return res.json(response);
  }
);

//! !//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!
//! !//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!
//! !//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!//!!
// ================================ OTHER.TS ===============================
app.delete('/v2/clear', (req: Request, res: Response) => {
  const result = clear();
  return res.json(result);
});

// ================================ AUTH.TS ===============================
app.post('/v2/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(result);
});

app.post('/v2/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  return res.json(result);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminUserDetails(token);
  return res.json(result);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  return res.json(result);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token');
  const { oldPass, newPass } = req.body;
  const result = adminUserPasswordUpdate(token, oldPass, newPass);
  return res.json(result);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminAuthLogout(token);
  return res.json(result);
});

// ================================ QUIZ.TS ===============================

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminQuizTrash(token);
  return res.json(response);
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizRestore(token, quizId);
  return res.json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = req.query.quizId as string;
  const response = adminQuizTrashEmpty(token, quizId);
  return res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminQuizList(token);
  return res.json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  return res.json(response);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const token = req.header('token');
  const response = adminQuizRemove(token, quizid);
  return res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizInfo(token, quizId);
  return res.json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const { name } = req.body;
  const response = adminQuizNameUpdate(token, quizId, name);
  return res.json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const { description } = req.body;
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  return res.json(response);
});

app.delete(
  '/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.header('token');
    const response = adminQuizRemoveQuestion(token, quizId, questionId);
    return res.json(response);
  }
);

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const { questionBody } = req.body;
  const response = adminQuizCreateQuestion(token, questionBody, quizId);
  return res.json(response);
});

app.post(
  '/v2/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.header('token');
    const response = adminQuizDuplicateQuestion(token, quizId, questionId);
    return res.json(response);
  }
);

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const { userEmail } = req.body;
  const response = adminQuizTransfer(token, userEmail, quizId);
  return res.json(response);
});

app.put(
  '/v2/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.header('token');
    const { newPosition } = req.body;
    const response = adminQuizMoveQuestion(
      token,
      quizId,
      questionId,
      newPosition
    );
    return res.json(response);
  }
);

app.put(
  '/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.header('token');
    const { questionBody } = req.body;
    const response = adminQuizUpdateQuestion(
      token,
      questionBody,
      quizId,
      questionId
    );
    return res.json(response);
  }
);

app.post(
  '/v1/admin/quiz/:quizid/session/start',
  (req: Request, res: Response) => {
    const token = req.header('token');
    const quizId = parseInt(req.params.quizid);
    const { autoStartNum } = req.body;
    const response = adminQuizSessionStart(token, quizId, autoStartNum);
    return res.json(response);
  }
);

app.put(
  '/v1/admin/quiz/:quizid/session/:sessionid',
  (req: Request, res: Response) => {
    const token = req.header('token');
    const quizId = parseInt(req.params.quizid);
    const sessionId = parseInt(req.params.sessionid);
    const { action } = req.body;
    const response = adminQuizSessionUpdate(token, quizId, sessionId, action);
    return res.json(response);
  }
);

app.get(
  '/v1/admin/quiz/:quizid/sessions',
  (req: Request, res: Response) => {
    const token = req.header('token');
    const quizId = parseInt(req.params.quizid);
    const response = adminQuizSessionList(token, quizId);
    return res.json(response);
  }
);

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const { imgUrl } = req.body;
  res.json(adminQuizUpdateThumbnail(token, quizId, imgUrl));
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results',
  (req: Request, res: Response) => {
    const token = req.header('token');
    const quizId = parseInt(req.params.quizid);
    const sessionId = parseInt(req.params.sessionid);
    const response = quizSessionResults(token, quizId, sessionId);
    return res.json(response);
  }
);

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const response = adminQuizSessionStatus(token, quizId, sessionId);
  return res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const response = adminQuizSessionResultsCSV(token, quizId, sessionId);
  return res.json(response);
});

app.get('/csv_results/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'csv_results', req.params.filename);
  res.sendFile(filePath);
});

// ================================ PLAYER.TS ===============================

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  res.json(playerJoin(sessionId, name));
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPos = parseInt(req.params.questionposition);
  const { answerIds } = req.body;
  const response = playerAnswer(answerIds, playerId, questionPos);
  return res.json(response);
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  res.json(playerStatusInfo(playerId));
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;
  res.json(playerChatSend(playerId, message));
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  res.json(playerChatView(playerId));
});

app.get(
  '/v1/player/:playerid/question/:questionposition/results',
  (req: Request, res: Response) => {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);
    const response = questionResults(playerId, questionPosition);
    return res.json(response);
  }
);

app.get(
  '/v1/player/:playerid/question/:questionposition',
  (req: Request, res: Response) => {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);
    const response = questionInfo(playerId, questionPosition);
    return res.json(response);
  }
);

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = playerSessionResults(playerId);
  return res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
