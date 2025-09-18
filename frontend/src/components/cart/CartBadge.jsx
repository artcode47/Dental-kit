import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartBadge = () => {
  const { t } = useTranslation('ecommerce');
  const { items } = useCart();

  const itemCount = Array.isArray(items) ? items.reduce((total, item) => total + (item.quantity || 0), 0) : 0;

  return (
    <Link
      to="/cart"
      className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartBadge; 