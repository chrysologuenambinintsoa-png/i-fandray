'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, MessageCircle, Video, Shield, Heart, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Connect with Friends',
      description: 'Build meaningful relationships with people around the world through our intuitive social platform.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Stay connected with instant messaging, voice messages, and encrypted communication.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Video,
      title: 'Live Streaming',
      description: 'Share your moments live with friends and followers through high-quality video streaming.',
      color: 'from-teal-400 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your data is protected with end-to-end encryption and advanced security measures.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: Heart,
      title: 'Community Driven',
      description: 'Join communities that share your interests and passions.',
      color: 'from-pink-400 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Experience lightning-fast performance with our optimized platform.',
      color: 'from-yellow-400 to-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Login
          </Link>
        </header>

        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <img src="/logo.svg" alt="i-fandray Logo" className="w-24 h-24 relative z-10 animate-bounce" />
            </div>

            <h1 className="text-6xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-green-300 to-teal-300 animate-pulse">
              Welcome to i-fandray
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              The next generation social platform where connections come alive. Share moments,
              build communities, and discover the world through meaningful interactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 hover:from-blue-600 hover:via-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Join i-fandray
              </Link>
              <Link
                href="/auth/login"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose i-fandray?</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Experience social networking reimagined with cutting-edge features designed for the modern world.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-xl group"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-blue-100 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <Globe className="w-16 h-16 text-blue-300 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">Join Our Growing Community</h3>
              <p className="text-blue-100 text-lg mb-8">
                Millions of users worldwide are already connecting, sharing, and building relationships on i-fandray.
                Be part of the future of social networking.
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">10M+</div>
                  <div className="text-blue-200">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">500M+</div>
                  <div className="text-blue-200">Connections Made</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-blue-200">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of users who have already discovered the power of meaningful connections.
            </p>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 hover:from-blue-600 hover:via-green-600 hover:to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg inline-block"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}