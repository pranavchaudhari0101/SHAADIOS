import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ============================================
  // CREATE USERS
  // ============================================
  
  const passwordHash = await bcrypt.hash('Demo@123', 12)
  
  const rhea = await prisma.user.upsert({
    where: { email: 'rhea@example.com' },
    update: {},
    create: {
      email: 'rhea@example.com',
      passwordHash,
      fullName: 'Rhea Kapoor',
      phone: '+91 98201 11223',
      role: 'USER',
      emailVerified: true
    }
  })
  
  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@example.com' },
    update: {},
    create: {
      email: 'arjun@example.com',
      passwordHash,
      fullName: 'Arjun Mehta',
      phone: '+91 98190 44556',
      role: 'USER',
      emailVerified: true
    }
  })
  
  const mom = await prisma.user.upsert({
    where: { email: 'meera.k@example.com' },
    update: {},
    create: {
      email: 'meera.k@example.com',
      passwordHash,
      fullName: 'Meera Kapoor (Mom)',
      phone: '+91 98200 77889',
      role: 'USER',
      emailVerified: true
    }
  })
  
  const kavya = await prisma.user.upsert({
    where: { email: 'kavya.coord@example.com' },
    update: {},
    create: {
      email: 'kavya.coord@example.com',
      passwordHash,
      fullName: 'Kavya Shah',
      phone: '+91 99300 22334',
      role: 'USER',
      emailVerified: true
    }
  })
  
  console.log('✅ Created users:', { rhea: rhea.email, arjun: arjun.email })

  // ============================================
  // CREATE WEDDING
  // ============================================
  
  const wedding = await prisma.wedding.upsert({
    where: { id: 'wed-demo-001' },
    update: {},
    create: {
      id: 'wed-demo-001',
      ownerId: rhea.id,
      partner1Name: 'Rhea Kapoor',
      partner2Name: 'Arjun Mehta',
      couple: 'Rhea & Arjun',
      city: 'Jaipur',
      date: new Date('2027-02-18'),
      isoDate: '2027-02-18',
      season: 'Winter 2026/27',
      guestCount: 280,
      budgetAmount: 2400000,
      templateId: 'north_indian',
      ceremonies: ['Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception'],
      status: 'PLANNING',
      onTrackScore: 82
    }
  })
  
  console.log('✅ Created wedding:', wedding.couple)

  // ============================================
  // ADD COLLABORATORS
  // ============================================
  
  await prisma.weddingCollaborator.createMany({
    skipDuplicates: true,
    data: [
      {
        weddingId: wedding.id,
        userId: arjun.id,
        role: 'CO_OWNER',
        invitedBy: rhea.id,
        invitedAt: new Date(),
        acceptedAt: new Date()
      },
      {
        weddingId: wedding.id,
        userId: mom.id,
        role: 'FAMILY_LEAD',
        invitedBy: rhea.id,
        invitedAt: new Date(),
        acceptedAt: new Date()
      },
      {
        weddingId: wedding.id,
        userId: kavya.id,
        role: 'COORDINATOR',
        invitedBy: rhea.id,
        invitedAt: new Date(),
        acceptedAt: new Date()
      }
    ]
  })
  
  console.log('✅ Added collaborators')

  // ============================================
  // CREATE TASKS
  // ============================================
  
  const tasks = await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'task-venue',
        weddingId: wedding.id,
        title: 'Confirm venue contract with The Roseate',
        category: 'Venue',
        ceremony: 'Wedding',
        ownerId: rhea.id,
        ownerRole: 'owner',
        dueDate: new Date(),
        dueIsoDate: '2026-09-16',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        dependsOn: [],
        blocks: ['task-invitations', 'task-accommodation', 'task-decor'],
        notes: [
          'Site visit completed on 10 Sep. Banquet halls and central lawn shortlisted.',
          'Revised quote received: ₹5.4L including sound curfew waiver until 11 PM.'
        ]
      },
      {
        id: 'task-photographer',
        weddingId: wedding.id,
        title: 'Review photographer contract from Lenscraft Studios',
        category: 'Vendor',
        ceremony: 'All ceremonies',
        ownerId: arjun.id,
        ownerRole: 'co_owner',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        dueIsoDate: '2026-09-20',
        status: 'NOT_STARTED',
        priority: 'IMPORTANT',
        dependsOn: [],
        blocks: [],
        notes: ['Package covers Candid + Traditional + 3-min Teaser + Drone.']
      },
      {
        id: 'task-accommodation',
        weddingId: wedding.id,
        title: 'Confirm family hotel block quote',
        category: 'Accommodation',
        ceremony: 'Wedding',
        ownerId: mom.id,
        ownerRole: 'family_lead',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        dueIsoDate: '2026-09-22',
        status: 'WAITING',
        priority: 'WAITING',
        dependsOn: ['task-venue'],
        blocks: ['task-travel-logistics'],
        notes: ['Need 25 Deluxe rooms + 15 Club rooms within 4km radius of venue.']
      },
      {
        id: 'task-decor',
        weddingId: wedding.id,
        title: 'Finalize decor moodboard & stage designs',
        category: 'Decor',
        ceremony: 'Sangeet',
        ownerId: rhea.id,
        ownerRole: 'owner',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        dueIsoDate: '2026-10-06',
        status: 'BLOCKED',
        priority: 'BLOCKED',
        dependsOn: ['task-venue'],
        blocks: [],
        notes: ['Mogra & Co. submitted 2 concept drafts: Marigold Sunset & Royal Ivory.']
      }
    ]
  })
  
  console.log('✅ Created', tasks.count, 'tasks')

  // ============================================
  // CREATE VENDORS
  // ============================================
  
  const vendors = await prisma.vendor.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'v-roseate',
        weddingId: wedding.id,
        name: 'The Roseate',
        category: 'Venue',
        state: 'CONTRACT_PENDING',
        contactPerson: 'Vikram Singhania',
        phone: '+91 98290 12345',
        amount: 540000,
        holdDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        relatedTaskId: 'task-venue',
        inclusions: [
          'Grand Ballroom & Lawn (11 PM sound curfew waiver)',
          'Dedicated bridal lounge',
          'Valet parking for 120 cars'
        ],
        notes: 'Holding banquet + lawn for Feb 18. Token advance of 20% required.'
      },
      {
        id: 'v-lenscraft',
        weddingId: wedding.id,
        name: 'Lenscraft Studios',
        category: 'Photography',
        state: 'SELECTED',
        contactPerson: 'Aakash Verma',
        phone: '+91 98111 88990',
        amount: 120000,
        holdDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        relatedTaskId: 'task-photographer',
        inclusions: [
          '2 Candid photographers',
          '2 Traditional videographers',
          'Drone coverage for Sangeet & Baarat'
        ],
        notes: 'Date hold expires 22 Sep. Includes drone cinematography and teaser reel.'
      }
    ]
  })
  
  console.log('✅ Created', vendors.count, 'vendors')

  // ============================================
  // CREATE GUESTS
  // ============================================
  
  const guests = await prisma.guest.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'g-1',
        weddingId: wedding.id,
        name: 'Rajinder Kapoor (Tauji & Taiji)',
        side: 'BRIDE',
        groupName: 'VIP Elders',
        relation: 'Bride Paternal Uncle',
        partySize: 4,
        phone: '+91 98111 22334',
        city: 'Amritsar',
        rsvpStatus: 'CONFIRMED',
        events: ['Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception'],
        stayRequired: true,
        dietary: 'Pure Veg',
        notes: 'Require ground floor room close to elevator for Taiji.'
      },
      {
        id: 'g-2',
        weddingId: wedding.id,
        name: 'Sunita & Vikram Malhotra (Masi & Masa)',
        side: 'BRIDE',
        groupName: 'VIP Elders',
        relation: 'Bride Maternal Aunt',
        partySize: 3,
        phone: '+91 98222 33445',
        city: 'Mumbai',
        rsvpStatus: 'CONFIRMED',
        events: ['Haldi', 'Sangeet', 'Wedding', 'Reception'],
        stayRequired: true,
        dietary: 'Jain',
        notes: 'Strict Jain food without onion/garlic/root vegetables.'
      }
    ]
  })
  
  console.log('✅ Created', guests.count, 'guests')

  // ============================================
  // CREATE ROOMS
  // ============================================
  
  const rooms = await prisma.room.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'r-101',
        weddingId: wedding.id,
        roomNumber: '101',
        type: 'Heritage Deluxe Suite',
        capacity: 4,
        wing: 'Bride Family Wing (East)',
        assignedGuestIds: ['g-1'],
        status: 'OCCUPIED'
      },
      {
        id: 'r-102',
        weddingId: wedding.id,
        roomNumber: '102',
        type: 'Deluxe Courtyard King',
        capacity: 3,
        wing: 'Bride Family Wing (East)',
        assignedGuestIds: ['g-2'],
        status: 'OCCUPIED'
      }
    ]
  })
  
  console.log('✅ Created', rooms.count, 'rooms')

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================
  
  const notifications = await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        weddingId: wedding.id,
        userId: arjun.id,
        title: 'Photographer hold expires in 4 days',
        description: 'Lenscraft Studios will release 18 Feb 2027 if the agreement is not signed by 22 Sep.',
        type: 'CRITICAL',
        taskId: 'task-photographer'
      },
      {
        weddingId: wedding.id,
        userId: mom.id,
        title: 'Waiting on hotel quote',
        description: 'Royal Palace Suites sales manager has taken 48 hours. Consider a WhatsApp reminder.',
        type: 'WAITING',
        taskId: 'task-accommodation'
      }
    ]
  })
  
  console.log('✅ Created', notifications.count, 'notifications')

  // ============================================
  // CREATE CONTINGENCY
  // ============================================
  
  await prisma.contingency.upsert({
    where: { weddingId: wedding.id },
    update: {},
    create: {
      weddingId: wedding.id,
      gstRate: 18,
      gstEnabled: true,
      extraPlatesPct: 10,
      plateCost: 2200,
      alcoholCorkage: 65000,
      soundPplLicense: 40000,
      generatorDieselBackup: 35000,
      shagunTipsReserve: 50000
    }
  })
  
  console.log('✅ Created contingency settings')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\nTest credentials:')
  console.log('  Email: rhea@example.com')
  console.log('  Password: Demo@123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
