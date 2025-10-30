import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug: params.slug,
        status: 'published'
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
        },
        comments: {
          where: {
            status: 'approved'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const {
      titleAr,
      titleEn,
      excerptAr,
      excerptEn,
      contentAr,
      contentEn,
      coverImage,
      categoryId,
      tags,
      status,
      featured
    } = body

    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: {
        titleAr,
        titleEn,
        excerptAr,
        excerptEn,
        contentAr,
        contentEn,
        coverImage,
        categoryId,
        status,
        featured,
        publishedAt: status === 'published' ? new Date() : null,
        tags: {
          deleteMany: {},
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

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post update error:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.blogPost.delete({
      where: { slug: params.slug }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blog post deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
