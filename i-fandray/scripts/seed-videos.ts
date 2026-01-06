import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVideos() {
  try {
    // Create some test videos
    const videos = [
      {
        title: "Bienvenue sur iFandray !",
        description: "Découvrez notre nouvelle plateforme sociale avec des fonctionnalités innovantes.",
        videoUrl: "/videos/welcome.mp4",
        thumbnailUrl: "/images/video-placeholder.svg",
        duration: 45,
        category: "general",
        authorId: "cmk2ndnq60000n4l3qrkrb3lr", // Using the user ID from earlier logs
      },
      {
        title: "Tutoriel : Comment créer un post",
        description: "Apprenez à créer et partager vos premiers posts sur iFandray.",
        videoUrl: "/videos/tutorial.mp4",
        thumbnailUrl: "/images/video-placeholder.svg",
        duration: 120,
        category: "education",
        authorId: "cmk2ndnq60000n4l3qrkrb3lr",
      },
      {
        title: "Vidéo de démonstration",
        description: "Une vidéo pour tester les fonctionnalités de notre plateforme.",
        videoUrl: "/videos/demo.mp4",
        thumbnailUrl: "/images/video-placeholder.svg",
        duration: 30,
        category: "general",
        authorId: "cmk2ndnq60000n4l3qrkrb3lr",
      },
    ];

    for (const video of videos) {
      await prisma.video.create({
        data: video,
      });
    }

    console.log('✅ Videos seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding videos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedVideos();