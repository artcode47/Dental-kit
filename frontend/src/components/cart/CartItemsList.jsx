import React from 'react';
import CartItem from './CartItem';

const CartItemsList = ({ 
  items, 
  onQuantityChange, 
  onRemoveItem, 
  updatingItem 
}) => {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemoveItem={onRemoveItem}
          updatingItem={updatingItem}
        />
      ))}
    </div>
  );
};

export default CartItemsList; 