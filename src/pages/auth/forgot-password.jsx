import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import api from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call API to send reset password email
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      // Even if email doesn't exist, show success for security
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="KeyRound" size={32} className="text-primary" />
                  </div>
                  <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-muted-foreground">
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="AlertCircle" size={20} className="text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}

                {/* Reset Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="Mail" size={20} className="text-muted-foreground" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={20} />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <Icon name="ArrowLeft" size={16} className="mr-1" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-display font-medium text-foreground mb-2">
                  Check Your Email
                </h2>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                  >
                    <Icon name="RefreshCw" size={18} />
                    Try Another Email
                  </Button>
                  
                  <Link to="/login">
                    <Button variant="ghost" fullWidth>
                      <Icon name="ArrowLeft" size={18} />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Powered by <span className="font-semibold">JEDA NETWORKS</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
