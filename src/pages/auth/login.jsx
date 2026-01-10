import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { login, user, isLoading: authLoading, error: authError } = useAuth();

  // Get redirect and role from URL params - default to home page for travelers
  const redirectTo = searchParams.get('redirect') || '/';
  const suggestedRole = searchParams.get('role');
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('✅ User already logged in, redirecting to dashboard');
      const dashboardPath = user.userType === 'service_provider' 
        ? '/service-provider-dashboard' 
        : '/traveler-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [authLoading, user, navigate]);
  
  // Check for Google OAuth errors (e.g., not_registered)
  useEffect(() => {
    const googleError = searchParams.get('error');
    const notRegisteredEmail = searchParams.get('email');
    
    if (googleError === 'not_registered') {
      setError(`This email "${notRegisteredEmail || ''}" is not registered. Please sign up first using the registration page.`);
    } else if (googleError === 'google_auth_failed') {
      setError('Google authentication failed. Please try again.');
    } else if (googleError === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect based on user type
      const user = result.user;
      if (user.userType === 'service_provider') {
        navigate('/service-provider-dashboard');
      } else {
        const finalRedirect = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
        navigate(finalRedirect);
      }
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setIsLoading(false);
  };

  // Handle "Continue with Google" - for existing users (direct OAuth)
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    // Google OAuth endpoint is at /api/auth/google
    const apiUrl = import.meta.env.VITE_API_URL || 'https://isafarinetworkglobal-2.onrender.com/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                {suggestedRole === 'traveler' ? 'Sign in as Traveler' : 'Welcome Back'}
              </h1>
              <p className="text-muted-foreground">
                {suggestedRole === 'traveler' 
                  ? 'Sign in to start planning your journey' 
                  : 'Sign in to continue your journey with iSafari Global'
                }
              </p>
              {suggestedRole === 'traveler' && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="Calendar" size={16} className="text-primary" />
                    <p className="text-sm text-primary font-medium">
                      Journey planning requires a traveler account
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Continue with Google Button - For existing users */}
            <div className="mb-6">
              <Button
                variant="outline"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or sign in with email</span>
              </div>
            </div>

            {/* Error Display */}
            {(error || authError) && (
              <div className={`mb-6 p-4 rounded-lg ${
                (error || authError)?.includes('imefungiwa') || (error || authError)?.includes('blocked') 
                  ? 'bg-orange-100 border border-orange-300' 
                  : (error || authError)?.includes('not registered')
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-destructive/10 border border-destructive/20'
              }`}>
                <div className="flex items-start space-x-3">
                  <Icon 
                    name={(error || authError)?.includes('imefungiwa') || (error || authError)?.includes('blocked') ? 'ShieldX' : (error || authError)?.includes('not registered') ? 'Info' : 'AlertCircle'} 
                    size={20} 
                    className={(error || authError)?.includes('imefungiwa') || (error || authError)?.includes('blocked') ? 'text-orange-600 mt-0.5' : (error || authError)?.includes('not registered') ? 'text-blue-600 mt-0.5' : 'text-destructive mt-0.5'} 
                  />
                  <div>
                    <p className={`text-sm font-medium ${
                      (error || authError)?.includes('imefungiwa') || (error || authError)?.includes('blocked') 
                        ? 'text-orange-800' 
                        : (error || authError)?.includes('not registered')
                          ? 'text-blue-800'
                          : 'text-destructive'
                    }`}>
                      {error || authError}
                    </p>
                    {((error || authError)?.includes('imefungiwa') || (error || authError)?.includes('blocked')) && (
                      <p className="text-xs text-orange-600 mt-1">
                        Wasiliana na: support@isafari.co.tz
                      </p>
                    )}
                    {(error || authError)?.includes('not registered') && (
                      <Link 
                        to="/register" 
                        className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Icon name="UserPlus" size={14} className="mr-1" />
                        Click here to register
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="relative"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to={`/register${suggestedRole ? `?role=${suggestedRole}` : ''}`} 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up{suggestedRole === 'traveler' ? ' as Traveler' : ''}
                </Link>
              </p>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Powered by <span className="font-semibold">JEDA NETWORKS</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
