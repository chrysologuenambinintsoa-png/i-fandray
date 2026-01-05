'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  BookOpen, 
  Video, 
  Mail, 
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users
} from 'lucide-react';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: HelpCircle,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on the "Sign Up" button on the homepage. You can register using your email address. Follow the prompts to complete your profile setup.',
      },
      {
        q: 'How do I verify my account?',
        a: 'After registration, you\'ll receive a verification email or SMS. Click the link or enter the code provided to verify your account.',
      },
      {
        q: 'Can I change my username?',
        a: 'Yes, you can change your username in your profile settings. Go to Settings > Profile > Edit Profile to update your username.',
      },
    ],
  },
  {
    id: 'posts',
    title: 'Posts & Content',
    icon: BookOpen,
    questions: [
      {
        q: 'How do I create a post?',
        a: 'Click on the "Create Post" box at the top of your feed. You can add text, photos, videos, and tags before publishing.',
      },
      {
        q: 'How do I delete a post?',
        a: 'Click the three dots menu on your post and select "Delete". Confirm the action to permanently remove the post.',
      },
      {
        q: 'Can I edit a post after publishing?',
        a: 'Yes, click the three dots menu on your post and select "Edit". Make your changes and save them.',
      },
      {
        q: 'How do I share someone else\'s post?',
        a: 'Click the "Share" button on any post. You can add your own comment and choose where to share it.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: HelpCircle,
    questions: [
      {
        q: 'How do I change my privacy settings?',
        a: 'Go to Settings > Privacy. Here you can control who sees your posts, who can message you, and manage other privacy preferences.',
      },
      {
        q: 'How do I block someone?',
        a: 'Visit their profile, click the three dots menu, and select "Block". Blocked users cannot interact with you.',
      },
      {
        q: 'How do I enable two-factor authentication?',
        a: 'Go to Settings > Security and click on "Enable 2FA". Follow the setup instructions to add an extra layer of security.',
      },
      {
        q: 'How do I report inappropriate content?',
        a: 'Click the three dots menu on any post or comment and select "Report". Choose a reason and submit your report.',
      },
    ],
  },
  {
    id: 'messaging',
    title: 'Messaging & Calls',
    icon: MessageCircle,
    questions: [
      {
        q: 'How do I start a video call?',
        a: 'Open a conversation with the person you want to call. Click the video icon in the top right corner to start a video call.',
      },
      {
        q: 'Can I make group video calls?',
        a: 'Yes, create a group conversation and click the video call icon. You can add up to 10 participants in a group call.',
      },
      {
        q: 'How do I send voice messages?',
        a: 'In any conversation, click the microphone icon to record a voice message. Release to send.',
      },
      {
        q: 'How do I share my screen during a call?',
        a: 'During a video call, click the screen share icon to share your screen with other participants.',
      },
    ],
  },
];

const supportOptions = [
  {
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: MessageCircle,
    action: 'Start Chat',
    available: '24/7',
  },
  {
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 24 hours',
    icon: Mail,
    action: 'Send Email',
    available: '24/7',
  },
  {
    title: 'Phone Support',
    description: 'Call us for immediate assistance',
    icon: Phone,
    action: '+1 (555) 123-4567',
    available: 'Mon-Fri 9am-6pm',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    icon: Video,
    action: 'Watch Videos',
    available: 'Always available',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['getting-started']));
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

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
                <HelpCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find answers to your questions or get in touch with our support team.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help..."
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-lg shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            >
              {supportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.title}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 bg-green-100 rounded-full mb-4">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      <span className="text-xs text-green-600 font-medium">{option.available}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategories.has(category.id);
                  
                  return (
                    <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">{category.title}</span>
                          <span className="text-sm text-gray-500">({category.questions.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-6 pb-4">
                          <div className="space-y-3">
                            {category.questions.map((item, index) => {
                              const isQuestionExpanded = expandedQuestions.has(
                                    parseInt(`${category.id}-${index}`)
                                  );
                              
                              return (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => toggleQuestion(parseInt(`${category.id}-${index}`))}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                  >
                                    <span className="font-medium text-gray-900">{item.q}</span>
                                    {isQuestionExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                  
                                  {isQuestionExpanded && (
                                    <div className="px-4 py-3 bg-gray-50 text-gray-600">
                                      {item.a}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white"
            >
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
                <p className="text-lg mb-6 opacity-90">
                  Our support team is here to help you with any questions or issues you may have.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@ifandray.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Email Support
                  </a>
                  <button className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Live Chat
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 grid md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Documentation</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      User Guide
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Video Tutorials
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      API Documentation
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Community Forum
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Q&A Section
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      User Groups
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/privacy" className="text-green-600 hover:text-green-700 flex items-center">
                      Privacy Policy
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-green-600 hover:text-green-700 flex items-center">
                      Terms of Service
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-green-600 hover:text-green-700 flex items-center">
                      Cookie Policy
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

    </div>
  );
}