import React from 'react';
import {
  ShoppingCartIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const OrdersGrid = ({ 
  orders, 
  selectedOrders, 
  onSelectOrder, 
  formatCurrency, 
  formatDate, 
  getStatusBadgeColor, 
  getPaymentBadge, 
  getStatusIcon, 
  t, 
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  isSubmitting 
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
    {(orders || []).map(order => {
      if (!order) return null;
      return (
        <div 
          key={order.id} 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                checked={selectedOrders.includes(order.id)} 
                onChange={() => onSelectOrder(order.id)} 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 dark:bg-gray-700 dark:border-gray-500 dark:checked:bg-blue-600" 
              />
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ShoppingCartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                #{order.orderNumber || (order.id || '').slice(-8)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Customer */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <UserIcon className="h-3 w-3 text-gray-500 dark:text-gray-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {order.user?.firstName} {order.user?.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {order.user?.email}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('orders.amount')}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(order.total)}
              </span>
            </div>

            {/* Items */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('orders.items')}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {order.items?.length || 0}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('orders.status')}</span>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{t(`orders.${order.status}`)}</span>
              </span>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('orders.payment')}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                {t(`orders.${order.paymentStatus}`)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-1">
              <button 
                className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                title={t('orders.view')}
                onClick={() => onViewOrder(order)}
              >
                <EyeIcon className="h-4 w-4"/>
              </button>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdateStatus(order.id, e.target.value);
                    e.target.value = '';
                  }
                }} 
                className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-transparent border-none cursor-pointer rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:ring-2 focus:ring-blue-500" 
                title={t('orders.updateStatus')}
                disabled={isSubmitting}
              >
                <option value="">⚙️</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="processing">{t('orders.processing')}</option>
                <option value="shipped">{t('orders.shipped')}</option>
                <option value="delivered">{t('orders.delivered')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
              <button 
                className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
                title={t('orders.edit')}
                onClick={() => onEditOrder(order)}
              >
                <PencilIcon className="h-4 w-4"/>
              </button>
            </div>
            <button 
              onClick={() => onDeleteOrder(order.id)} 
              className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
              title={t('orders.delete')}
              disabled={isSubmitting}
            >
              <TrashIcon className="h-4 w-4"/>
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export default OrdersGrid;
