import React from 'react';
import { useCart } from '../contexts/CartContext';
import Icon from './AppIcon';
import Button from './ui/Button';

const CartSidebar = ({ onCheckout }) => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-background h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Your Cart ({getCartCount()})
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="ShoppingBag" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Add some services to get started</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground">
                          <Icon name="MapPin" size={12} className="inline mr-1" />
                          {item.location}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                        >
                          <Icon name="Minus" size={12} />
                        </button>
                        <span className="text-sm font-medium text-foreground w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                        >
                          <Icon name="Plus" size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="default" fullWidth onClick={onCheckout}>
                  <Icon name="CreditCard" size={16} />
                  Proceed to Payment
                </Button>
                <Button variant="outline" fullWidth onClick={() => setIsCartOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
