import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  HomeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: crypto.randomUUID()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to external service in production
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to your error tracking service
    // For now, we'll just log it
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous'
    };

    // Send to your error tracking service (e.g., Sentry, LogRocket, etc.)
    console.error('Error logged:', errorData);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  handleGoBack = () => {
    window.history.back();
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
        onGoBack={this.handleGoBack}
      />;
    }

    return this.props.children;
  }
}

// Error Fallback Component
const ErrorFallback = ({ 
  error, 
  errorInfo, 
  errorId, 
  onRetry, 
  onGoHome, 
  onGoBack 
}) => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('error.somethingWentWrong')}
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('error.unexpectedError')}
          </p>

          {/* Error ID for debugging */}
          {errorId && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Error ID: {errorId}
              </p>
              {typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && error && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                    Show Error Details
                  </summary>
                  <pre className="text-xs text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap">
                    {error.toString()}
                    {errorInfo && errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onRetry}
              variant="primary"
              fullWidth
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              {t('error.tryAgain')}
            </Button>

            <div className="flex space-x-3">
              <Button
                onClick={onGoBack}
                variant="outline"
                size="sm"
                icon={<ArrowLeftIcon className="w-4 h-4" />}
                className="flex-1"
              >
                {t('error.goBack')}
              </Button>

              <Button
                onClick={onGoHome}
                variant="outline"
                size="sm"
                icon={<HomeIcon className="w-4 h-4" />}
                className="flex-1"
              >
                {t('error.goHome')}
              </Button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('error.contactSupport')}
            </p>
            <a 
              href="mailto:support@dentalkit.com" 
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              support@dentalkit.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary; 