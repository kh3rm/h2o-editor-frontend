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
