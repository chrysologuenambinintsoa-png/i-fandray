'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Shield, Eye, Lock, Database, Cookie, Globe } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: 'Data Collection',
      content: 'We collect information you provide directly, including your name, email, phone number, profile information, and any content you post or share.',
    },
    {
      icon: Lock,
      title: 'Data Protection',
      content: 'We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits.',
    },
    {
      icon: Database,
      title: 'Data Usage',
      content: 'Your data is used to provide, improve, and personalize our services, communicate with you, and ensure the security of our platform.',
    },
    {
      icon: Globe,
      title: 'Data Sharing',
      content: 'We do not sell your personal information. We may share data with service providers, legal authorities when required, or with your consent.',
    },
    {
      icon: Cookie,
      title: 'Cookies & Tracking',
      content: 'We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content and advertisements.',
    },
    {
      icon: Shield,
      title: 'Your Rights',
      content: 'You have the right to access, correct, delete, and restrict the processing of your personal data. You can also opt out of marketing communications.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex pt-16">
        <Sidebar currentPage="settings" />
        
        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
              </p>
              <p className="text-sm text-gray-500 mt-4">Last updated: January 2026</p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Detailed Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 bg-white rounded-lg shadow-md p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Privacy Policy</h2>
              
              <div className="prose prose-green max-w-none">
                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h3>
                  <p className="text-gray-600 mb-4">
                    We collect various types of information to provide and improve our services to you:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Personal identification information (name, email, phone number)</li>
                    <li>Profile information (avatar, bio, location)</li>
                    <li>Content you create (posts, comments, messages)</li>
                    <li>Usage data and device information</li>
                    <li>Cookies and tracking data</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h3>
                  <p className="text-gray-600 mb-4">
                    We use the collected information for various purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>To provide and maintain our service</li>
                    <li>To notify you about changes to our service</li>
                    <li>To provide customer support</li>
                    <li>To gather analysis or valuable information</li>
                    <li>To monitor the usage of our service</li>
                    <li>To detect, prevent, and address technical issues</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Data Security</h3>
                  <p className="text-gray-600 mb-4">
                    We value your trust in providing us your personal information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the Internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                  </p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Your Data Rights</h3>
                  <p className="text-gray-600 mb-4">
                    You have certain data protection rights under GDPR and other regulations:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>The right to access, update, or delete your personal information</li>
                    <li>The right to rectification of inaccurate data</li>
                    <li>The right to object to processing of your personal data</li>
                    <li>The right to data portability</li>
                    <li>The right to withdraw consent</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Children&apos;s Privacy</h3>
                  <p className="text-gray-600 mb-4">
                    Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Changes to This Privacy Policy</h3>
                  <p className="text-gray-600 mb-4">
                    We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
                  </p>
                </section>
              </div>

              {/* Contact Section */}
              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions or Concerns?</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about our Privacy Policy, please don&apos;t hesitate to contact us.
                </p>
                <a
                  href="mailto:privacy@ifandray.com"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  privacy@ifandray.com
                </a>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}