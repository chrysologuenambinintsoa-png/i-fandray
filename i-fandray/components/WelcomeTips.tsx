'use client';

import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Users, Image, MessageCircle, Settings } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';
import Link from 'next/link';

interface WelcomeTipsProps {
  onDismiss?: () => void;
}

export function WelcomeTips({ onDismiss }: WelcomeTipsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const { t } = useTranslation();

  const tips = [
    {
      icon: Users,
      title: t('welcome.addFriends'),
      description: t('welcome.addFriendsDesc'),
      action: t('welcome.viewFriends'),
      link: "/friends"
    },
    {
      icon: Image,
      title: t('welcome.createFirstPost'),
      description: t('welcome.createFirstPostDesc'),
      action: t('welcome.createPost'),
      link: "/feed"
    },
    {
      icon: MessageCircle,
      title: t('welcome.joinGroups'),
      description: t('welcome.joinGroupsDesc'),
      action: t('welcome.exploreGroups'),
      link: "/groups"
    },
    {
      icon: Settings,
      title: t('welcome.customizeProfile'),
      description: t('welcome.customizeProfileDesc'),
      action: t('welcome.myProfile'),
      link: "/profile"
    }
  ];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
    // Sauvegarder dans localStorage pour ne plus afficher
    localStorage.setItem('welcomeTipsDismissed', 'true');
  };

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      handleDismiss();
    }
  };

  useEffect(() => {
    // Vérifier si les conseils ont déjà été masqués
    const dismissed = localStorage.getItem('welcomeTipsDismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  const currentTipData = tips[currentTip];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={t('welcome.closeTips')}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Conseils pour bien débuter ({currentTip + 1}/{tips.length})
            </h3>
          </div>

          <div className="flex items-center space-x-3 mb-3">
            {React.createElement(currentTipData.icon, {
              className: "w-5 h-5 text-blue-600 flex-shrink-0"
            })}
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {currentTipData.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {currentTipData.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={currentTipData.link}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {currentTipData.action} →
            </Link>

            <div className="flex space-x-1">
              {tips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentTip ? 'bg-blue-600' : 'bg-blue-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {currentTip === tips.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}