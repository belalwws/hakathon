import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const statusParam = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    
    // إذا status=all يعني الماستر عايز كل المقالات
    if (statusParam !== 'all') {
      where.status = 'published'
      where.publishedAt = { lte: new Date() }
    }

    if (category && category !== 'all') {
      where.category = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { excerptAr: { contains: search, mode: 'insensitive' } },
        { excerptEn: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: {
                where: {
                  status: 'approved'
                }
              }
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      slug,
      titleAr,
      titleEn,
      excerptAr,
      excerptEn,
      contentAr,
      contentEn,
      coverImage,
      authorId,
      categoryId,
      tags,
      status,
      featured,
      publishedAt
    } = body

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create post
    const post = await prisma.blogPost.create({
      data: {
        slug,
        titleAr,
        titleEn,
        excerptAr,
        excerptEn,
        contentAr,
        contentEn,
        coverImage,
        authorId,
        categoryId,
        status: status || 'draft',
        featured: featured || false,
        publishedAt: status === 'published' ? (publishedAt || new Date()) : null,
        tags: {
          create: tags?.map((tagId: string) => ({
            tagId
          })) || []
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Blog post creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
