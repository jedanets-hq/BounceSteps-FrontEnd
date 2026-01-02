import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { PaymentModal, BookingConfirmation } from '../../components/PaymentSystem';
import { API_URL } from '../../utils/api';

const CartPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  const [preOrderingItem, setPreOrderingItem] = useState(null);

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

  // Handle Pre-Order - creates booking and removes from cart
  const handlePreOrder = async (item) => {
    try {
      setPreOrderingItem(item.id);
      
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Please login to create a pre-order');
        setPreOrderingItem(null);
        return;
      }

      // Use service_id (the actual service ID), not item.id (cart item ID)
      const serviceId = item.service_id || item.serviceId;
      console.log('📦 Pre-Order: Using service_id:', serviceId, 'from item:', item);

      if (!serviceId) {
        alert('Error: Service ID not found for this item');
        setPreOrderingItem(null);
        return;
      }

      // Create booking/pre-order
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: parseInt(serviceId),
          bookingDate: new Date().toISOString().split('T')[0], // Today's date
          participants: item.quantity || 1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove item from cart after successful pre-order (use cart item id)
        await removeFromCart(item.id);
        alert(`✅ Pre-order created successfully for "${item.title}"! Check "My Pre-Orders & Provider Feedback" in your dashboard.`);
      } else {
        alert('Failed to create pre-order: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating pre-order:', error);
      alert('Error creating pre-order. Please try again.');
    } finally {
      setPreOrderingItem(null);
    }
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
                      {cartItems.map((item) => {
                        // Get service image
                        const getItemImage = () => {
                          const imageData = item.images || item.image;
                          if (!imageData) return null;
                          
                          let images = [];
                          if (typeof imageData === 'string') {
                            try {
                              const parsed = JSON.parse(imageData);
                              images = Array.isArray(parsed) ? parsed : [parsed];
                            } catch (e) {
                              images = [imageData];
                            }
                          } else if (Array.isArray(imageData)) {
                            images = imageData;
                          }
                          
                          const validImages = images.filter(img => img && img.trim().length > 0);
                          return validImages.length > 0 ? validImages[0] : null;
                        };
                        
                        const itemImage = getItemImage();
                        
                        return (
                        <div key={item.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg border border-border">
                          {/* Service Image */}
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                            {itemImage ? (
                              <img 
                                src={itemImage} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex-col items-center justify-center text-gray-400 ${itemImage ? 'hidden' : 'flex'}`}>
                              <Icon name="Image" size={24} />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                              <Icon name="MapPin" size={14} />
                              <span className="truncate">{item.location}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                              <Icon name="Star" size={14} className="text-yellow-500" />
                              <span>{item.rating || '0.0'}</span>
                            </div>
                            {/* Price on mobile */}
                            <p className="font-semibold text-primary mt-2 lg:hidden">
                              TZS {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex flex-col lg:flex-row items-end lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
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
                            
                            {/* Price - hidden on mobile */}
                            <div className="text-right min-w-[100px] hidden lg:block">
                              <p className="font-semibold text-foreground">
                                TZS {(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                TZS {item.price?.toLocaleString()} each
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                              {/* Submit Pre-Order Button */}
                              <button
                                onClick={() => handlePreOrder(item)}
                                disabled={preOrderingItem === item.id}
                                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                title="Submit Pre-Order Request to Provider"
                              >
                                {preOrderingItem === item.id ? (
                                  <Icon name="Loader2" size={16} className="animate-spin" />
                                ) : (
                                  <Icon name="Send" size={16} />
                                )}
                                <span className="text-sm font-medium hidden sm:inline">Submit Pre-Order</span>
                              </button>
                              
                              {/* Delete/Remove Button - More Visible */}
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this item from cart?')) {
                                    removeFromCart(item.id);
                                  }
                                }}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                                title="Remove from Cart"
                              >
                                <Icon name="Trash2" size={16} />
                                <span className="text-sm font-medium hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )})}
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
                        <span className="text-foreground">TZS {getCartTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Fee</span>
                        <span className="text-foreground">TZS 0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxes</span>
                        <span className="text-foreground">Calculated at checkout</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="font-bold text-lg text-primary">
                            TZS {getCartTotal().toLocaleString()}
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
