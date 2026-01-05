'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Cookie, Shield, CheckCircle, Info, ChevronRight } from 'lucide-react';

export default function CookiesPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['essential']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const cookieTypes = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'Required for the website to function properly',
      required: true,
      details: [
        'Authentication cookies',
        'Security tokens',
        'Session management',
      ],
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us improve our website by collecting anonymous usage data',
      required: false,
      details: [
        'Google Analytics',
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring',
      ],
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver personalized advertisements',
      required: false,
      details: [
        'Targeted advertising',
        'Social media integration',
        'Campaign tracking',
        'Conversion tracking',
      ],
    },
    {
      id: 'preferences',
      name: 'Preference Cookies',
      description: 'Remember your settings and preferences',
      required: false,
      details: [
        'Language settings',
        'Theme preferences',
        'Layout preferences',
        'Notification settings',
      ],
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                <Cookie className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn about how we use cookies to enhance your experience and protect your privacy.
              </p>
              <p className="text-sm text-gray-500 mt-4">Last updated: January 2024</p>
            </motion.div>

            {/* What are Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">What are Cookies?</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our service, and ensuring the security of your account.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cookie Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                {cookieTypes.map((type) => {
                  const isExpanded = expandedSections.has(type.id);
                  
                  return (
                    <div key={type.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => !type.required && toggleSection(type.id)}
                        className={`w-full px-6 py-4 flex items-center justify-between ${
                          type.required ? 'cursor-default' : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="flex items-center space-x-3">
                          {type.required ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Shield className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{type.name}</span>
                              {type.required && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                        {!type.required && (
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-6 pb-4 bg-gray-50">
                          <ul className="space-y-2">
                            {type.details.map((detail, index) => (
                              <li key={index} className="flex items-center space-x-2 text-gray-600">
                                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                                <span className="text-sm">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Cookie Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Your Preferences</h2>
              <p className="text-gray-600 mb-6">
                You can control which cookies we use by adjusting your preferences below. Note that essential cookies are required for the website to function properly.
              </p>
              
              <div className="space-y-4">
                {cookieTypes.filter(type => !type.required).map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked aria-label={`Enable ${type.name}`} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                Save Preferences
              </button>
            </motion.div>

            {/* Third-Party Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
              <p className="text-gray-600 mb-4">
                We use third-party cookies from trusted partners to enhance our services. These partners include:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Google Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Helps us understand how visitors interact with our website.
                  </p>
                  <a href="#" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                    Learn more →
                  </a>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Google AdSense</h3>
                  <p className="text-sm text-gray-600">
                    Delivers personalized advertisements based on your interests.
                  </p>
                  <a href="#" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                    Learn more →
                  </a>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Social Media Platforms</h3>
                  <p className="text-sm text-gray-600">
                    Enables sharing content and social features.
                  </p>
                  <a href="#" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                    Learn more →
                  </a>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Processors</h3>
                  <p className="text-sm text-gray-600">
                    Secure payment processing for premium features.
                  </p>
                  <a href="#" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                    Learn more →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cookie Rights</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Accept or Reject Cookies</h3>
                    <p className="text-gray-600">
                      You can choose to accept or reject non-essential cookies through our cookie banner or settings page.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Delete Cookies</h3>
                    <p className="text-gray-600">
                      You can delete cookies from your browser settings at any time. Note that this may affect your user experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Browser Settings</h3>
                    <p className="text-gray-600">
                      Most browsers allow you to control cookies through their settings. Check your browser&apos;s help section for instructions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-amber-50 rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions About Cookies?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies, please don&apos;t hesitate to contact us.
              </p>
              <a
                href="mailto:privacy@ifandray.com"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                privacy@ifandray.com
              </a>
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}