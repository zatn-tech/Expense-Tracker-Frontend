import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-blue-100 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="px-6 py-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to ExpenseTracker ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our expense tracking application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Personal Information</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>• Name and email address (for account creation)</li>
                <li>• Profile picture (optional)</li>
                <li>• Password (encrypted and stored securely)</li>
                <li>• Authentication tokens for social login (Google, Facebook, GitHub)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Financial Data</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>• Transaction records (amounts, categories, descriptions, dates)</li>
                <li>• Account information (account names, types, balances)</li>
                <li>• Budget and goal information</li>
                <li>• Transfer records between accounts</li>
                <li>• Email transaction data (when you choose to connect email accounts)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Technical Information</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• IP address and device information</li>
                <li>• Browser type and version</li>
                <li>• Usage patterns and preferences</li>
                <li>• Log files and error reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• <strong>Service Provision:</strong> To provide and maintain our expense tracking services</li>
                <li>• <strong>Account Management:</strong> To create and manage your user account</li>
                <li>• <strong>Communication:</strong> To send important notifications and updates</li>
                <li>• <strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li>• <strong>Security:</strong> To detect and prevent fraud or unauthorized access</li>
                <li>• <strong>Compliance:</strong> To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• End-to-end encryption for data transmission</li>
                <li>• Secure password hashing using bcrypt</li>
                <li>• JWT tokens for secure authentication</li>
                <li>• Regular security audits and updates</li>
                <li>• Secure cloud hosting with SSL certificates</li>
                <li>• Limited access controls for our team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Email Integration Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                When you choose to connect your email accounts for automatic transaction detection:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• We only access emails related to financial transactions</li>
                <li>• Email credentials are encrypted and stored securely</li>
                <li>• You can disconnect email accounts at any time</li>
                <li>• We do not read or store personal email content</li>
                <li>• Only transaction-related data is extracted and processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Sharing and Disclosure</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• <strong>With your consent:</strong> When you explicitly agree to share information</li>
                <li>• <strong>Service providers:</strong> With trusted third-party services that help us operate our platform</li>
                <li>• <strong>Legal compliance:</strong> When required by law or to protect our rights</li>
                <li>• <strong>Business transfers:</strong> In the event of a merger or acquisition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li>• <strong>Access:</strong> Request access to your personal data</li>
                <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
                <li>• <strong>Export:</strong> Download your data in a portable format</li>
                <li>• <strong>Restriction:</strong> Limit how we process your information</li>
                <li>• <strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you services. You may delete your account at any time through the profile settings, which will permanently remove all your data from our systems within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use essential cookies and local storage to maintain your login session and preferences. We do not use tracking cookies or third-party analytics that compromise your privacy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> admin@zatn.in<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
              <Link 
                to="/auth" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default PrivacyPolicy;