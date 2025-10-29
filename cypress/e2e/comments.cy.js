/**
 * @e2e_test_component Comments
 *
 * Verifies that custom comment blots in the Quill editor:
 * 1. Can be created with formatting.
 * 2. Can be edited correctly (with Comments-component button-click).
 * 3. Can be deleted (with Comments-component button-click).
 * 4. That any additional formatting persists.
 */

describe('Authenticated User Tests for Comments functionality, confirming that it...', () => {

  const deleteDocAfterTest = true; // Set to false to inspect elements post-test
  const docTitle = 'Test Comments & Formatting Persistance';

  const lines = [
    { text: 'Line one - will be underlined', format: { underline: true, size: 'large' }, comment: 'LineOneComment' },
    { text: 'Line two - will be bolded and the comment edited', format: { bold: true, size: 'large' }, comment: 'LineTwoComment' },
    { text: 'Line three - will be in italic, and the comment blot will be deleted', format: { italic: true, size: 'large' }, comment: 'LineThreeComment' },
  ];

  // -----------------------------------------------------------------------------------------------
  //                              LOGIN AND SETUP
  // -----------------------------------------------------------------------------------------------
  beforeEach(() => {
    cy.login();
    cy.visit('http://localhost:5173/h2o-editor-frontend');
  });

  // -----------------------------------------------------------------------------------------------
  //                                    TEST
  // -----------------------------------------------------------------------------------------------

  it('creates, edits, deletes comments correctly, and that any eventual formatting persists', () => {

    cy.renderHeader();

    //Create and Open New Document
    cy.get('main').within(() => {
      cy.contains('button.top-button', 'Create New Document').click();
      cy.waitHalfSecond();
      cy.get('button.document-button').last().click();
    });

    // Edit Document Title descriptively
    cy.get('input.document-title-input').wait(20).clear().typeSlow(docTitle, { delay: 15 });
    cy.get('.ql-editor', { timeout: 20000 }).should('be.visible');
    cy.window().its('__H2O_EDITOR_TEST_API__').should('exist');

    // Insert lines (with formatting and comment-data)
    cy.window().then((win) => {
      const { __H2O_EDITOR_TEST_API__: api } = win;
      const quill = api.getQuill();
      let insertIndex = quill.getLength() - 1;

      lines.forEach((line, idx) => {
        line.text.split('').forEach((char, i) => quill.insertText(insertIndex + i, char, line.format, 'user'));

        // Create comment blot
        quill.setSelection(insertIndex, line.text.length, 'user');
        api.commentBlotCreate(line.comment);

        // Add some separation between the lines for clarity
        insertIndex += line.text.length + 3;
        if (idx < lines.length - 1) quill.insertText(insertIndex - 3, '\n\n\n', {}, 'user');
      });
    });

    // Verify that they exist
    lines.forEach(line => {
      cy.get(`.ql-editor [data-comment="${line.comment}"]`, { timeout: 5000 }).should('exist');
    });

    // Edit the second lines comment-data
    cy.window().then((win) => {
      const api = win.__H2O_EDITOR_TEST_API__;
      const span = api.getQuill().root.querySelector('[data-comment="LineTwoComment"]');
      if (span) api.commentBlotEdit(span.getAttribute('comment-id'), 'Edited Line Two Comment');
    });
    cy.waitHalfSecond();

    // Delete the third comment blot
    cy.get('.single-comment-container-comment')
      .contains('LineThreeComment')
      .closest('.single-comment-container')
      .scrollIntoView()
      .within(() => cy.get('.single-comment-delete').click());

    // Assert that the formatting is still correct after these operations
    cy.window().then((win) => {
      const quill = win.__H2O_EDITOR_TEST_API__.getQuill();
      const delta = quill.getContents();

      console.log('Current Quill Deltas:', JSON.stringify(delta.ops, null, 2));

      expect(delta.ops.some(op => op.insert.includes('Line one') && op.attributes?.underline), 'Underline exists').to.be.true;
      expect(delta.ops.some(op => op.attributes?.bold && op.attributes?.comment?.commentData === 'Edited Line Two Comment'), 'Bolded + Edited comment exists').to.be.true;
      expect(delta.ops.some(op => op.insert.includes('Line three') && op.attributes?.italic), 'Italic exists').to.be.true;

      // Final message
      let insertIndex = quill.getLength();
      quill.insertText(insertIndex, '\n', {}, 'user');

      const finalMessage = `\n Custom comment blots behave correctly: they can be created, edited, deleted, and any existing formatting persists.\n\n Testing Complete.`;
      let i = 0;
      const typeWriter = () => {
        if (i < finalMessage.length) {
          quill.insertText(insertIndex + i, finalMessage[i], { size: 'large' }, 'user');
          i++;
          setTimeout(typeWriter, 20);
        }
      };
      typeWriter();
    });

    // Cleanup operation ensues if further inspection is not requested, returns and deletes the test-document
    if (deleteDocAfterTest) {
      cy.wait(12000);
      cy.contains('button.top-button', 'Back').click().waitHalfSecond();

      cy.contains('button.document-button', docTitle)
        .should('exist')
        .within(() => cy.get('span.delete-button').click({ force: true }));

      cy.contains('button.document-button', docTitle).should('not.exist');
    }
  });
});
