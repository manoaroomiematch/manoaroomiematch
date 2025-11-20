/**
 * Script to create test data for the comparison page IF NEEDED
 *
 * Make sure you have tsx installed-> call this function first: npm install -D tsx
 *
 * Run this with: npx tsx setup-test-data.ts
 *
 * You can use this if you need to seed a local database, but it should be ok since it's on prisma
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...');

  // First, create two User accounts (needed because of the relation)
  const hashedPassword = await hash('password123', 10);

  const user1Account = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });
  console.log('✓ Created User account for Alice');

  const user2Account = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });
  console.log('✓ Created User account for Bob');

  // Create UserProfiles
  const user1 = await prisma.userProfile.upsert({
    where: { userId: user1Account.id },
    update: {},
    create: {
      userId: user1Account.id,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      sleepSchedule: 2, // Morning person
      cleanliness: 4, // Tidy
      noiseLevel: 2, // Quiet
      socialLevel: 3, // Balanced
      guestFrequency: 2,
      temperature: 3,
      smoking: false,
      drinking: 'occasionally',
      pets: false,
      petTypes: [],
      dietary: ['vegetarian'],
      interests: ['reading', 'hiking', 'cooking'],
      workSchedule: 'day',
      preferences: {},
    },
  });
  console.log('✓ Created UserProfile for Alice');

  const user2 = await prisma.userProfile.upsert({
    where: { userId: user2Account.id },
    update: {},
    create: {
      userId: user2Account.id,
      name: 'Bob Smith',
      email: 'bob@example.com',
      sleepSchedule: 3, // Flexible
      cleanliness: 3, // Moderate
      noiseLevel: 3, // Moderate
      socialLevel: 4, // Social
      guestFrequency: 3,
      temperature: 2,
      smoking: false,
      drinking: 'regularly',
      pets: true,
      petTypes: ['dog'],
      dietary: [],
      interests: ['gaming', 'hiking', 'movies'],
      workSchedule: 'day',
      preferences: {},
    },
  });
  console.log('✓ Created UserProfile for Bob');

  // Calculate compatibility scores (simple version)
  const categoryScores = {
    sleepCompatibility: 75,
    cleanlinessCompatibility: 70,
    socialCompatibility: 75,
    lifestyleCompatibility: 60,
    interestsCompatibility: 33,
  };
  const overallScore = 65;

  // Create a match between them
  const match = await prisma.match.create({
    data: {
      user1Id: user1.id,
      user2Id: user2.id,
      overallScore,
      categoryScores,
      status: 'pending',
      icebreakers: [],
    },
  });
  console.log('✓ Created Match');

  console.log('\n🎉 Test data created successfully!\n');
  console.log('===== IMPORTANT: SAVE THESE VALUES =====');
  console.log(`Match ID: ${match.id}`);
  console.log(`User 1 ID (Alice): ${user1.id}`);
  console.log(`User 2 ID (Bob): ${user2.id}`);
  console.log('========================================\n');
  console.log('To view the comparison page, visit:');
  console.log(`http://localhost:3000/comparison/${match.id}?userId=${user1.id}`);
  console.log('\nOr view from Bob\'s perspective:');
  console.log(`http://localhost:3000/comparison/${match.id}?userId=${user2.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
