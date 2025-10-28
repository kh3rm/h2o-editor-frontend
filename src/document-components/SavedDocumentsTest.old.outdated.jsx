import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SavedDocuments from './SavedDocuments';
import { useDocumentContext } from './DocumentContext';


jest.mock('./DocumentContext', () => ({
  useDocumentContext: jest.fn(),
}));

describe('<SavedDocuments/>', () => {
  const mockLoadDocument = jest.fn();
  const mockDeleteDocument = jest.fn();

  const setup = (documents = []) => {
    useDocumentContext.mockReturnValue({
      documents: { data: documents },
      loadDocument: mockLoadDocument,
      deleteDocument: mockDeleteDocument,
    });

    return render(<SavedDocuments/>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  describe('Holds true when documents has been retrieved (= the document state is not empty)', () => {
    const mockDocuments = [
      { _id: 'example-id-1', title: 'Document 1', content: 'Document Content 1' },
      { _id: 'example-id-2', title: 'Document 2', content: 'Document Content 2'},
      { _id: 'example-id-3', title: 'Document 3', content: 'Document Content 3'}
    ];

    beforeEach(() => {
      setup(mockDocuments);
    });

    test('that it renders the documents as clickable buttons with respective title, each containing also a delete button', () => {
      const documentButton1 = screen.getByRole('button', { name: /Document 1\s*☒/i });
      const documentButton2 = screen.getByRole('button', { name: /Document 2\s*☒/i });
      const documentButton3 = screen.getByRole('button', { name: /Document 3\s*☒/i });

      expect(documentButton1).toBeInTheDocument();
      expect(documentButton2).toBeInTheDocument();
      expect(documentButton3).toBeInTheDocument();
    });

    test('that it calls loadDocument when a document button is clicked', () => {
      const documentButton = screen.getByRole('button', { name: /Document 1\s*☒/i });
      fireEvent.click(documentButton);
      expect(mockLoadDocument).toHaveBeenCalledWith('example-id-1');
      expect(mockLoadDocument).toHaveBeenCalledTimes(1);
    });

    test('that it displays the delete button next to each document', () => {
      const deleteButtons = screen.getAllByText('☒', { selector: '.delete-button' });

      expect(deleteButtons.length).toBe(3); 

      deleteButtons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('delete-button');
      });
    });

    test('that it calls deleteDocument when the delete button is clicked', () => {
      const deleteButton1 = screen.getAllByText('☒', { selector: '.delete-button' })[0];
      fireEvent.click(deleteButton1);

      expect(mockDeleteDocument).toHaveBeenCalledWith('example-id-1');
      expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
    });

  });

  describe('Holds true when no documents has been retrieved (= the document state is empty)', () => {
    beforeEach(() => {
      setup([]);
    });

  
    test('that it does not render any clickable document buttons', () => {
      expect(useDocumentContext.mock.results[0].value.documents.data).toHaveLength(0);
  
      const documentButtons = screen.queryAllByRole('button', { name: /Document/i });
      expect(documentButtons).toHaveLength(0);
    });
  });
  

});
