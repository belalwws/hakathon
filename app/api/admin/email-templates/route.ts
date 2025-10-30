import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: [{ category: "asc" }, { nameAr: "asc" }]
    });

    // Parse attachments for all templates
    const templatesWithAttachments = templates.map(template => {
      const attachmentsField = (template as any).attachments;
      return {
        ...template,
        attachments: attachmentsField ? JSON.parse(attachmentsField as string) : []
      };
    });

    return NextResponse.json({ success: true, templates: templatesWithAttachments });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Allow both admin and supervisor
    const userRole = request.headers.get("x-user-role");
    if (!["admin", "supervisor"].includes(userRole || "")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 });
    }

    const body = await request.json();
    const { id, subject, bodyHtml, bodyText, isActive, attachments } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const updateData: any = { 
      subject, 
      bodyHtml, 
      bodyText, 
      isActive, 
      updatedAt: new Date() 
    };

    // إضافة المرفقات إذا كانت موجودة
    if (attachments !== undefined) {
      updateData.attachments = JSON.stringify(attachments);
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData
    });

    // إعادة parse للـ attachments قبل الإرجاع
    const attachmentsField = (template as any).attachments;
    const responseTemplate = {
      ...template,
      attachments: attachmentsField ? JSON.parse(attachmentsField as string) : []
    };

    return NextResponse.json({ success: true, template: responseTemplate });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
