'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { FileText, AlertCircle, CheckCircle, XCircle, Users, Globe } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing and using i-Fandray, you accept and agree to be bound by the terms and provision of this agreement.',
    },
    {
      icon: AlertCircle,
      title: 'User Responsibilities',
      content: 'You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.',
    },
    {
      icon: CheckCircle,
      title: 'Acceptable Use',
      content: 'You agree to use the service only for lawful purposes and in accordance with these Terms of Service.',
    },
    {
      icon: XCircle,
      title: 'Prohibited Activities',
      content: 'You may not use the service for any illegal purpose, harass others, or post harmful content.',
    },
    {
      icon: Users,
      title: 'User Content',
      content: 'You retain ownership of any content you submit, but grant us a license to use, modify, and distribute it.',
    },
    {
      icon: Globe,
      title: 'International Use',
      content: 'The service is controlled and operated from facilities in the United States and may be subject to export controls.',
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Please read these terms carefully before using i-Fandray. Your use of the service constitutes your agreement to these terms.
              </p>
              <p className="text-sm text-gray-500 mt-4">Last updated: January 2024</p>
            </motion.div>

            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 gap-4 mb-12">
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
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Detailed Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-md p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
              
              <div className="prose prose-blue max-w-none">
                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
                  <p className="text-gray-600 mb-4">
                    Welcome to i-fandray. These Terms of Service (&quot;Terms&quot;) govern your use of our social media platform and services. By accessing or using i-Fandray, you agree to be bound by these Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Account Registration</h3>
                  <p className="text-gray-600 mb-4">
                    To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>You must be at least 13 years old to create an account</li>
                    <li>You are responsible for maintaining the confidentiality of your password</li>
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">3. User Conduct</h3>
                  <p className="text-gray-600 mb-4">
                    You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Use the Service for any illegal purpose or to solicit others to perform or participate in any unlawful acts</li>
                    <li>Violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>Submit false or misleading information</li>
                    <li>Upload viruses or other malicious code</li>
                    <li>Spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                    <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Content and Intellectual Property</h3>
                  <p className="text-gray-600 mb-4">
                    You retain ownership of any content you submit to i-Fandray. However, by submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, publish, and distribute such content.
                  </p>
                  <p className="text-gray-600 mb-4">
                    You represent and warrant that:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>You own all rights to the content you submit</li>
                    <li>The content is accurate and not misleading</li>
                    <li>The content does not violate any third-party rights</li>
                    <li>The content complies with all applicable laws and regulations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy</h3>
                  <p className="text-gray-600 mb-4">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using i-Fandray, you agree to the collection and use of information in accordance with our Privacy Policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Termination</h3>
                  <p className="text-gray-600 mb-4">
                    We may terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for any reason, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Breach of these Terms</li>
                    <li>Violation of our Community Guidelines</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Inactivity for an extended period</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimer of Warranties</h3>
                  <p className="text-gray-600 mb-4">
                    The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, materials, or products included on the Service.
                  </p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h3>
                  <p className="text-gray-600 mb-4">
                    In no event shall i-Fandray, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Indemnification</h3>
                  <p className="text-gray-600 mb-4">
                    You agree to indemnify, defend, and hold harmless i-Fandray and its affiliates, officers, directors, employees, agents, and suppliers from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney&apos;s fees).
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h3>
                  <p className="text-gray-600 mb-4">
                    These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                  </p>
                </section>
              </div>

              {/* Contact Section */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions About Our Terms?</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us.
                </p>
                <a
                  href="mailto:legal@ifandray.com"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  legal@ifandray.com
                </a>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}