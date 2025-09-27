import React from 'react';
import {
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const OrdersTable = ({ 
  orders, 
  selectedOrders, 
  onSelectAll, 
  onSelectOrder, 
  onSort, 
  sortBy, 
  sortOrder, 
  formatCurrency, 
  formatDate, 
  getStatusBadgeColor, 
  getPaymentBadge, 
  getStatusIcon, 
  t, 
  onViewOrder,
  onDeleteOrder,
  onUpdateStatus,
  isSubmitting 
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left">
              <input 
                type="checkbox" 
                checked={selectedOrders.length === orders.length && orders.length > 0} 
                onChange={onSelectAll} 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:checked:bg-blue-600" 
              />
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('orders.order')}
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('orders.customer')}
            </th>
            <th 
              className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onSort('total')}
            >
              <div className="flex items-center gap-1">
                {t('orders.amount')}
                {sortBy === 'total' && (
                  sortOrder === 'asc' ? 
                    <ArrowUpIcon className="h-4 w-4" /> : 
                    <ArrowDownIcon className="h-4 w-4" />
                )}
              </div>
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('orders.status')}
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('orders.paymentMethod')}
            </th>
            <th 
              className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center gap-1">
                {t('orders.date')}
                {sortBy === 'createdAt' && (
                  sortOrder === 'asc' ? 
                    <ArrowUpIcon className="h-4 w-4" /> : 
                    <ArrowDownIcon className="h-4 w-4" />
                )}
              </div>
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('orders.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {(orders || []).map(order => {
            if (!order) return null;
            return (
              <tr 
                key={order.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.includes(order.id)} 
                    onChange={() => onSelectOrder(order.id)} 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:checked:bg-blue-600" 
                  />
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <ShoppingCartIcon className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.orderNumber || (order.id || '').slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.items?.length || 0} {t('orders.items')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400"/>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.user?.firstName && order.user?.lastName 
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : t('orders.noCustomerInfo')
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.user?.email || t('orders.noEmail')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items?.length || 0} {t('orders.items')}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{t(`orders.${order.status}`)}</span>
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {order.paymentMethod ? t(`orders.${order.paymentMethod}`) : t('orders.noPaymentMethod')}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400"/>
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
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
                      className="
                        min-w-[120px] px-3 py-1.5 text-sm font-medium
                        bg-white dark:bg-gray-700 
                        border border-gray-300 dark:border-gray-600 
                        rounded-lg shadow-sm
                        text-gray-700 dark:text-gray-200
                        hover:border-blue-400 dark:hover:border-blue-500
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-all duration-200 ease-in-out
                        cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                      " 
                      title={t('orders.updateStatus')}
                      disabled={isSubmitting}
                    >
                      <option value="" className="text-gray-500 dark:text-gray-400">
                        {t('orders.updateStatus')}
                      </option>
                      <option value="pending" className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700">
                        {t('orders.pending')}
                      </option>
                      <option value="processing" className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700">
                        {t('orders.processing')}
                      </option>
                      <option value="shipped" className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700">
                        {t('orders.shipped')}
                      </option>
                      <option value="delivered" className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700">
                        {t('orders.delivered')}
                      </option>
                      <option value="cancelled" className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700">
                        {t('orders.cancelled')}
                      </option>
                    </select>
                    <button 
                      onClick={() => onDeleteOrder(order.id)} 
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                      title={t('orders.delete')}
                      disabled={isSubmitting}
                    >
                      <TrashIcon className="h-4 w-4"/>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default OrdersTable;
