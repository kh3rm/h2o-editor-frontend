/**
 * Verifies that a logged in user can do CRUD on a code module:
 */

describe('Authenticated User Tests for Code Module functionallity, confirming that it...', () => {

  const docTitle = 'Testing a code module';
  const expectedCodeOutput = "This js code was excecuted by Emils API";
  const docContent = `console.log("${expectedCodeOutput}");`;

  // -----------------------------------------------------------------------------------------------
  //                              SETUP AND TEARDOWN
  // -----------------------------------------------------------------------------------------------
  before(() => {
    cy.signupCypressUser();
    cy.loginCypressUser();
  });
  
  // beforeEach(() => {
  // });

  after(() => {
    cy.deleteCypressUser();
  });

  // -----------------------------------------------------------------------------------------------
  //                                    TEST
  // -----------------------------------------------------------------------------------------------

  it('creates, edits and deletes code module and its title and content properly', () => {

    cy.renderHeader();

    //Create and Open New Document
    cy.get('main').within(() => {
      cy.contains('button.top-button', 'Create New Code Module').click();
      cy.waitHalfSecond();
      cy.get('button.document-button').last().click();
    });

    // // Edit Title
    cy.get('input.code-title-input').wait(20).clear().typeSlow(docTitle, { delay: 15 });

    // // Verify title exists
    cy.contains('input.code-title-input', docTitle).should('exist');

    
    // GET HOLD OF THE MONACO EDITOR INSTANCE SOMEHOW
    // Edit content
    // editor.setValue(docContent);

    // verify content shows
    // cy.contains(docContent);


    // Go to view-mode
    cy.contains('button.top-button', 'Back').click().waitHalfSecond();

    // Verify title is updated in view mode, then go back to editor
    cy.contains('button.document-button', docTitle).click();
    // cy.get('button.document-button').last().click();


    // Verify title and content still exists
    // cy.contains('input', docTitle);
    // cy.contains(docContent);

    // run code
    cy.contains('button.code-button','Run Code').click();

    // Verify code output title and content is visable
    cy.contains('API Code Output (JS)', { timeout: 10000 }).should('be.visible')
    cy.contains('div.code-output-container', expectedCodeOutput, { timeout: 10000 }).should('be.visible')


    cy.wait(10000);


    // Go to view-mode
    // cy.contains('button.top-button', 'Back').click().waitHalfSecond();

    // // Delete code module
    // cy.contains('button.document-button', docTitle)
    //   .should('exist')
    //   .within(() => cy.get('span.delete-button').click({ force: true }));

    // // Verify deleted
    // cy.contains('button.document-button', docTitle).should('not.exist');
  });
});
