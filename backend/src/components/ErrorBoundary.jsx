import React from "react";
import Icon from "./AppIcon";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error) {
    // Detect error type
    let errorType = 'unknown';
    if (error.message && error.message.includes('must be used within')) {
      errorType = 'context';
    } else if (error.message && error.message.includes('Network')) {
      errorType = 'network';
    } else if (error.message && error.message.includes('auth')) {
      errorType = 'auth';
    }
    
    return { 
      hasError: true,
      errorType
    };
  }

  componentDidCatch(error, errorInfo) {
    error.__ErrorBoundary = true;
    window.__COMPONENT_ERROR__?.(error, errorInfo);
    
    // Enhanced logging with error details
    console.group('🚨 Error caught by ErrorBoundary');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
    
    // Store error details in state
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    // Clear any cached state
    sessionStorage.clear();
    window.location.reload();
  };

  handleGoHome = () => {
    // Clear any cached state
    sessionStorage.clear();
    window.location.href = "/";
  };

  render() {
    if (this.state?.hasError) {
      const { errorType, error } = this.state;
      
      // Context-specific error message
      let errorTitle = "Something went wrong";
      let errorMessage = "We encountered an unexpected error while processing your request.";
      let actionText = "Try Again";
      let actionHandler = this.handleReload;
      
      if (errorType === 'context') {
        errorTitle = "Application Error";
        errorMessage = "There was a problem loading the application. This might be due to a configuration issue. Please try refreshing the page or logging in again.";
        actionText = "Reload Page";
        actionHandler = this.handleReload;
      } else if (errorType === 'network') {
        errorTitle = "Connection Error";
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
        actionText = "Retry";
        actionHandler = this.handleReload;
      } else if (errorType === 'auth') {
        errorTitle = "Authentication Error";
        errorMessage = "Your session may have expired. Please log in again.";
        actionText = "Go to Login";
        actionHandler = () => window.location.href = "/login";
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center p-8 max-w-md">
            <div className="flex justify-center items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="42px" height="42px" viewBox="0 0 32 33" fill="none">
                <path d="M16 28.5C22.6274 28.5 28 23.1274 28 16.5C28 9.87258 22.6274 4.5 16 4.5C9.37258 4.5 4 9.87258 4 16.5C4 23.1274 9.37258 28.5 16 28.5Z" stroke="#343330" strokeWidth="2" strokeMiterlimit="10" />
                <path d="M11.5 15.5C12.3284 15.5 13 14.8284 13 14C13 13.1716 12.3284 12.5 11.5 12.5C10.6716 12.5 10 13.1716 10 14C10 14.8284 10.6716 15.5 11.5 15.5Z" fill="#343330" />
                <path d="M20.5 15.5C21.3284 15.5 22 14.8284 22 14C22 13.1716 21.3284 12.5 20.5 12.5C19.6716 12.5 19 13.1716 19 14C19 14.8284 19.6716 15.5 20.5 15.5Z" fill="#343330" />
                <path d="M21 22.5C19.9625 20.7062 18.2213 19.5 16 19.5C13.7787 19.5 12.0375 20.7062 11 22.5" stroke="#343330" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <h1 className="text-2xl font-medium text-neutral-800">{errorTitle}</h1>
              <p className="text-neutral-600 text-base w-10/12 mx-auto">{errorMessage}</p>
            </div>
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={this.handleGoHome}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Icon name="Home" size={18} color="#fff" />
                Home
              </button>
              <button
                onClick={actionHandler}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Icon name="RefreshCw" size={18} color="#fff" />
                {actionText}
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left bg-red-50 p-4 rounded border border-red-200">
                <summary className="cursor-pointer text-red-800 font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-700 overflow-auto">
                  {error.toString()}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props?.children;
  }
}

export default ErrorBoundary;