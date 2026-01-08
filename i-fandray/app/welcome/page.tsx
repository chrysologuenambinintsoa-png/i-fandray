"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import {
  CheckCircle,
  User,
  MessageCircle,
  Image,
  Users,
  Settings,
  Star,
} from "lucide-react";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: User,
      title: "Complétez votre profil",
      description:
        "Ajoutez une photo de profil, une bio et vos informations personnelles pour que vos amis puissent vous reconnaître.",
      action: "Aller à mon profil",
      link: "/profile",
    },
    {
      icon: Users,
      title: "Trouvez vos amis",
      description:
        "Recherchez et ajoutez vos amis existants, ou invitez-en de nouveaux à rejoindre i-fandray.",
      action: "Voir les amis",
      link: "/friends",
    },
    {
      icon: Image,
      title: "Créez votre premier post",
      description:
        "Partagez vos pensées, photos ou vidéos avec votre réseau. C'est le cœur de i-fandray !",
      action: "Créer un post",
      link: "/feed",
    },
    {
      icon: MessageCircle,
      title: "Découvrez les conversations",
      description:
        "Rejoignez des groupes d'intérêt, participez à des discussions et créez des connexions.",
      action: "Explorer les groupes",
      link: "/groups",
    },
    {
      icon: Settings,
      title: "Personnalisez votre expérience",
      description:
        "Ajustez vos paramètres de confidentialité, notifications et préférences d'affichage.",
      action: "Paramètres",
      link: "/settings",
    },
  ];

  const handleStepClick = (index: number) => setCurrentStep(index);

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      try {
        localStorage.setItem("seenWelcome", "true");
      } catch (e) {}
      if (!session?.user) {
        router.replace('/auth/login');
        return;
      }
      router.replace('/feed');
    }
  };

  const handleMarkSeenAndNavigate = (link: string) => {
    try {
      localStorage.setItem("seenWelcome", "true");
    } catch (e) {}
    if (!session?.user) {
      router.replace('/auth/login');
      return;
    }
    router.replace(link);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const progressStr = `${Math.round(progress)}%`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <Header />

      <main className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            {/* Left panel - spotlight */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-sky-500 p-8 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Bienvenue sur i-fandray</h1>
                <p className="text-white/90 mb-6">
                  Connectez-vous avec vos amis, partagez vos moments et découvrez du
                  contenu inspirant. Nous avons préparé quelques étapes rapides
                  pour commencer.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem("seenWelcome", "true");
                      } catch {}
                      router.push("/feed");
                    }}
                    className="px-4 py-2 bg-white text-slate-900 rounded-md font-semibold shadow"
                  >
                    Commencer
                  </button>
                  <button onClick={() => router.push("/profile")} className="px-4 py-2 bg-white/20 border border-white/20 rounded-md">
                    Mon profil
                  </button>
                </div>
              </div>
              <div className="mt-6 text-sm text-white/80">Astuce : vous pouvez retrouver ce guide à tout moment depuis l'aide.</div>
            </motion.div>

            {/* Right panel - steps and progress */}
            <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6">
              <div className="mb-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-2 bg-white rounded-full" initial={{ width: 0 }} animate={{ width: progressStr }} transition={{ type: "spring", stiffness: 100, damping: 20 }} />
                </div>
                <div className="flex justify-between text-sm text-white/80 mt-2">
                  <span>Étape {currentStep + 1}</span>
                  <span>{steps.length} étapes</span>
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    onClick={() => handleStepClick(index)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.18 }}
                    className={`p-3 rounded-lg flex items-start justify-between ${index === currentStep ? "ring-2 ring-emerald-300 bg-white/5" : "bg-white/5 hover:bg-white/10"} cursor-pointer`}
                  >
                    <div className="flex items-start space-x-3">
                      {React.createElement(step.icon, { className: "w-6 h-6 text-white mt-1" })}
                      <div>
                        <div className="font-semibold text-white">{step.title}</div>
                        <div className="text-sm text-white/80">{step.description}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSeenAndNavigate(step.link);
                        }}
                        whileHover={{ scale: 1.03 }}
                        className="px-3 py-1 bg-emerald-500 text-white rounded-md text-sm"
                      >
                        {step.action}
                      </motion.button>
                      {index === currentStep && <div className="text-xs text-white/80">En cours</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}