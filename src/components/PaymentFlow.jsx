import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

export const PaymentFlow = ({ isOpen, onClose, cartItems, total, onPaymentSuccess }) => {
  // Debug logging
  console.log('🛒 PaymentFlow - isOpen:', isOpen);
  console.log('🛒 PaymentFlow - cartItems:', cartItems);
  console.log('💰 PaymentFlow - total:', total);
  
  // If cartItems are already pre-selected (from cart page), skip selection step
  const hasPreSelectedItems = cartItems && cartItems.length > 0;
  const initialStep = hasPreSelectedItems ? 'method' : 'selection';
  
  console.log('🔄 PaymentFlow - hasPreSelectedItems:', hasPreSelectedItems);
  console.log('🔄 PaymentFlow - initialStep:', initialStep);
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedItems, setSelectedItems] = useState(hasPreSelectedItems ? cartItems : []);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    mobileNumber: '',
    mobileProvider: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Update selected items when cartItems change
  useEffect(() => {
    console.log('🔄 PaymentFlow useEffect - cartItems changed:', cartItems);
    if (hasPreSelectedItems) {
      setSelectedItems(cartItems);
      setCurrentStep('method');
    }
  }, [cartItems, hasPreSelectedItems]);

  const resetFlow = () => {
    const hasPreSelectedItems = cartItems && cartItems.length > 0;
    const initialStep = hasPreSelectedItems ? 'method' : 'selection';
    setCurrentStep(initialStep);
    setSelectedItems(hasPreSelectedItems ? cartItems : []);
    setPaymentMethod('');
    setPaymentData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      mobileNumber: '',
      mobileProvider: ''
    });
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === 'card') {
      setCurrentStep('card');
    } else if (method === 'mobile') {
      setCurrentStep('mobile');
    }
  };

  const handleItemSelection = (item, isSelected) => {
    console.log('🖱️ Item clicked:', item.title, 'isSelected:', isSelected);
    console.log('🖱️ Current selectedItems before:', selectedItems);
    if (isSelected) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
    }
    console.log('🖱️ Current selectedItems after:', selectedItems);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...cartItems]);
    }
  };

  const proceedToPayment = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one service to proceed with payment');
      return;
    }
    setCurrentStep('method');
  };

  const getSelectedTotal = () => {
    // If total is provided (from cart page), use it
    if (total !== undefined && total !== null) {
      return total;
    }
    // Otherwise calculate from selected items
    return selectedItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get user token
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;
      
      if (!token) {
        alert('Please login to complete payment');
        setIsProcessing(false);
        return;
      }
      
      // Create bookings for each selected cart item
      const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
      
      if (!API_URL) {
        throw new Error('API URL not configured. Please check environment variables.');
      }
      
      console.log('💳 [PAYMENT] Processing payment for', selectedItems.length, 'items');
      
      // Create booking for each selected service in cart
      for (const item of selectedItems) {
        console.log('📝 Creating booking for service:', item.id);
        
        const bookingResponse = await fetch(`${API_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            serviceId: item.id || item.service_id,
            bookingDate: new Date().toISOString().split('T')[0],
            participants: item.journey_details?.travelers || 1,
            specialRequests: `Payment Method: ${paymentMethod}`
          })
        });
        
        const bookingData = await bookingResponse.json();
        console.log('📥 Booking response:', bookingData);
        
        if (!bookingData.success) {
          console.error('❌ Failed to create booking:', bookingData.message);
          alert('Error creating booking: ' + bookingData.message);
          setIsProcessing(false);
          return;
        }
      }
      
      // Create booking record for UI
      const booking = {
        id: Date.now(),
        items: selectedItems,
        total: getSelectedTotal(),
        paymentMethod: paymentMethod,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        bookingReference: `ISG-${Date.now().toString().slice(-6)}`
      };
      
      // Save booking to localStorage as backup
      const existingBookings = JSON.parse(localStorage.getItem('isafari_bookings') || '[]');
      localStorage.setItem('isafari_bookings', JSON.stringify([...existingBookings, booking]));
      
      console.log('✅ Payment processed successfully');
      setIsProcessing(false);
      onPaymentSuccess(booking);
      resetFlow();
      onClose();
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Payment failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {(currentStep === 'method' || currentStep === 'card' || currentStep === 'mobile') && (
                <button
                  onClick={() => {
                    if (currentStep === 'method') {
                      // If we have pre-selected items, close modal instead of going to selection
                      if (cartItems && cartItems.length > 0) {
                        handleClose();
                      } else {
                        setCurrentStep('selection');
                      }
                    } else {
                      setCurrentStep('method');
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="ArrowLeft" size={20} />
                </button>
              )}
              <h2 className="text-xl font-semibold text-foreground">
                {currentStep === 'selection' && 'Chagua Huduma'}
                {currentStep === 'method' && 'Chagua Njia ya Malipo'}
                {currentStep === 'card' && 'Malipo ya Kadi'}
                {currentStep === 'mobile' && 'Mobile Money'}
              </h2>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Order Summary - Show selected items only when not in selection step */}
          {currentStep !== 'selection' && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.title} x{item.quantity}
                    </span>
                    <span className="text-foreground">TZS {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-primary">TZS {getSelectedTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Selection Step */}
          {currentStep === 'selection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">Select services to proceed with payment</h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {selectedItems.length === cartItems.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="ShoppingCart" size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cartItems.map((item, index) => {
                    const isSelected = selectedItems.some(selected => selected.id === item.id);
                    const itemTitle = item.title || item.name || `Service ${index + 1}`;
                    const itemCategory = item.category || 'Service';
                    const itemLocation = item.location || 'Location not specified';
                    const itemQuantity = item.quantity || 1;
                    const itemPrice = item.price || 0;
                    
                    return (
                      <div
                        key={item.id || index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🖱️ Clicking item:', itemTitle);
                          handleItemSelection(item, !isSelected);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleItemSelection(item, !isSelected);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3 pointer-events-none">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}>
                              {isSelected && (
                                <Icon name="Check" size={12} className="text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm">{itemTitle}</h4>
                            <p className="text-xs text-muted-foreground">{itemCategory}</p>
                            <p className="text-xs text-muted-foreground">
                              <Icon name="MapPin" size={12} className="inline mr-1" />
                              {itemLocation}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                Quantity: {itemQuantity}
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                TZS {(itemPrice * itemQuantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">
                        Selected ({selectedItems.length} items)
                      </span>
                      <span className="text-lg font-bold text-primary">
                        TZS {getSelectedTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    fullWidth
                    onClick={proceedToPayment}
                    disabled={selectedItems.length === 0}
                  >
                    <Icon name="CreditCard" size={16} />
                    Proceed to Payment ({selectedItems.length} items)
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          {currentStep === 'method' && (
            <div className="space-y-4">
              <h3 className="font-medium text-foreground mb-4">Chagua Njia ya Malipo</h3>
              
              {/* Card Payment Option */}
              <button
                onClick={() => handleMethodSelect('card')}
                className="w-full p-4 border border-border rounded-lg hover:border-primary/50 transition-all text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon name="CreditCard" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Visa / MasterCard</h4>
                    <p className="text-sm text-muted-foreground">Lipa kwa kadi yako ya benki au credit card</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground ml-auto" />
                </div>
              </button>

              {/* Mobile Money Option */}
              <button
                onClick={() => handleMethodSelect('mobile')}
                className="w-full p-4 border border-border rounded-lg hover:border-primary/50 transition-all text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Icon name="Smartphone" size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Mobile Money</h4>
                    <p className="text-sm text-muted-foreground">M-Pesa, Tigo Pesa, Airtel Money</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground ml-auto" />
                </div>
              </button>
            </div>
          )}

          {/* Card Payment Form */}
          {currentStep === 'card' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="CreditCard" size={20} className="text-primary" />
                <span className="text-sm text-muted-foreground">Ingiza maelezo ya kadi yako</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Namba ya Kadi</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => {
                    // Format card number with spaces
                    const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                    if (value.replace(/\s/g, '').length <= 16) {
                      setPaymentData({...paymentData, cardNumber: value});
                    }
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  maxLength="19"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tarehe ya Mwisho</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => {
                      // Format expiry date
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                      }
                      setPaymentData({...paymentData, expiryDate: value});
                    }}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setPaymentData({...paymentData, cvv: value});
                      }
                    }}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                    maxLength="4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Jina la Mmiliki wa Kadi</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="mt-6">
                <Button
                  variant="default"
                  fullWidth
                  onClick={handlePayment}
                  disabled={isProcessing || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardName}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                      Inachakata Malipo...
                    </div>
                  ) : (
                    <>
                      <Icon name="CreditCard" size={16} />
                      Lipa TZS {getSelectedTotal().toLocaleString()}
                    </>
                  )}
                </Button>
              </div>

              {/* Card validation info */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Hakikisha maelezo ya kadi yako ni sahihi. Utapokea ujumbe wa kuthibitisha kwenye simu yako.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Money Form */}
          {currentStep === 'mobile' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Smartphone" size={20} className="text-green-600" />
                <span className="text-sm text-muted-foreground">Chagua mtoa huduma wa mobile money</span>
              </div>

              {/* Mobile Provider Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground mb-2">Chagua Mtoa Huduma</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'mpesa', name: 'M-Pesa', color: 'bg-green-100 text-green-600' },
                    { id: 'tigopesa', name: 'Tigo Pesa', color: 'bg-blue-100 text-blue-600' },
                    { id: 'airtel', name: 'Airtel Money', color: 'bg-red-100 text-red-600' }
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setPaymentData({...paymentData, mobileProvider: provider.id})}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        paymentData.mobileProvider === provider.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${provider.color}`}>
                          <Icon name="Smartphone" size={16} />
                        </div>
                        <span className="font-medium">{provider.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number Input */}
              {paymentData.mobileProvider && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Namba ya Simu</label>
                  <input
                    type="tel"
                    placeholder="+255 123 456 789"
                    value={paymentData.mobileNumber}
                    onChange={(e) => {
                      // Format phone number
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.startsWith('255')) {
                        value = '+' + value;
                      } else if (value.startsWith('0')) {
                        value = '+255' + value.substring(1);
                      } else if (!value.startsWith('+')) {
                        value = '+255' + value;
                      }
                      setPaymentData({...paymentData, mobileNumber: value});
                    }}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Utapokea ujumbe kwenye simu yako ili ukamilishe malipo
                  </p>
                </div>
              )}

              {paymentData.mobileProvider && paymentData.mobileNumber && (
                <div className="mt-6">
                  <Button
                    variant="default"
                    fullWidth
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                        Inachakata Malipo...
                      </div>
                    ) : (
                      <>
                        <Icon name="Smartphone" size={16} />
                        Lipa TZS {getSelectedTotal().toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Mobile Money Info */}
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Baada ya kubonyeza "Lipa", utapokea ujumbe wa USSD kwenye simu yako. Fuata maagizo ili ukamilishe malipo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Shield" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>
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
          <h2 className="text-xl font-semibold text-foreground mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground">Your booking has been confirmed</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Reference</span>
            <span className="font-medium text-foreground">{booking.bookingReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-medium text-foreground">TZS {booking.total.toLocaleString()}</span>
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