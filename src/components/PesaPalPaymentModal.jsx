import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { API_URL } from '../utils/api';

const PesaPalPaymentModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  selectedCartItems, 
  total, 
  onSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState(''); // 'mobile' or 'card'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!phoneNumber) {
      alert('Phone number is required');
      return;
    }

    setIsProcessing(true);

    try {
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login to continue');
        setIsProcessing(false);
        return;
      }

      // Prepare cart items for payment
      const selectedItems = cartItems.filter(item => selectedCartItems.has(item.id));
      
      const paymentData = {
        cartItems: selectedItems.map(item => ({
          serviceId: item.service_id || item.serviceId || item.id,
          providerId: item.provider_id || item.providerId,
          price: item.price,
          quantity: item.quantity || 1,
          startDate: item.journey_details?.startDate || new Date().toISOString().split('T')[0],
          endDate: item.journey_details?.endDate || new Date().toISOString().split('T')[0],
          guests: item.journey_details?.travelers || 1
        })),
        paymentMethod,
        phoneNumber,
        email: email || userData.email,
        firstName: firstName || userData.firstName,
        lastName: lastName || userData.lastName,
        total
      };

      console.log('💳 Initiating PesaPal payment:', paymentData);

      const response = await fetch(`${API_URL}/payments/pesapal/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      console.log('📦 PesaPal response:', data);

      if (data.success && data.data.redirectUrl) {
        console.log('✅ Redirecting to PesaPal:', data.data.redirectUrl);
        // Redirect to PesaPal payment page
        window.location.href = data.data.redirectUrl;
      } else {
        alert('❌ Payment initiation failed: ' + (data.message || 'Unknown error'));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('❌ Payment failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              PesaPal Payment
            </h2>
            <button 
              onClick={onClose} 
              className="text-muted-foreground hover:text-foreground"
              disabled={isProcessing}
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.filter(item => selectedCartItems.has(item.id)).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.title} x{item.quantity || 1}
                  </span>
                  <span className="text-foreground">TZS {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-primary">TZS {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method *
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile')}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    paymentMethod === 'mobile'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="Smartphone" size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-xs text-muted-foreground">M-Pesa, Tigo Pesa, Airtel Money</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="CreditCard" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Visa / MasterCard</p>
                      <p className="text-xs text-muted-foreground">Pay with your bank card</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone Number (Required for USSD) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="+255 123 456 789"
                value={phoneNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.startsWith('255')) {
                    value = '+' + value;
                  } else if (value.startsWith('0')) {
                    value = '+255' + value.substring(1);
                  } else if (!value.startsWith('+')) {
                    value = '+255' + value;
                  }
                  setPhoneNumber(value);
                }}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {paymentMethod === 'mobile' 
                  ? 'You will receive a USSD prompt on this number'
                  : 'Required for payment confirmation'}
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <Button
                type="submit"
                variant="default"
                fullWidth
                disabled={isProcessing || !paymentMethod || !phoneNumber}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Icon name="CreditCard" size={16} />
                    Pay TZS {total.toLocaleString()}
                  </>
                )}
              </Button>
            </div>

            {/* Info Notice */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {paymentMethod === 'mobile' 
                      ? 'You will be redirected to PesaPal and receive a USSD prompt on your phone to complete the payment.'
                      : 'You will be redirected to PesaPal secure payment page to enter your card details.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="Shield" size={16} className="text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Your payment is processed securely by PesaPal. We never store your payment details.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PesaPalPaymentModal;
