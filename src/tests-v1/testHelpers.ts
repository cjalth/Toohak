import request from 'sync-request-curl';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function reqQuizCreate(token: string, name: string, description: string) {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
    json: { token, name, description },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqPassUpdate(token: string, oldPass: string, newPass: string) {
  const response = request('PUT', `${SERVER_URL}/v1/admin/user/password`, {
    json: { token, oldPass, newPass },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const response = request('PUT', `${SERVER_URL}/v1/admin/user/details`, {
    json: { token, email, nameFirst, nameLast },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqUserDetails(token: string) {
  const response = request('GET', `${SERVER_URL}/v1/admin/user/details`, {
    qs: { token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function requestQuizUpdateQuestion (token: string, questionBody: { question: string, duration: number, points: number, thumbnailUrl: string, answers: { answer: string, correct: boolean }[] }, quizId: number, questionId: number) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
    json: {
      token,
      questionBody,
      quizId,
      questionId,
    }
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestQuizInfo(token: string, quizId: number) {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}?token=${token}`
  );

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export
function reqQuizRemoveQuestion(token: string, quizId: number, questionId: number) {
  const response = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}?token=${token}`);

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqQuizRestore(token: string, quizId: number) {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/restore`, { json: { token } });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function requestQuizTransfer(token: string, userEmail: string, quizId: number) {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
    json: {
      token,
      userEmail,
      quizId,
    }
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestQuizNameUpdate(
  token: string,
  quizId: number,
  name: string
) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/name`, {
    json: {
      token,
      quizId,
      name,
    },
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export function requestQuizMoveQuestion (token: string, quizId: number, questionid: number, newPosition: number) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionid}/move`, {
    json: {
      token,
      quizId,
      questionid,
      newPosition
    }
  });

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function reqQuizList(token: string) {
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/list?token=${token}`);

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqQuizDuplicateQuestion(token: string, quizId: number, questionId: number) {
  const response = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
    json: { token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function requestQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/description`,
    {
      json: {
        token,
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
  const response = request(
    'DELETE',
      `${SERVER_URL}/v1/admin/quiz/${quizId}?token=${token}`
  );
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqAdminAuthLogout(token: string) {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/logout`, {
    json: { token },
  });

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqTrashEmpty(token: string, quizId: string) {
  const response = request(
    'DELETE',
      `${SERVER_URL}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: token,
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
  const response = request('GET', `${SERVER_URL}/v1/admin/quiz/trash?token=${token}`);

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode
  };
}

export function reqAdminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
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
    `${SERVER_URL}/v1/admin/quiz/${quizId}/question`,
    {
      json: { token: token, questionBody, quizId: quizId },
    }
  );

  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}

export function reqClear() {
  request('DELETE', `${SERVER_URL}/v1/clear`);
  return {};
}

export function reqAdminAuthLogin(email: string, password: string) {
  const response = request('POST', `${SERVER_URL}/v1/admin/auth/login`, {
    json: { email, password },
  });
  return {
    body: JSON.parse(response.body.toString()),
    statusCode: response.statusCode,
  };
}
