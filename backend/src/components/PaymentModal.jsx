import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { paymentsAPI } from '../utils/api';

const PaymentModal = ({ isOpen, onClose, paymentType, serviceData, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPricingAndMethods();
    }
  }, [isOpen]);

  const fetchPricingAndMethods = async () => {
    try {
      const [pricingResponse, methodsResponse] = await Promise.all([
        paymentsAPI.getPricing(),
        paymentsAPI.getPaymentMethods()
      ]);
      
      setPricing(pricingResponse.pricing);
      setPaymentMethods(methodsResponse.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      let response;
      
      if (paymentType === 'premium') {
        response = await paymentsAPI.purchasePremiumMembership(
          serviceData.duration,
          paymentMethod,
          phoneNumber,
          currency
        );
      } else if (paymentType === 'featured') {
        response = await paymentsAPI.purchaseFeaturedService(
          serviceData.serviceId,
          serviceData.duration,
          paymentMethod,
          phoneNumber,
          currency
        );
      }

      if (response.success) {
        if (paymentMethod === 'stripe' && response.payment.clientSecret) {
          // Handle Stripe payment
          await handleStripePayment(response.payment.clientSecret);
        } else if (paymentMethod === 'mpesa') {
          // M-Pesa payment initiated, show success message
          onSuccess({
            message: 'M-Pesa payment request sent to your phone. Please complete the payment.',
            paymentId: response.payment.id
          });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async (clientSecret) => {
    // In a real implementation, you would use Stripe Elements here
    // For now, we'll simulate a successful payment
    setTimeout(() => {
      onSuccess({
        message: 'Payment successful! Your premium features are now active.',
        paymentId: clientSecret
      });
    }, 2000);
  };

  const getCurrentPricing = () => {
    if (!pricing) return null;
    
    if (paymentType === 'premium') {
      return pricing.premiumMembership[serviceData.duration];
    } else if (paymentType === 'featured') {
      return pricing.featuredService[serviceData.duration];
    }
    return null;
  };

  const currentPricing = getCurrentPricing();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {paymentType === 'premium' ? 'Premium Membership' : 'Featured Service'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {currentPricing && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {paymentType === 'premium' ? 'Premium Membership' : 'Featured Service'} - {serviceData.duration}
              </span>
              <span className="text-lg font-bold">
                {currency === 'USD' ? `$${currentPricing.amount}` : `KES ${currentPricing.amountKES}`}
              </span>
            </div>
            <p className="text-sm text-gray-600">{currentPricing.duration}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="KES">KES (KSh)</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <CreditCard className="mr-2" size={20} />
              <span>Credit/Debit Card</span>
            </label>
            
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="mpesa"
                checked={paymentMethod === 'mpesa'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <Smartphone className="mr-2" size={20} />
              <span>M-Pesa</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'mpesa' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254712345678"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter your M-Pesa registered phone number</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || (paymentMethod === 'mpesa' && !phoneNumber)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <DollarSign size={16} className="mr-1" />
                Pay Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
