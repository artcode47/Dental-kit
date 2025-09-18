import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  DocumentChartBarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { getAnalytics, getDashboardStats, generateReport as generateReportApi } from '../../services/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';

const AdminReportsPage = () => {
  const { t } = useTranslation('admin');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'sales',
      name: t('admin.reports.salesReport'),
      description: t('admin.reports.salesReportDesc'),
      icon: CurrencyDollarIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      id: 'orders',
      name: t('admin.reports.ordersReport'),
      description: t('admin.reports.ordersReportDesc'),
      icon: ShoppingCartIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      id: 'users',
      name: t('admin.reports.usersReport'),
      description: t('admin.reports.usersReportDesc'),
      icon: UsersIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      id: 'products',
      name: t('admin.reports.productsReport'),
      description: t('admin.reports.productsReportDesc'),
      icon: ChartBarIcon,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900'
    },
    {
      id: 'reviews',
      name: t('admin.reports.reviewsReport'),
      description: t('admin.reports.reviewsReportDesc'),
      icon: StarIcon,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      id: 'inventory',
      name: t('admin.reports.inventoryReport'),
      description: t('admin.reports.inventoryReportDesc'),
      icon: TableCellsIcon,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900'
    }
  ];

  const dateRanges = [
    { value: '7d', label: t('admin.reports.last7Days') },
    { value: '30d', label: t('admin.reports.last30Days') },
    { value: '90d', label: t('admin.reports.last90Days') },
    { value: '1y', label: t('admin.reports.lastYear') },
    { value: 'custom', label: t('admin.reports.customRange') }
  ];

  const exportFormats = [
    { id: 'pdf', name: 'PDF', icon: DocumentTextIcon },
    { id: 'excel', name: 'Excel', icon: TableCellsIcon },
    { id: 'csv', name: 'CSV', icon: DocumentChartBarIcon }
  ];

  useEffect(() => {
    loadRecentReports();
  }, []);

  const loadRecentReports = async () => {
    try {
      setIsLoading(true);
      // Start with empty list; in future this can call /admin/reports
      setReports([]);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  const generateReport = async () => {
    if (showCustomDate && (!customStartDate || !customEndDate)) {
      toast.error(t('admin.reports.selectCustomDates'));
      return;
    }

    try {
      setIsGenerating(true);
      const period = showCustomDate ? 'custom' : dateRange;
      const params = { period };
      const result = await generateReportApi(selectedReportType, params);
      const newReport = {
        id: Date.now(),
        type: selectedReportType,
        name: `${getReportTypeMeta(selectedReportType).name} - ${new Date().toLocaleDateString()}`,
        generatedAt: new Date(),
        status: 'completed',
        size: '—',
        data: result.data
      };
      setGeneratedReport(newReport);
      setReports(prev => [newReport, ...prev]);
      toast.success(t('admin.reports.generated'));
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error(t('admin.reports.generateError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportId, format) => {
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${format.toUpperCase()} ${t('admin.reports.downloadSuccess')}`);
    } catch (err) {
      toast.error(t('admin.reports.downloadError'));
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm(t('admin.reports.confirmDelete'))) {
      try {
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (generatedReport?.id === reportId) {
          setGeneratedReport(null);
        }
        toast.success(t('admin.reports.deleteSuccess'));
      } catch (err) {
        toast.error(t('admin.reports.deleteError'));
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReportTypeInfo = (type) => {
    return reportTypes.find(r => r.id === type) || reportTypes[0];
  };

  const getReportTypeMeta = (type) => {
    return reportTypes.find(r => r.id === type) || reportTypes[0];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.reports.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.reports.subtitle')}
            </p>
          </div>
        </div>

        {/* Report Generation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.reports.generateNew')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('admin.reports.reportType')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportTypes.map((reportType) => {
                  const Icon = reportType.icon;
                  return (
                    <button
                      key={reportType.id}
                      onClick={() => setSelectedReportType(reportType.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedReportType === reportType.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${reportType.bgColor}`}>
                          <Icon className={`h-5 w-5 ${reportType.color}`} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {reportType.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {reportType.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('admin.reports.dateRange')}
              </label>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {dateRanges.slice(0, 4).map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleDateRangeChange(range.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        dateRange === range.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handleDateRangeChange('custom')}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    dateRange === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('admin.reports.customRange')}
                </button>

                {showCustomDate && (
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.reports.startDate')}
                      </label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('admin.reports.endDate')}
                      </label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner className="h-4 w-4" />
                      {t('admin.reports.generating')}
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="h-5 w-5" />
                      {t('admin.reports.generate')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Report Preview */}
        {generatedReport && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('admin.reports.latestReport')}
              </h3>
              <div className="flex gap-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => downloadReport(generatedReport.id, format.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title={`Download ${format.name}`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.reports.reportName')}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {generatedReport.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.reports.generatedAt')}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(generatedReport.generatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('admin.reports.fileSize')}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {generatedReport.size}
                  </p>
                </div>
              </div>
              
              {generatedReport.data?.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('admin.reports.summary')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('admin.reports.totalRecords')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {generatedReport.data.summary.totalRecords.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('admin.reports.totalValue')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(generatedReport.data.summary.totalValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('admin.reports.period')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {generatedReport.data.summary.period}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.reports.recentReports')}
            </h3>
            <Button variant="outline" size="sm">
              {t('admin.reports.viewAll')}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const reportType = getReportTypeInfo(report.type);
                const Icon = reportType.icon;
                return (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${reportType.bgColor}`}>
                        <Icon className={`h-5 w-5 ${reportType.color}`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(report.generatedAt)}</span>
                          <span>{report.size}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(report.status)}`}>
                            {t(`admin.reports.status.${report.status}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadReport(report.id, 'pdf')}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title={t('admin.reports.download')}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title={t('admin.reports.delete')}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Report Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.reports.templates')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: t('admin.reports.monthlySales'),
                description: t('admin.reports.monthlySalesDesc'),
                schedule: t('admin.reports.monthly')
              },
              {
                name: t('admin.reports.quarterlyReview'),
                description: t('admin.reports.quarterlyReviewDesc'),
                schedule: t('admin.reports.quarterly')
              },
              {
                name: t('admin.reports.annualReport'),
                description: t('admin.reports.annualReportDesc'),
                schedule: t('admin.reports.annually')
              }
            ].map((template, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {template.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {template.schedule}
                  </span>
                  <Button size="sm" variant="outline">
                    {t('admin.reports.schedule')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage; 