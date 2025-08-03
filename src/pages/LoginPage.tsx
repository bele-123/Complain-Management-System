import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/user';

// Brand colors
const BRAND_PRIMARY = "#2e8b57"; // EEU green
const BRAND_ACCENT = "#f9a825"; // EEU yellow

const API_URL = import.meta.env.VITE_API_URL || '/api';
const IS_DEVELOPMENT = import.meta.env.DEV;

// Secure demo authentication - only for development
const authenticateUser = async (email: string, password: string) => {
  if (!IS_DEVELOPMENT) {
    // In production, always use API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    return await response.json();
  }

  // Development-only demo authentication
  const demoCredentials: Record<string, { role: UserRole; hash: string }> = {
    'admin@eeu.gov.et': { role: 'admin', hash: 'demo_admin_hash' },
    'manager@eeu.gov.et': { role: 'manager', hash: 'demo_manager_hash' },
    'foreman@eeu.gov.et': { role: 'foreman', hash: 'demo_foreman_hash' },
    'callattendant@eeu.gov.et': { role: 'call-attendant', hash: 'demo_attendant_hash' },
    'technician@eeu.gov.et': { role: 'technician', hash: 'demo_tech_hash' },
  };

  const user = demoCredentials[email];
  const validPasswords = ['admin123', 'manager123', 'foreman123', 'attendant123', 'tech123'];
  
  if (user && validPasswords.includes(password)) {
    return {
      success: true,
      user: {
        email,
        role: user.role,
        id: Math.random().toString(36).substr(2, 9),
      }
    };
  }
  
  return { success: false, error: 'Invalid credentials' };
};

// Helper function to get department by role
const getDepartmentByRole = (role: UserRole): string => {
  const departments = {
    admin: 'System Administration',
    manager: 'Regional Management',
    foreman: 'Field Operations',
    'call-attendant': 'Customer Service',
    technician: 'Field Service'
  };
  return departments[role];
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Basic input sanitization
    const sanitizedValue = value.trim().replace(/[<>]/g, '');
    
    setFormData((prev) => ({ ...prev, [id]: sanitizedValue }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if user is blocked due to too many attempts
    if (isBlocked) {
      setError('Too many failed attempts. Please wait before trying again.');
      return;
    }
    
    setLoading(true);
    setError('');

    const { email, password } = formData;

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Password strength validation (basic)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Secure authentication
      const result = await authenticateUser(email, password);

      if (result.success && result.user) {
        // Create user data for login
        const userData = {
          id: result.user.id,
          name: email.split('@')[0]
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^\w/, c => c.toUpperCase())
            .replace(/callattendant/i, 'Call Attendant'),
          email,
          role: result.user.role,
          region: 'Addis Ababa',
          department: getDepartmentByRole(result.user.role),
          phone: '+251-11-123-4567',
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        login(userData);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.name}!`,
        });
        
        // Reset attempt count on successful login
        setAttemptCount(0);
        
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        // Handle failed login attempt
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        if (newAttemptCount >= 5) {
          setIsBlocked(true);
          setError('Too many failed attempts. Account temporarily blocked.');
          
          // Unblock after 15 minutes
          setTimeout(() => {
            setIsBlocked(false);
            setAttemptCount(0);
          }, 15 * 60 * 1000);
        } else {
          setError(`Invalid credentials. ${5 - newAttemptCount} attempts remaining.`);
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }

    setLoading(false);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, #e6f4ea 100%)`,
      }}
    >
      <Card
        className="w-full max-w-md shadow-2xl animate-fade-in border-none"
        style={{ borderRadius: 20, background: "#fff" }}
      >
        <CardHeader className="pb-0 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="EEU Logo"
            className="mb-2 mt-4" style={{ width: 80, height: 80, borderRadius: 16 }}
          />
          <CardTitle className="text-center text-2xl font-bold mb-2" style={{ color: BRAND_PRIMARY }}>EEU Staff Login</CardTitle>
          <div className="text-center text-sm text-gray-500 mb-2">Ethiopian Electric Utility</div>
          {IS_DEVELOPMENT && (
            <div className="text-center text-xs text-gray-400 mb-2 p-2 bg-gray-50 rounded">
              <strong>Demo Credentials:</strong><br />
              admin@eeu.gov.et / admin123<br />
              manager@eeu.gov.et / manager123
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-6 pt-2" onSubmit={handleLogin} noValidate>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-base font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@eeu.gov.et"
                autoFocus
                required
                autoComplete="email"
                aria-describedby={error ? "login-error" : undefined}
                className="bg-[#e6f4ea] border border-[#cce3d6] focus:ring-2 px-4 py-2 rounded-md text-lg transition-all duration-150"
                style={{ '--tw-ring-color': BRAND_PRIMARY } as React.CSSProperties}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-base font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                aria-describedby={error ? "login-error" : undefined}
                className="bg-[#e6f4ea] border border-[#cce3d6] focus:ring-2 px-4 py-2 rounded-md text-lg transition-all duration-150"
                style={{ '--tw-ring-color': BRAND_PRIMARY } as React.CSSProperties}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    const form = e.currentTarget.form;
                    if (form) {
                      const formEvent = new Event('submit', { bubbles: true, cancelable: true });
                      form.dispatchEvent(formEvent);
                    }
                  }
                }}
              />
            </div>
            
            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
              </div>
              <Button 
                variant="link" 
                className="text-sm p-0 h-auto"
                style={{ color: BRAND_PRIMARY }}
                onClick={() => {
                  toast({
                    title: "Contact Administrator",
                    description: "Please contact your system administrator to reset your password.",
                  });
                }}
              >
                Forgot password?
              </Button>
            </div>

            {error && (
              <div 
                id="login-error" 
                className="text-red-500 text-sm text-center mt-2 animate-pulse"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full mt-2 text-base font-semibold"
              style={{
                background: BRAND_PRIMARY,
                color: "#fff",
                borderRadius: 8,
                boxShadow: `0 2px 8px 0 ${BRAND_PRIMARY}22`,
                transition: "background 0.2s",
              }}
              disabled={loading || isBlocked}
              aria-label={loading ? "Logging in..." : isBlocked ? "Account blocked" : "Login"}
              onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!loading && !isBlocked) e.currentTarget.style.background = BRAND_ACCENT;
              }}
              onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!loading && !isBlocked) e.currentTarget.style.background = BRAND_PRIMARY;
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Logging in...
                </span>
              ) : isBlocked ? (
                "Account Blocked"
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
