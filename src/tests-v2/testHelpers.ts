import request from 'sync-request-curl';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function reqQuizCreate(
  token: string,
  name: string,
  description: string
) {
  const response = request('POST', `${SERVER_URL}/v2/admin/quiz`, {
    headers: { token: token },
    json: { name, description },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqPassUpdate(token: string, oldPass: string, newPass: string) {
  const response = request('PUT', `${SERVER_URL}/v2/admin/user/password`, {
    headers: { token: token },
    json: { oldPass, newPass },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqDetailsUpdate(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
) {
  const response = request('PUT', `${SERVER_URL}/v2/admin/user/details`, {
    headers: { token: token },
    json: { email, nameFirst, nameLast },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqUserDetails(token: string) {
  const response = request('GET', `${SERVER_URL}/v2/admin/user/details`, {
    headers: { token: token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function requestQuizUpdateQuestion(
  token: string,
  questionBody: {
    question: string;
    duration: number;
    points: number;
    thumbnailUrl: string;
    answers: { answer: string; correct: boolean }[];
  },
  quizId: number,
  questionId: number
) {
  const res = request(
    'PUT',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: { token: token },
      json: {
        questionBody,
        quizId,
        questionId,
      },
    }
  );

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function requestQuizInfo(token: string, quizId: number) {
  const res = request('GET', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: { token: token },
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function reqQuizRemoveQuestion(
  token: string,
  quizId: number,
  questionId: number
) {
  const response = request(
    'DELETE',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: { token: token },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizRestore(token: string, quizId: number) {
  const response = request(
    'POST',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/restore`,
    {
      headers: { token: token },
    }
  );
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function requestQuizTransfer(
  token: string,
  userEmail: string,
  quizId: number
) {
  const res = request(
    'POST',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/transfer`,
    {
      headers: { token: token },
      json: {
        userEmail,
        quizId,
      },
    }
  );

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function requestQuizNameUpdate(
  token: string,
  quizId: number,
  name: string
) {
  const res = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/name`, {
    headers: { token: token },
    json: {
      quizId,
      name,
    },
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function requestQuizMoveQuestion(
  token: string,
  quizId: number,
  questionid: number,
  newPosition: number
) {
  const res = request(
    'PUT',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionid}/move`,
    {
      headers: { token: token },
      json: {
        quizId,
        questionid,
        newPosition,
      },
    }
  );

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function reqQuizList(token: string) {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/list`, {
    headers: { token: token },
  });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizDuplicateQuestion(
  token: string,
  quizId: number,
  questionId: number
) {
  const response = request(
    'POST',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      headers: { token: token },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function requestQuizDescriptionUpdate(
  token: string,
  quizId: number,
  description: string
) {
  const res = request(
    'PUT',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/description`,
    {
      headers: { token: token },
      json: {
        quizId,
        description,
      },
    }
  );

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function reqQuizRemove(token: string, quizId: number) {
  const response = request('DELETE', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: { token: token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqAdminAuthLogout(token: string) {
  const response = request('POST', `${SERVER_URL}/v2/admin/auth/logout`, {
    headers: { token: token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqTrashEmpty(token: string, quizId: string) {
  const response = request(
    'DELETE',
    `${SERVER_URL}/v2/admin/quiz/trash/empty`,
    {
      headers: { token: token },
      qs: {
        quizId: quizId,
      },
    }
  );
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizTrash(token: string) {
  const response = request('GET', `${SERVER_URL}/v2/admin/quiz/trash`, {
    headers: { token: token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqAdminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const response = request('POST', `${SERVER_URL}/v2/admin/auth/register`, {
    json: { email, password, nameFirst, nameLast },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizCreateQuestion(
  token: string,
  questionBody: {
    question: string;
    duration: number;
    points: number;
    answers: { answer: string; correct: boolean }[];
    thumbnailUrl: string;
  },
  quizId: number
) {
  const response = request(
    'POST',
    `${SERVER_URL}/v2/admin/quiz/${quizId}/question`,
    {
      headers: { token: token },
      json: { token: token, questionBody, quizId: quizId },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqClear() {
  request('DELETE', `${SERVER_URL}/v2/clear`);
  return {};
}

export function requestQuestionInfo(playerId: number, questionPosition: number) {
  const response = request('GET', `${SERVER_URL}/v1/player/${playerId}/question/${questionPosition}`, {
    json: { playerId, questionPosition },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function requestQuestionResults(
  playerId: number,
  questionPosition: number
) {
  const response = request(
    'GET',
    `${SERVER_URL}/v1/player/${playerId}/question/${questionPosition}/results`);

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqAdminAuthLogin(email: string, password: string) {
  const response = request('POST', `${SERVER_URL}/v2/admin/auth/login`, {
    json: { email, password },
  });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqStartSession(
  token: string,
  autoStartNum: number,
  quizId: number
) {
  const response = request(
    'POST',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/session/start`,
    {
      headers: { token: token },
      json: { autoStartNum: autoStartNum, quizId: quizId },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqUpdateSession(
  token: string,
  quizId: number,
  sessionId: number,
  action: string
) {
  const response = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: { token },
      json: { action },
    }
  );
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizSessionList(token: string, quizId: number) {
  const response = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/sessions`,
    {
      headers: { token },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizSessionResults(token: string, quizid: number, sessionid: number) {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}/results`, {
    headers: { token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqPlayerJoin(sessionId: number, name: string) {
  const response = request('POST', `${SERVER_URL}/v1/player/join`, {
    json: { sessionId: sessionId, name: name },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqPlayerAnswer(
  answerIds: number[],
  playerId: number,
  questionPos: number
) {
  const response = request(
    'PUT',
    `${SERVER_URL}/v1/player/${playerId}/question/${questionPos}/answer`,
    {
      json: { answerIds: answerIds },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqPlayerStatusInfo(playerId: number) {
  const response = request('GET', `${SERVER_URL}/v1/player/${playerId}`, {
    qs: { playerId: playerId },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizUpdateThumbnail(
  token: string,
  quizId: number,
  imgUrl: string
) {
  const response = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/thumbnail`,
    {
      headers: { token: token },
      json: { imgUrl: imgUrl },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqPlayerChat(playerId: number, message: string) {
  const response = request('POST', `${SERVER_URL}/v1/player/${playerId}/chat`, {
    json: { message: message },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqPlayerChatView(playerId: number) {
  const response = request('GET', `${SERVER_URL}/v1/player/${playerId}/chat`);

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizSessionStatus(token: string, quizId: number, sessionId: number) {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${sessionId}`, {
    headers: { token }
  });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqQuizSessionResultsCSV(token: string, quizId: number, sessionId: number) {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, {
    headers: { token }
  });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function csvReturn(sessionId: number) {
  const response = request('GET', `${SERVER_URL}/csv_results/${sessionId}.csv`);
  return {
    statusCode: response.statusCode
  };
}

export function reqPlayerSessionResults(playerId: number) {
  const response = request('GET', `${SERVER_URL}/v1/player/${playerId}/results`);
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}
