import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import { API_URL } from '../utils/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderTrackingId = searchParams.get('OrderTrackingId');
        const merchantReference = searchParams.get('OrderMerchantReference');

        if (!orderTrackingId) {
          setStatus('failed');
          setError('Missing payment tracking information');
          return;
        }

        console.log('🔍 Verifying payment:', { orderTrackingId, merchantReference });

        const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
        const token = userData.token;

        if (!token) {
          setStatus('failed');
          setError('Please login to verify payment');
          return;
        }

        const response = await fetch(
          `${API_URL}/payments/pesapal/callback?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${merchantReference || ''}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        console.log('📦 Payment verification response:', data);

        if (data.success) {
          setPaymentData(data.data);
          
          if (data.data.status === 'completed') {
            setStatus('success');
            // Clear cart on successful payment
            clearCart();
          } else if (data.data.status === 'failed') {
            setStatus('failed');
            setError('Payment was not completed');
          } else {
            setStatus('pending');
          }
        } else {
          setStatus('failed');
          setError(data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('❌ Payment verification error:', error);
        setStatus('failed');
        setError('Failed to verify payment: ' + error.message);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {status === 'verifying' && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Verifying Payment
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been processed successfully.
            </p>
            
            {paymentData && (
              <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium text-foreground">
                      TZS {paymentData.amount?.toLocaleString()}
                    </span>
                  </div>
                  {paymentData.confirmationCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmation:</span>
                      <span className="font-medium text-foreground">
                        {paymentData.confirmationCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">
                      {paymentData.pesapalStatus || 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="default"
                fullWidth
                onClick={() => navigate('/traveler-dashboard?tab=overview')}
              >
                <Icon name="LayoutDashboard" size={16} />
                View My Bookings
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/')}
              >
                <Icon name="Home" size={16} />
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="XCircle" size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Payment Failed
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Your payment could not be processed.'}
            </p>
            
            <div className="space-y-3">
              <Button
                variant="default"
                fullWidth
                onClick={() => navigate('/traveler-dashboard?tab=cart')}
              >
                <Icon name="ShoppingCart" size={16} />
                Try Again
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/')}
              >
                <Icon name="Home" size={16} />
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Payment Pending
            </h2>
            <p className="text-muted-foreground mb-6">
              Your payment is being processed. This may take a few minutes.
            </p>
            
            <div className="space-y-3">
              <Button
                variant="default"
                fullWidth
                onClick={() => navigate('/traveler-dashboard?tab=overview')}
              >
                <Icon name="LayoutDashboard" size={16} />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.location.reload()}
              >
                <Icon name="RefreshCw" size={16} />
                Check Status Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
