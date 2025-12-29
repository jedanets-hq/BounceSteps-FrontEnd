import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { PaymentModal, BookingConfirmation } from '../../components/PaymentSystem';

const CartPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=cart');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add some services first!');
      return;
    }
    setShowPayment(true);
  };

  const handleContinueShopping = () => {
    navigate('/journey-planner');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-medium text-foreground">
                  My Cart
                </h1>
                <p className="text-muted-foreground mt-2">
                  {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleContinueShopping}>
                  <Icon name="ArrowLeft" size={16} />
                  Continue Shopping
                </Button>
                {cartItems.length > 0 && (
                  <Button variant="ghost" onClick={clearCart} className="text-red-600 hover:text-red-700">
                    <Icon name="Trash2" size={16} />
                    Clear Cart
                  </Button>
                )}
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart State
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Icon name="ShoppingBag" size={64} className="text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">
                  Start planning your journey and add some amazing services to your cart.
                </p>
                <div className="space-y-3">
                  <Link to="/journey-planner">
                    <Button variant="default" fullWidth>
                      <Icon name="Route" size={16} />
                      Plan Your Journey
                    </Button>
                  </Link>
                  <Link to="/destination-discovery">
                    <Button variant="outline" fullWidth>
                      <Icon name="Search" size={16} />
                      Discover Destinations
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Cart Items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-lg shadow-sm border border-border">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Cart Items</h2>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                              <Icon name="MapPin" size={14} />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                              <Icon name="Star" size={14} className="text-yellow-500" />
                              <span>{item.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                              >
                                <Icon name="Minus" size={14} />
                              </button>
                              <span className="text-sm font-medium text-foreground w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                              >
                                <Icon name="Plus" size={14} />
                              </button>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right min-w-[80px]">
                              <p className="font-semibold text-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${item.price} each
                              </p>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg shadow-sm border border-border sticky top-24">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({getCartCount()} items)</span>
                        <span className="text-foreground">${getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Fee</span>
                        <span className="text-foreground">$0.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxes</span>
                        <span className="text-foreground">Calculated at checkout</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="font-bold text-lg text-primary">
                            ${getCartTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button variant="default" fullWidth onClick={handleCheckout}>
                        <Icon name="CreditCard" size={16} />
                        Proceed to Checkout
                      </Button>
                      <Button variant="outline" fullWidth onClick={handleContinueShopping}>
                        <Icon name="ArrowLeft" size={16} />
                        Continue Shopping
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Secure Checkout</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your payment information is encrypted and secure.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        cartItems={cartItems}
        total={getCartTotal()}
        onPaymentSuccess={(bookingData) => {
          setBooking(bookingData);
          setShowPayment(false);
        }}
      />
      
      {/* Booking Confirmation */}
      <BookingConfirmation
        booking={booking}
        onClose={() => {
          setBooking(null);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default CartPage;
