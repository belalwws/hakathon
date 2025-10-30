import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// POST /api/emergency-restore - Emergency data restoration
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EMERGENCY RESTORE INITIATED')
    
    // Check if database is accessible
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Check if admin exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (adminExists) {
      console.log('✅ Admin user already exists:', adminExists.email)
      return NextResponse.json({
        message: 'Admin user already exists',
        admin: {
          email: adminExists.email,
          name: adminExists.name
        }
      })
    }

    // Create emergency admin
    console.log('👤 Creating emergency admin user...')
    const admin = await prisma.user.create({
      data: {
        name: 'Emergency Admin',
        email: 'admin@hackathon.com',
        password: await bcrypt.hash('admin123456', 12),
        role: 'admin',
        isActive: true,
        phone: '+966500000000',
        university: 'System Admin',
        major: 'Computer Science',
        graduationYear: new Date().getFullYear(),
        city: 'Riyadh',
        nationality: 'Saudi Arabia'
      }
    })

    console.log('✅ Emergency admin created successfully!')

    // Create sample hackathon if none exists
    const hackathonExists = await prisma.hackathon.findFirst()
    
    if (!hackathonExists) {
      console.log('🏆 Creating sample hackathon...')
      await prisma.hackathon.create({
        data: {
          title: 'هاكاثون الابتكار التقني',
          description: 'هاكاثون تجريبي لاختبار المنصة',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
          registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          maxParticipants: 100,
          status: 'OPEN',
          isPinned: false,
          location: 'الرياض، المملكة العربية السعودية',
          organizerName: 'منظم الهاكاثون',
          organizerEmail: 'organizer@hackathon.com',
          organizerPhone: '+966500000001',
          prizes: 'جوائز قيمة للفائزين',
          rules: 'قواعد المشاركة في الهاكاثون',
          requirements: 'متطلبات المشاركة',
          evaluationCriteria: 'معايير التقييم'
        }
      })
      console.log('✅ Sample hackathon created')
    }

    await prisma.$disconnect()

    return NextResponse.json({
      message: 'Emergency restoration completed successfully',
      admin: {
        email: 'admin@hackathon.com',
        password: 'admin123456',
        name: 'Emergency Admin'
      },
      instructions: [
        '1. Login with the admin credentials',
        '2. Change the admin password immediately',
        '3. Create your hackathons',
        '4. Test all functionality'
      ]
    })

  } catch (error) {
    console.error('❌ Emergency restore failed:', error)
    return NextResponse.json({ 
      error: 'Emergency restoration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
