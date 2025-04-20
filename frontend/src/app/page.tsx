'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChartBarIcon, ArrowRightIcon, DocumentTextIcon, ChartPieIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">CSV Analytics</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Analyze your CSV data <span className="text-blue-600">in seconds</span>
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Upload your CSV files and get instant insights with interactive visualizations
                and advanced analytics. No coding required.
              </p>
              <div className="mt-8 flex">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get started
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                  </Link>
                </div>
                <div className="ml-3 inline-flex">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Try demo
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:ml-8">
              <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="bg-blue-600 px-5 py-4">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-white text-sm">CSV Analytics Dashboard</div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="rounded-md shadow-md overflow-hidden">
                    <div className="bg-gray-800 text-white p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <div className="ml-3 text-sm">CSV Analytics Dashboard</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 p-4">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="col-span-1 bg-white rounded shadow p-3">
                          <div className="h-4 bg-blue-200 rounded mb-2 w-3/4"></div>
                          <div className="h-20 bg-blue-100 rounded"></div>
                          <div className="h-4 bg-blue-200 rounded mt-2 w-1/2"></div>
                        </div>
                        <div className="col-span-3 bg-white rounded shadow p-3">
                          <div className="flex border-b pb-2 mb-2">
                            <div className="h-6 bg-blue-200 rounded w-16 mr-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-16 mr-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[...Array(10)].map((_, i) => (
                              <div key={i} className="h-6 bg-gray-200 rounded"></div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <div className="h-32 bg-blue-100 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Powerful features for data analysis
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Everything you need to understand your data quickly and effectively
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white mb-4">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Easy Upload</h3>
              <p className="mt-2 text-gray-500">
                Drag and drop your CSV files or use the file browser to upload your data.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white mb-4">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Interactive Visualizations</h3>
              <p className="mt-2 text-gray-500">
                Explore your data with interactive charts that update in real-time as you make selections.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white mb-4">
                <ChartPieIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Correlation Analysis</h3>
              <p className="mt-2 text-gray-500">
                Automatically detect relationships between variables with advanced correlation tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-blue-200">Create your free account today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CSV Analytics Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
