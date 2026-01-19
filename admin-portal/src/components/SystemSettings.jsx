import React from 'react';
import { Settings, Shield, Bell, Globe, DollarSign } from 'lucide-react';

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-Factor Authentication</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Verification Required</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Notifications</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SMS Notifications</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Commission Rate (%)</label>
              <input type="number" defaultValue="15" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Platform Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Platform Name</label>
              <input type="text" defaultValue="iSafari Global" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;