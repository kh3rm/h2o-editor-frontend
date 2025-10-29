import 'cypress-wait-until';

  // -----------------------------------------------------------------------------------------------
  //                              Helper Custom Commands
  // -----------------------------------------------------------------------------------------------

// Login
Cypress.Commands.add('login', () => {
  cy.request('POST', 'http://localhost:3000/account/login', {
    email: 'hekr23@student.bth.se',
    password: '12345Qwerty!'
  }).then((response) => {
    const token = response.body.data?.token;
    expect(token, 'Login token').to.be.a('string');

    cy.visit('http://localhost:5173/h2o-editor-frontend', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('token', token);
      },
    });
  });
});

// Signup Cyress user
Cypress.Commands.add('signupCypressUser', () => {
  cy.request({
    method: 'POST',
    url: 'https://h2o-editor-oljn22.azurewebsites.net/account/signup',
    body: {
      name: 'Cypress',
      email: 'cypress@test.com',
      password: 'P4ssword',
    },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 400 && response.body.errors?.[0]?.title === 'DuplicateUserError') {
      console.log("Cyress user already exixsts");
    }
  });
});

// Login Cypress user
Cypress.Commands.add('loginCypressUser', () => {
  cy.request({
  method: 'POST',
  url: 'https://h2o-editor-oljn22.azurewebsites.net/account/login',
  body: {
    email: 'cypress@test.com',
    password: 'P4ssword',
  },
  }).then((response) => {
    const token = response.body.data?.token;
    expect(token, 'Login token').to.be.a('string');
  
    cy.visit('https://kh3rm.github.io/h2o-editor-frontend', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('token', token);
      },
    });
  });
});

// Delete Cypress user
Cypress.Commands.add('deleteCypressUser', () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.log("No token when trying to delete cypress user");
    return;
  }

  cy.request({
    method: 'POST',
    url: 'https://h2o-editor-oljn22.azurewebsites.net/graphql',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      query: 'mutation { deleteUser }',
    },
  }).then((response) => {
    const success = response.body.data.deleteUser;
    expect(success, 'Delete Cypress user').to.be.true;
    sessionStorage.removeItem("token");
  });
});

// Confirms rendering of Header
Cypress.Commands.add('renderHeader', () => {
  cy.get('header').should('exist');
  cy.get('header h1')
    .should('exist')
    .and('contain.text', 'docpool');
});

// Elementary wait-function
Cypress.Commands.add('waitHalfSecond', () => {
  cy.wait(500);
});

// Provides a visual “slow typing”-effect in the DOM for readability and aesthetic purposes
Cypress.Commands.add('typeSlow', { prevSubject: 'element' }, (subject, text, options = {}) => {
  const delay = options.delay ?? 20;
  for (const char of text) {
    cy.wrap(subject).type(char, { delay });
  }
  return cy.wrap(subject);
});
