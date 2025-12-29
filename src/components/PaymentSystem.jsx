import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

export const PaymentModal = ({ isOpen, onClose, cartItems, total, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    mpesaNumber: '',
    tigopesaNumber: '',
    airtelNumber: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'CreditCard' },
    { id: 'mpesa', name: 'M-Pesa', icon: 'Phone' },
    { id: 'tigopesa', name: 'Tigo Pesa', icon: 'Phone' },
    { id: 'airtel', name: 'Airtel Money', icon: 'Phone' }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create booking record
    const booking = {
      id: Date.now(),
      items: cartItems,
      total: total,
      paymentMethod: paymentMethod,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      bookingReference: `ISG-${Date.now().toString().slice(-6)}`
    };
    
    // Save booking to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('isafari_bookings') || '[]');
    localStorage.setItem('isafari_bookings', JSON.stringify([...existingBookings, booking]));
    
    setIsProcessing(false);
    onPaymentSuccess(booking);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Complete Payment</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.title} x{item.quantity}
                  </span>
                  <span className="text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name={method.icon} size={16} />
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="mb-6">
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'mpesa' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">M-Pesa Number</label>
                <input
                  type="tel"
                  placeholder="+255 123 456 789"
                  value={paymentData.mpesaNumber}
                  onChange={(e) => setPaymentData({...paymentData, mpesaNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You will receive an M-Pesa prompt to complete payment
                </p>
              </div>
            )}

            {paymentMethod === 'tigopesa' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tigo Pesa Number</label>
                <input
                  type="tel"
                  placeholder="+255 123 456 789"
                  value={paymentData.tigopesaNumber}
                  onChange={(e) => setPaymentData({...paymentData, tigopesaNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You will receive a Tigo Pesa prompt to complete payment
                </p>
              </div>
            )}

            {paymentMethod === 'airtel' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Airtel Money Number</label>
                <input
                  type="tel"
                  placeholder="+255 123 456 789"
                  value={paymentData.airtelNumber}
                  onChange={(e) => setPaymentData({...paymentData, airtelNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You will receive an Airtel Money prompt to complete payment
                </p>
              </div>
            )}
          </div>

          {/* Payment Button */}
          <Button
            variant="default"
            fullWidth
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Icon name="CreditCard" size={16} />
                Pay ${total.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const BookingConfirmation = ({ booking, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">Your booking has been successfully processed</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Reference</span>
            <span className="font-medium text-foreground">{booking.bookingReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium text-foreground">${booking.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium text-foreground capitalize">{booking.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Confirmed
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="default" fullWidth onClick={onClose}>
            <Icon name="Home" size={16} />
            Back to Dashboard
          </Button>
          <Button variant="outline" fullWidth onClick={() => window.print()}>
            <Icon name="Download" size={16} />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
