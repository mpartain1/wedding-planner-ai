import React, { useState } from 'react';
import { Mail, Zap, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { AIEmailService } from '../services/aiEmailService';
import { SendGridService } from '../services/sendGridService';

const EmailTestPanel: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [testResults, setTestResults] = useState<{
    sendgrid: boolean;
    openai: boolean;
    errors: string[];
  } | null>(null);

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  const handleTestConfiguration = async () => {
    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    setIsTestingConfig(true);
    setTestResults(null);

    try {
      const results = await AIEmailService.testEmailConfiguration(testEmail);
      setTestResults(results);
    } catch (error) {
      setTestResults({
        sendgrid: false,
        openai: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert('Please enter a test email address');
      return;
    }

    setIsSendingTest(true);
    setTestEmailResult(null);

    try {
      const result = await SendGridService.testConfiguration(testEmail);
      if (result.success) {
        setTestEmailResult('✅ Test email sent successfully! Check your inbox.');
      } else {
        setTestEmailResult(`❌ Failed to send test email: ${result.error}`);
      }
    } catch (error) {
      setTestEmailResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Email System Configuration</h3>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">SendGrid Status</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              {import.meta.env.VITE_SENDGRID_API_KEY ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>API Key: {import.meta.env.VITE_SENDGRID_API_KEY ? 'Configured' : 'Missing'}</span>
            </div>
            <div className="flex items-center space-x-2">
              {import.meta.env.VITE_SENDGRID_FROM_EMAIL ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>From Email: {import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'Missing'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-purple-900">OpenAI Status</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              {import.meta.env.VITE_OPENAI_API_KEY ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>API Key: {import.meta.env.VITE_OPENAI_API_KEY ? 'Configured' : 'Missing'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Model: GPT-4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="space-y-4">
        <div>
          <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address
          </label>
          <input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleTestConfiguration}
            disabled={isTestingConfig || !testEmail.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingConfig ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Settings className="h-4 w-4" />
            )}
            <span>{isTestingConfig ? 'Testing...' : 'Test Configuration'}</span>
          </button>

          <button
            onClick={handleSendTestEmail}
            disabled={isSendingTest || !testEmail.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingTest ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span>{isSendingTest ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Configuration Test Results</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {testResults.sendgrid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">SendGrid: {testResults.sendgrid ? 'Working' : 'Failed'}</span>
              </div>
              <div className="flex items-center space-x-2">
                {testResults.openai ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">OpenAI: {testResults.openai ? 'Working' : 'Failed'}</span>
              </div>
              {testResults.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-600 mb-1">Errors:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {testResults.errors.map((error, index) => (
                      <li key={index} className="ml-4">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Email Result */}
        {testEmailResult && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{testEmailResult}</p>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">🔧 Setup Instructions</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>1. SendGrid Setup:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Sign up at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a></li>
              <li>• Create an API key with full access</li>
              <li>• Add to .env.local: <code>VITE_SENDGRID_API_KEY=your_key</code></li>
              <li>• Add from email: <code>VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com</code></li>
            </ul>
            
            <p><strong>2. OpenAI Setup:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Get API key from <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
              <li>• Add to .env.local: <code>VITE_OPENAI_API_KEY=your_key</code></li>
              <li>• Ensure you have GPT-4 access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPanel;