import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentEditor from './DocumentEditor';
import { useDocumentContext } from './DocumentContext';

jest.mock('./SavedDocuments', () => () => <div>SavedDocuments</div>);
jest.mock('./DocumentForm', () => () => <div>DocumentForm</div>);

jest.mock('./DocumentContext', () => ({
  useDocumentContext: jest.fn(),
}));

describe('<DocumentEditor />', () => {
  const mockSwitchToCreateMode = jest.fn();
  const mockSwitchToViewMode = jest.fn();

  const setup = (mode = 'view') => {
    useDocumentContext.mockReturnValue({
      mode,
      switchToCreateMode: mockSwitchToCreateMode,
      switchToViewMode: mockSwitchToViewMode,
    });
    return render(<DocumentEditor />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // *View-mode*
  describe('Holds true in view mode', () => {
    beforeEach(() => {
      setup('view');
    });

    test('that it renders the "+ New Document" (not the "← Back") top button', () => {
      const button = screen.getByRole('button', { name: '+ New Document' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('top-button');
      expect(screen.queryByRole('button', { name: '← Back' })).not.toBeInTheDocument();
    });

    test('that it calls switchToCreateMode when + New Document button is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: '+ New Document' }));
      expect(mockSwitchToCreateMode).toHaveBeenCalledTimes(1);
    });

    test('that it renders the <SavedDocuments/>-component (not the <DocumentForm/>-component)', () => {
      expect(screen.queryByText('SavedDocuments')).toBeInTheDocument();
      expect(screen.queryByText('DocumentForm')).not.toBeInTheDocument();
    });
  });

  // *Create-mode*
  describe('Holds true in create mode', () => {
    beforeEach(() => {
      setup('create');
    });

    test('that it renders the "← Back" (not "+ New Document") top button', () => {
      const button = screen.getByRole('button', { name: '← Back' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('top-button');
      expect(screen.queryByRole('button', { name: '+ New Document' })).not.toBeInTheDocument();
    });

    test('that it renders the <DocumentForm/>-component (not the <SavedDocuments/>-component)', () => {
      expect(screen.queryByText('DocumentForm')).toBeInTheDocument();
      expect(screen.queryByText('SavedDocuments')).not.toBeInTheDocument();
    });

    test('that it calls switchToViewMode when "← Back"-button is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: '← Back' }));
      expect(mockSwitchToViewMode).toHaveBeenCalledTimes(1);
    });
  });

  // *Update-mode*
  describe('Holds true in update mode', () => {
    beforeEach(() => {
      setup('update');
    });

    test('that it renders the <DocumentForm/>-component (not the <SavedDocuments/>-component)', () => {
      expect(screen.queryByText('DocumentForm')).toBeInTheDocument();
      expect(screen.queryByText('SavedDocuments')).not.toBeInTheDocument();
    });

    test('that it renders the "← Back" (not "+ New Document") top button', () => {
      const button = screen.getByRole('button', { name: '← Back' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('top-button');
      expect(screen.queryByRole('button', { name: '+ New Document' })).not.toBeInTheDocument();
    });

    test('that it calls switchToViewMode when "← Back"-button is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: '← Back' }));
      expect(mockSwitchToViewMode).toHaveBeenCalledTimes(1);
    });
  });
});
