import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-purple-100 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="px-6 py-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using ExpenseTracker ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Description of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                ExpenseTracker is a personal finance management application that allows users to:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Track income and expenses</li>
                <li>• Manage multiple accounts and budgets</li>
                <li>• Set financial goals and monitor progress</li>
                <li>• Import transactions from email</li>
                <li>• Generate financial reports</li>
                <li>• Transfer funds between accounts</li>
                <li>• Categorize and analyze spending patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">User Accounts</h2>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Account Creation</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>• You must provide accurate and complete information</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• You must be at least 13 years old to create an account</li>
                <li>• One account per person is permitted</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Account Responsibilities</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Keep your login credentials secure and confidential</li>
                <li>• Notify us immediately of any unauthorized access</li>
                <li>• Ensure all financial data entered is accurate</li>
                <li>• Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptable Use Policy</h2>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Permitted Uses</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>• Personal financial management and tracking</li>
                <li>• Legitimate business expense management</li>
                <li>• Educational purposes related to personal finance</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Prohibited Uses</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Illegal activities or money laundering</li>
                <li>• Violating any local, state, or federal laws</li>
                <li>• Attempting to hack or compromise system security</li>
                <li>• Sharing accounts or login credentials</li>
                <li>• Using the service for commercial resale</li>
                <li>• Transmitting malware or harmful code</li>
                <li>• Impersonating others or providing false information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Financial Data and Accuracy</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> ExpenseTracker is a tracking tool only. We are not a bank or financial institution.
                </p>
              </div>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• You are responsible for the accuracy of all financial data entered</li>
                <li>• We do not verify the accuracy of your financial information</li>
                <li>• The service is for tracking purposes only, not for actual money transfers</li>
                <li>• Always verify important financial decisions with qualified professionals</li>
                <li>• We are not liable for financial decisions made based on tracked data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Email Integration</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When using our email integration feature:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• You grant us permission to access specified email accounts</li>
                <li>• We only process transaction-related emails</li>
                <li>• You can revoke email access at any time</li>
                <li>• You are responsible for the accuracy of extracted transaction data</li>
                <li>• Email credentials are encrypted and stored securely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Privacy and Data Protection</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your privacy is important to us. Please review our <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information. By using our service, you also agree to our data handling practices as outlined in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Service Availability</h2>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>• Scheduled maintenance will be announced in advance when possible</li>
                <li>• We reserve the right to modify or discontinue features with notice</li>
                <li>• Emergency maintenance may occur without prior notice</li>
                <li>• We are not liable for service interruptions or data loss</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                All content, features, and functionality of ExpenseTracker are owned by us and are protected by intellectual property laws.
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• You retain ownership of your personal financial data</li>
                <li>• You may not copy, modify, or distribute our software</li>
                <li>• You may not reverse engineer or attempt to extract source code</li>
                <li>• Our trademarks and logos may not be used without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800 dark:text-red-200">
                  <strong>Disclaimer:</strong> ExpenseTracker is provided "as is" without warranties of any kind.
                </p>
              </div>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• We are not liable for any financial losses or damages</li>
                <li>• We do not guarantee the accuracy of financial calculations</li>
                <li>• Users are responsible for backing up their own data</li>
                <li>• We are not liable for third-party integrations or services</li>
                <li>• Maximum liability is limited to the amount paid for services (if any)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Account Termination</h2>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">User-Initiated Termination</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>• You may delete your account at any time through profile settings</li>
                <li>• Account deletion is permanent and cannot be undone</li>
                <li>• All data will be permanently removed within 30 days</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Service-Initiated Termination</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                We may suspend or terminate accounts for:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• Violation of these terms of service</li>
                <li>• Fraudulent or illegal activity</li>
                <li>• Extended periods of inactivity (1+ years)</li>
                <li>• Abuse of system resources</li>
                <li>• Failure to respond to security concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Modifications to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Significant changes will be announced through email or in-app notifications. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These terms are governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> admin@zatn.in<br />
                  <strong>Support:</strong> admin@zatn.in<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acknowledgment</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By creating an account and using ExpenseTracker, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
              <Link 
                to="/auth" 
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ← Back to App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;