import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { API_URL } from '../../utils/api';

const GoogleRoleSelection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleData, setGoogleData] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Get Google data from URL params
    const googleDataParam = searchParams.get('googleData');
    if (googleDataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(googleDataParam));
        setGoogleData(data);
      } catch (e) {
        console.error('Error parsing Google data:', e);
        setError('Invalid Google data. Please try again.');
      }
    } else {
      setError('No Google data found. Please try signing in again.');
    }
  }, [searchParams]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select how you want to use iSafari Global');
      return;
    }

    if (!phone) {
      setError('Phone number is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Register the Google user with selected role
      const response = await fetch(`${API_URL}/auth/google/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          googleId: googleData.googleId,
          email: googleData.email,
          firstName: googleData.firstName,
          lastName: googleData.lastName,
          avatarUrl: googleData.avatarUrl,
          userType: selectedRole === 'provider' ? 'service_provider' : 'traveler',
          phone: phone
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        const userWithToken = { ...data.user, token: data.token };
        localStorage.setItem('isafari_user', JSON.stringify(userWithToken));
        
        // Navigate to appropriate dashboard
        if (selectedRole === 'provider') {
          navigate('/service-provider-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!googleData && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {googleData?.avatarUrl && (
                <img 
                  src={googleData.avatarUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary/20"
                />
              )}
              <h1 className="text-3xl font-display font-medium text-foreground mb-2">
                Welcome, {googleData?.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Complete your registration to start using iSafari Global
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Signed in as: {googleData?.email}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  How would you like to use iSafari Global?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('traveler')}
                    className={`p-6 border-2 rounded-lg transition-all text-left ${
                      selectedRole === 'traveler'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedRole === 'traveler' ? 'bg-primary/20' : 'bg-primary/10'
                      }`}>
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Traveler</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Explore destinations, book services, and plan your perfect trip
                    </p>
                    {selectedRole === 'traveler' && (
                      <div className="mt-3 flex items-center text-primary text-sm">
                        <Icon name="Check" size={16} className="mr-1" />
                        Selected
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('provider')}
                    className={`p-6 border-2 rounded-lg transition-all text-left ${
                      selectedRole === 'provider'
                        ? 'border-secondary bg-secondary/5 shadow-md'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedRole === 'provider' ? 'bg-secondary/20' : 'bg-secondary/10'
                      }`}>
                        <Icon name="Briefcase" size={24} className="text-secondary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Service Provider</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      List your services and connect with travelers worldwide
                    </p>
                    {selectedRole === 'provider' && (
                      <div className="mt-3 flex items-center text-secondary text-sm">
                        <Icon name="Check" size={16} className="mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 XXX XXX XXX"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll use this to contact you about your bookings
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                disabled={isLoading || !selectedRole}
                className="mt-6"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Icon name="UserPlus" size={20} />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-semibold">JEDA NETWORKS</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoogleRoleSelection;
