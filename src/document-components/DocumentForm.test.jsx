import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentForm from './DocumentForm';
import { useDocumentContext } from './DocumentContext';

jest.mock('./DocumentContext');

describe('<DocumentForm/>', () => {
  const mockSetTitle = jest.fn();
  const mockSetContent = jest.fn();
  const mockCreateDocument = jest.fn();
  const mockUpdateDocument = jest.fn();

  const setup = (override = {}) => {
    useDocumentContext.mockReturnValue({
      title: '',
      setTitle: mockSetTitle,
      content: '',
      setContent: mockSetContent,
      createDocument: mockCreateDocument,
      updateDocument: mockUpdateDocument,
      updateId: null,
      mode: 'create',
      ...override,
    });

    return render(<DocumentForm />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Holds true in both create and update mode', () => {
    test('that the form inputs have the correct name attributes', () => {
      setup();
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveAttribute('name', 'title');
      expect(screen.getByRole('textbox', { name: 'Content' })).toHaveAttribute('name', 'content');
    });

    test('that the form inputs renders with "Title" and "Content" user visible labels', () => {
      setup();
      expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Content' })).toBeInTheDocument();
    });

    test('that the state title and content variables updates on user input change', () => {
      setup();

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'New Title' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: 'New Content' } });

      expect(mockSetTitle).toHaveBeenCalledWith('New Title');
      expect(mockSetContent).toHaveBeenCalledWith('New Content');
    });
  });

  describe('Holds true in create mode', () => {

    test('that it renders only the Create New Document button, not the Update button', () => {
        setup();
        expect(screen.getByRole('button', { name: 'Create New Document' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Update Document' })).not.toBeInTheDocument();
      });

    test('that it calls createDocument when valid title and content inputs are supplied', () => {
      setup();

      const newDocumentTitle = 'New Document';
      const newDocumentContent = 'New Document Content';

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: newDocumentTitle } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: newDocumentContent } });

      fireEvent.click(screen.getByRole('button', { name: 'Create New Document' }));

      expect(mockCreateDocument).toHaveBeenCalledTimes(1);
    });

    // Had problems mocking the alert-error in a reasonable way, hence the use of this fallback option.
    // We'll refactor and improve input handling overall in the project (regarding the 3 following below).

    test('that it remains in create mode after clicking the Create New Document button with invalid title', () => {
      setup();

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: 'Content' } });

      fireEvent.click(screen.getByRole('button', { name: 'Create New Document' }));

      expect(useDocumentContext.mock.results[0].value.mode).toBe('create');
    });

    it('that it remains in create mode after clicking the Create New Document button with invalid content', () => {
      setup();

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Title' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: 'Create New Document' }));

      expect(useDocumentContext.mock.results[0].value.mode).toBe('create');
    });

    test('that it remains in create mode after clicking the Create New Document button with invalid title and content', () => {
      setup();

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: 'Create New Document' }));

      expect(useDocumentContext.mock.results[0].value.mode).toBe('create');
    });
  });

  describe('Holds true in update mode', () => {
    test('that it renders only the Update button, not the Create New Document button', () => {
      setup({ updateId: 'exampleId' });
      expect(screen.getByRole('button', { name: 'Update Document' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Create New Document' })).not.toBeInTheDocument();
    });

    test('that it calls updateDocument when valid title and content inputs are supplied', () => {
      setup({ updateId: 'exampleId' });

      const UpdatedTitle = 'Updated Document';
      const UpdatedContent = 'Updated Content';

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: UpdatedTitle } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: UpdatedContent } });

      fireEvent.click(screen.getByRole('button', { name: 'Update Document' }));

      expect(mockUpdateDocument).toHaveBeenCalledTimes(1);
    });

    // Had problems mocking the alert-error in a reasonable way, hence the use of this fallback option,
    // We'll refactor and improve input handling overall in the project (regarding the 3 following below).

    it('that it remains in update mode after clicking the Update button with invalid title', () => {
      setup({ updateId: 'exampleId', mode: 'update' });

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: 'Updated Content' } });

      fireEvent.click(screen.getByRole('button', { name: 'Update Document' }));

      expect(useDocumentContext.mock.results[0].value.mode).toBe('update');
    });

    test('that it remains in update mode after clicking the Update button with invalid content', () => {
      setup({ updateId: 'exampleId', mode: 'update' });

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Updated Title' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: 'Update Document' }));

      expect(useDocumentContext.mock.results[0].value.mode).toBe('update');
    });

    test('that it remains in update mode after clicking the Update button with invalid title and content', () => {
      setup({ updateId: 'exampleId', mode: 'update' });

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } });
      fireEvent.change(screen.getByRole('textbox', { name: 'Content' }), { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: 'Update Document' }));

      expect(useDocumentContext.mock.results[0].value.mode).toBe('update');
    });
  });
});
