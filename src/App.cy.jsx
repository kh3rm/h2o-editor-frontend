import React from 'react'
import App from './App'

// Cypress component-testing of the <App>

describe('<App/>', () => {
  beforeEach(() => {
    cy.mount(<App />);
  });

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  // ***Render default view***

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________


  it('Renders all elements correctly in the default view', () => {

    // _____________________________________________________________________________________________

    // *Ascertain that the persistent Header and Footer renders correctly*

    cy.renderHeaderFooter();

    // _____________________________________________________________________________________________

    // *Default-view rendered content*

    cy.get('main')
      .should('exist');

    cy.get('main').within(() => {
      cy.get('div.top-button-container')
        .should('exist')
        .find('button.top-button')
        .should('contain.text', '+ New Document');

      cy.get('div.saved-documents')
        .should('exist')
        .find('h2')
        .should('contain.text', 'Saved Documents');
    });
  });

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________


  // ***Render create view***

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  it('Renders the create-view correctly when "+ New Document" is clicked', () => {

    // _____________________________________________________________________________________________

    // *Ascertain that the persistent Header and Footer renders correctly*

    cy.renderHeaderFooter();

    // _____________________________________________________________________________________________

    // *Create-view content*

    cy.get('main')
      .should('exist');

    cy.get('main').within(() => {
      cy.contains('button', '+ New Document')
        .click();

      cy.get('div.top-button-container')
        .should('exist')
        .find('button.top-button')
        .should('contain.text', '← Back');

      cy.get('div.saved-documents')
        .should('not.exist');
    

      cy.get('div.document-form')
        .should('exist');

      cy.get('label[for="title"]')
        .should('contain.text', 'Title');

      cy.get('input#title')
        .should('exist');

      cy.get('label[for="content"]')
        .should('contain.text', 'Content');

      cy.get('textarea#content')
        .should('exist');

      cy.get('button.document-form-button')
        .should('exist')
        .and('contain.text', 'Create New Document');
  }); 
});

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________


  // ***Return to default view***

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  it('Returns to default view correctly when "Back" button is clicked from the create-view', () => {

    // _____________________________________________________________________________________________

    // *Ascertain that the persistent Header and Footer renders correctly*
    
    cy.renderHeaderFooter();

    // _____________________________________________________________________________________________

    cy.get('main')
      .should('exist');

    cy.get('main').within(() => {
      cy.contains('button', '+ New Document')
        .click();

      cy.contains('button', 'Back')
        .click();


      cy.get('div.top-button-container')
        .should('exist')
        .find('button.top-button')
        .should('contain.text', '+ New Document');

      cy.get('div.saved-documents')
        .should('exist')
        .find('h2')
        .should('contain.text', 'Saved Documents');

      cy.get('div.document-form')
        .should('not.exist');

    });
  });

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  // ***Test incorrect create-form behaviour***

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  it('Does not create a document if title or content is missing', () => {
    // _____________________________________________________________________________________________

    // *Ascertain that the persistent Header and Footer renders correctly*
    
    cy.renderHeaderFooter();

    // _____________________________________________________________________________________________

    cy.get('main')
      .should('exist');

    cy.get('main').within(() => {
      cy.contains('button', '+ New Document')
        .click();

      cy.get('div.document-form')
        .should('exist');

      // *Scenario 1: Empty title and content*
      cy.get('input#title').clear();
      cy.get('textarea#content').clear();
      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('exist');

      // *Scenario 2: Empty title, valid content*
      cy.get('input#title').clear();
      cy.get('textarea#content')
        .clear()
        .type('Test');

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('exist');

      // *Scenario 3: Valid title, empty content*
      cy.get('input#title')
        .clear()
        .type('Testing');

      cy.get('textarea#content').clear();

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('exist');
    });
  });

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  // *** Larger combined testing segment necessary to be able to work with consistent, realistic
  // state, in an e2e operation sequence.  | Create → Read/Update → Delete |   ***

  // _____________________________________________________________________________________________
  // _____________________________________________________________________________________________

  it('Creates, reads/updates, and deletes a document correctly', () => {
    // _____________________________________________________________________________________________

    // *Ascertain that the persistent Header and Footer renders correctly*
    
    cy.renderHeaderFooter();

    // _____________________________________________________________________________________________

    cy.get('main')
      .should('exist');
    
    cy.get('main').within(() => {
      cy.contains('button', '+ New Document')
      .click();
      cy.get('div.document-form')
        .should('exist');

      // *Create a document*
      cy.get('input#title')
        .type('Test title');

      cy.get('textarea#content')
        .type('Test content');

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('not.exist');

      cy.get('div.saved-documents')
        .should('exist')
        .find('button.document-button')
        .should('contain.text', 'Test title');

      // *Open document for reading/updating*
      cy.contains('button.document-button', 'Test title')
        .click();

      cy.get('div.document-form')
        .should('exist');

      cy.get('input#title')
        .should('have.value', 'Test title');

      cy.get('textarea#content')
        .should('have.value', 'Test content');

      cy.get('button.document-form-button')
        .should('contain.text', 'Update Document');

      // *Update document*
      cy.get('input#title')
        .clear()
        .type('Testing title change');

      cy.get('textarea#content')
        .clear()
        .type('Testing content change');

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('not.exist');

      cy.get('div.saved-documents')
        .find('button.document-button')
        .should('contain.text', 'Testing title change');

      // *Reopen to check updated values*
      cy.contains('button.document-button', 'Testing title change')
        .click();

      cy.get('div.document-form')
        .should('exist');

      cy.get('input#title')
        .should('have.value', 'Testing title change');

      cy.get('textarea#content')
        .should('have.value', 'Testing content change');

      cy.get('button.document-form-button')
        .should('contain.text', 'Update Document');

      // *Try to update with empty title – should stay in the document-form-view*
      cy.get('input#title')
        .clear();

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('exist');

      // *Try to update with empty content – should stay in the document-form-view*
      cy.get('input#title')
      .type('Testing title change');

      cy.get('textarea#content')
        .clear();

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('exist');

      // *Try to update with both fields empty – should stay in the document-form-view*
      cy.get('input#title')
        .clear();

      cy.get('textarea#content')
        .clear();

      cy.get('button.document-form-button')
        .click();

      cy.get('div.document-form')
        .should('exist');

      // *Return to default view*
      cy.get('button.top-button')
        .contains('← Back')
        .click();

      // *Check that the document has indeed not been altered by the invalid updates*
      cy.contains('button.document-button', 'Testing title change')
        .click();

      cy.get('div.document-form')
        .should('exist');

      cy.get('input#title')
        .should('have.value', 'Testing title change');

      cy.get('textarea#content')
        .should('have.value', 'Testing content change');

      cy.get('button.document-form-button')
        .should('contain.text', 'Update Document');

      // *Return to default view again*
      cy.get('button.top-button')
        .contains('← Back')
        .click();
    });

    // *Initiate deletion, but decline the confirmation prompt*
    cy.window().then((win) => {
      cy.stub(win, 'confirm').callsFake((message) => {
        expect(message).to.eq(
          'Are you sure that you want to delete the document titled "Testing title change"?'
        );
        return false;
      });
    });

    cy.get('div.saved-documents')
      .contains('button.document-button', 'Testing title change')
      .parent()
      .within(() => {
        cy.get('span.delete-button')
          .click();
      });

    // *Confirm that the document still exists*
    cy.get('div.saved-documents')
      .find('button.document-button')
      .should('contain.text', 'Testing title change');

    // *Initiate deletion, this time confirming the confirmation prompt*
    cy.window().then((win) => {
      win.confirm.restore();
      cy.stub(win, 'confirm').callsFake((message) => {
        expect(message).to.eq(
          'Are you sure that you want to delete the document titled "Testing title change"?'
        );
        return true;
      });
    });

    cy.get('div.saved-documents')
      .contains('button.document-button', 'Testing title change')
      .parent()
      .within(() => {
        cy.get('span.delete-button')
          .click();
      });

    // *Confirm that the document no longer exists*
    cy.get('div.saved-documents')
      .contains('button.document-button', 'Testing title change')
      .should('not.exist');
  });

});
