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
  const { login, loginWithGoogle, error: authError } = useAuth();

  // Get redirect and role from URL params - default to home page for travelers
  const redirectTo = searchParams.get('redirect') || '/';
  const suggestedRole = searchParams.get('role');

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
      // Redirect to the original page or home after successful login
      const finalRedirect = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
      navigate(finalRedirect);
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    const result = await loginWithGoogle();
    
    if (result.success) {
      // Redirect to the original page or home after successful Google login
      const finalRedirect = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
      navigate(finalRedirect);
    } else {
      setError(result.error || 'Google login failed. Please try again.');
    }
    
    setIsLoading(false);
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

            {/* Error Display */}
            {(error || authError) && (
              <div className={`mb-6 p-4 rounded-lg ${
                (error || authError).includes('imefungiwa') || (error || authError).includes('blocked') 
                  ? 'bg-orange-100 border border-orange-300' 
                  : 'bg-destructive/10 border border-destructive/20'
              }`}>
                <div className="flex items-start space-x-3">
                  <Icon 
                    name={(error || authError).includes('imefungiwa') || (error || authError).includes('blocked') ? 'ShieldX' : 'AlertCircle'} 
                    size={20} 
                    className={(error || authError).includes('imefungiwa') || (error || authError).includes('blocked') ? 'text-orange-600 mt-0.5' : 'text-destructive mt-0.5'} 
                  />
                  <div>
                    <p className={`text-sm font-medium ${
                      (error || authError).includes('imefungiwa') || (error || authError).includes('blocked') 
                        ? 'text-orange-800' 
                        : 'text-destructive'
                    }`}>
                      {error || authError}
                    </p>
                    {((error || authError).includes('imefungiwa') || (error || authError).includes('blocked')) && (
                      <p className="text-xs text-orange-600 mt-1">
                        Wasiliana na: support@isafari.co.tz
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <Button
              variant="outline"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mb-6"
            >
              <Icon name="Chrome" size={20} />
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
              </div>
            </div>

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
