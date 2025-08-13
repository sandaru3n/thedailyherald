'use client';

import React from 'react';

interface MobileMenuErrorBoundaryState {
  hasError: boolean;
}

interface MobileMenuErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class MobileMenuErrorBoundary extends React.Component<MobileMenuErrorBoundaryProps, MobileMenuErrorBoundaryState> {
  constructor(props: MobileMenuErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MobileMenuErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('MobileMenuErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Menu Error
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                There was an issue loading the mobile menu. Please try again.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileMenuErrorBoundary;
