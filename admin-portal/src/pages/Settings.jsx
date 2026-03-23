import React, { useState } from 'react';
import { Shield } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Admin portal configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                A
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Admin User</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">admin@isafari.com</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="text-gray-400 dark:text-gray-500" size={18} />
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium text-gray-900 dark:text-white">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Information</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Admin Portal Version</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">1.0.0</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">Status</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Active</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">Platform</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">iSafari Management System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
