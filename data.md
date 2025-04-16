```javascript
let data = {
  user: [
    {
      userId: 1,
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: 'abc123',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
      numQuizMade: 1,
    },
    {
      userId: 2,
      nameFirst: 'Jane',
      nameLast: 'Doe',
      email: 'jane.doe@unsw.edu.au',
      password: 'password',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
      numQuizMade: 0,
    },
  ],
  quizzes: [
    {
      quizId: 1,
      authUserId: 1,
      name: 'My Quiz',
      timeCreated: 541589,
      timeLastEdited: 6546516498,
      description: 'A quiz',
    }
  ]
};