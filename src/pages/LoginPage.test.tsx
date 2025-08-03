import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_URL: '/api',
  DEV: true,
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('EEU Staff Login')).toBeInTheDocument();
    expect(screen.getByText('Ethiopian Electric Utility')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows demo credentials in development mode', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText(/admin@eeu.gov.et/)).toBeInTheDocument();
    expect(screen.getByText(/manager@eeu.gov.et/)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@eeu.gov.et' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    });
  });

  it('requires both email and password', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
    });
  });

  it('handles successful login with valid demo credentials', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@eeu.gov.et' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });
  });

  it('handles invalid credentials', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@eeu.gov.et' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument();
    });
  });

  it('shows remember me checkbox', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const rememberMeCheckbox = screen.getByLabelText('Remember me');
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('shows forgot password link', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const forgotPasswordLink = screen.getByText('Forgot password?');
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('sanitizes input values', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    
    fireEvent.change(emailInput, { target: { value: 'test<script>@eeu.gov.et' } });
    
    expect(emailInput.value).toBe('testscript@eeu.gov.et');
  });

  it('clears error when user starts typing', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    // Trigger an error first
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter both email and password.')).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@eeu.gov.et' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Please enter both email and password.')).not.toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText('Password');
    
    // Test Enter key on password field
    fireEvent.keyDown(passwordInput, { key: 'Enter' });
    
    // Should not throw any errors
    expect(passwordInput).toBeInTheDocument();
  });

  it('displays loading state during authentication', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@eeu.gov.et' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(loginButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });

    // Button should be disabled during loading
    expect(loginButton).toBeDisabled();
  });
});