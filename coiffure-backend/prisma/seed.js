require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Salon (un seul enregistrement)
  let salon = await prisma.salon.findFirst();
  if (!salon) {
    salon = await prisma.salon.create({
      data: {
        nomEnseigne: 'Mon Salon de Coiffure',
        adresse: 'Cotonou, Bénin',
        telephone: '+229 00 00 00 00',
        email: process.env.ADMIN_EMAIL || 'admin@salon.com',
        dureeCreneauMinutes: 30,
      },
    });
    console.log('✅ Salon créé.');
  }

  // Horaires par défaut : Lundi-Samedi 8h-18h, fermé le dimanche
  const horairesExistants = await prisma.horaireOuverture.count({ where: { salonId: salon.id } });
  if (horairesExistants === 0) {
    const jours = [0, 1, 2, 3, 4, 5, 6];
    await prisma.horaireOuverture.createMany({
      data: jours.map((jourSemaine) => ({
        salonId: salon.id,
        jourSemaine,
        heureDebut: '08:00',
        heureFin: '18:00',
        ferme: jourSemaine === 0, // dimanche fermé
      })),
    });
    console.log('✅ Horaires par défaut créés.');
  }

  // Compte admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@salon.com';
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMoi123!', 12);
    await prisma.admin.create({
      data: { email: adminEmail, passwordHash, nom: 'Coiffeur Admin' },
    });
    console.log(`✅ Compte admin créé : ${adminEmail}`);
  }

  console.log('🌱 Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
