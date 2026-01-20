import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Logged In</h1>
          <p className="text-gray-600 mb-4">You need to login first.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Login Successful!</h1>
          <p className="text-gray-600 mb-6">You are now logged in to the system.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Your Profile Information:</h2>
            <div className="space-y-2">
              <p className="text-gray-700"><strong>ID:</strong> {user.id}</p>
              <p className="text-gray-700"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
              <p className="text-gray-700"><strong>Phone:</strong> {user.phone}</p>
              <p className="text-gray-700"><strong>User Type:</strong> {user.userType}</p>
              <p className="text-gray-700"><strong>Token:</strong> {user.token?.substring(0, 20)}...</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/traveler-dashboard')}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600"
            >
              Go to Full Dashboard
            </button>
            <button
              onClick={logout}
              className="flex-1 bg-red-500 text-white py-3 px-6 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information:</h3>
          <pre className="text-xs bg-white p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
