import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image - same as login page */}
      <div className="absolute inset-0">
        <img
          src="/hero-beach.jpg"
          alt="Tropical beach paradise"
          className="w-full h-full object-cover opacity-30"
          width={1920}
          height={1080}
        />
        {/* Gradient fade overlay */}
        <div className="absolute inset-0 gradient-fade-white opacity-80" />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Content */}
      <main className="relative z-20 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/LOGO.png"
                alt="BounceSteps"
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="font-bold text-2xl text-foreground">BounceSteps</span>
            </div>
            <p className="text-muted-foreground text-sm">Your gateway to extraordinary journeys</p>
          </div>

          <div className="bg-background/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-border">
            {!success ? (
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
                    No worries! Enter your email address and we'll send you instructions to reset your password.
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll send a password reset link to this email
                    </p>
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon name="Mail" size={20} />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-primary hover:underline font-medium"
                  >
                    <Icon name="ArrowLeft" size={16} className="mr-1" />
                    Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="CheckCircle2" size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-display font-medium text-foreground mb-3">
                    Check Your Email
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
                  </p>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Icon name="Info" size={20} className="text-primary mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm text-foreground font-medium mb-1">
                          Didn't receive the email?
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Check your spam or junk folder</li>
                          <li>• Make sure you entered the correct email</li>
                          <li>• Wait a few minutes and try again</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                    >
                      <Icon name="RotateCcw" size={20} />
                      Try Another Email
                    </Button>

                    <Link to="/login">
                      <Button variant="ghost" fullWidth>
                        <Icon name="ArrowLeft" size={20} />
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
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
