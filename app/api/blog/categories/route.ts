import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'published'
              }
            }
          }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Blog categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, nameAr, nameEn, descriptionAr, descriptionEn, icon, color, order } = body

    const category = await prisma.blogCategory.create({
      data: {
        slug,
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        icon,
        color: color || '#6366f1',
        order: order || 0
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Blog category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
