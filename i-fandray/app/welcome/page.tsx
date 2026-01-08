'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, User, MessageCircle, Image, Users, Settings, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: User,
      title: "Complétez votre profil",
      description: "Ajoutez une photo de profil, une bio et vos informations personnelles pour que vos amis puissent vous reconnaître.",
      action: "Aller à mon profil",
      link: "/profile",
      completed: false
    },
    {
      icon: Users,
      title: "Trouvez vos amis",
      description: "Recherchez et ajoutez vos amis existants, ou invitez-en de nouveaux à rejoindre i-fandray.",
      action: "Voir les amis",
      link: "/friends",
      completed: false
    },
    {
      icon: Image,
      title: "Créez votre premier post",
      description: "Partagez vos pensées, photos ou vidéos avec votre réseau. C&apos;est le cœur de i-fandray !",
      action: "Créer un post",
      link: "/feed",
      completed: false
    },
    {
      icon: MessageCircle,
      title: "Découvrez les conversations",
      description: "Rejoignez des groupes d&apos;intérêt, participez à des discussions et créez des connexions.",
      action: "Explorer les groupes",
      link: "/groups",
      completed: false
    },
    {
      icon: Settings,
      title: "Personnalisez votre expérience",
      description: "Ajustez vos paramètres de confidentialité, notifications et préférences d&apos;affichage.",
      action: "Paramètres",
      link: "/settings",
      completed: false
    }
  ];

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        localStorage.setItem('seenWelcome', 'true');
      } catch (e) {
        // ignore
      }
      router.push('/feed');
    }
  };

  const handleMarkSeenAndNavigate = (link: string) => {
    try {
      localStorage.setItem('seenWelcome', 'true');
    } catch (e) {
      // ignore
    }
    router.push(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="welcome" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue sur i-fandray ! 🎉
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Votre compte a été créé avec succès. Voici un guide rapide pour vous aider à découvrir toutes les fonctionnalités de notre plateforme sociale.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-white/80">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        {/* Current Step Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              {React.createElement(steps[currentStep].icon, {
                className: "w-8 h-8 text-green-600"
              })}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="flex justify-center">
            <div
              key={index}
              onClick={() => handleStepClick(index)}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 cursor-pointer transition-all hover:bg-white/20 ${
                index === currentStep ? 'ring-2 ring-white' : ''
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                {React.createElement(step.icon, {
                  className: "w-6 h-6 text-white"
                })}
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
              </div>
              <p className="text-white/80 text-sm">
                {step.description}
              </p>
            </div>
            >
              <div className="flex items-center space-x-3 mb-3">
                {React.createElement(step.icon, {
                  className: "w-6 h-6 text-white"
                })}
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
              </div>
              <p className="text-white/80 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            ← Précédent
          </button>

          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors flex items-center"
          >
            {currentStep === steps.length - 1 ? 'Commencer à explorer' : 'Suivant'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-card rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Conseils pour bien débuter</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-white/90">
            <div>
              <h4 className="font-semibold mb-2">🔒 Sécurité</h4>
              <p className="text-sm">Vérifiez vos paramètres de confidentialité et choisissez qui peut voir vos publications.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">👥 Communauté</h4>
              <p className="text-sm">Rejoignez des groupes qui correspondent à vos intérêts pour rencontrer des personnes similaires.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📱 Mobile</h4>
              <p className="text-sm">Téléchargez notre app mobile pour rester connecté où que vous soyez.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">❓ Aide</h4>
              <p className="text-sm">Consultez notre centre d&apos;aide si vous avez des questions ou besoin d&apos;assistance.</p>
            </div>
          </div>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}