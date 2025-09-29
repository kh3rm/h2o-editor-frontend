// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })



Cypress.Commands.add('renderHeaderFooter', () => {
    // Header / Footer should render and persist as is throughout, hence the use of
    // this custom command for easy inclusion.

    // ___________________________________________________________________________________________
    
    // Ascertain that the <header>-element exists
    cy.get('header').should('exist');

    // Ascertain that the <header>-element contains a <h1> with 'H(2)O Document Editor'
    cy.get('header h1')
      .should('exist')
      .and('contain.text', 'H(2)O Document Editor');

    // Ascertain that the <footer>-element exists
    cy.get('footer').should('exist');

    // Ascertain that the <footer> contains a <p>-element with 'H(2)O Document Editor'
    cy.get('footer p')
      .should('exist')
      .and('contain.text', 'H(2)O Document Editor');;
  });