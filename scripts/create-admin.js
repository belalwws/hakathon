const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log("🚀 إنشاء admin user...");

    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email: "admin@hackathon.com" },
    });

    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.user.create({
      data: {
        name: "مدير النظام",
        email: "admin@hackathon.com",
        password: hashedPassword,
        phone: "+966500000000",
        city: "الرياض",
        nationality: "سعودي",
        role: "admin",
        isActive: true,
        emailVerified: true,
      },
    });

    console.log("✅ تم إنشاء admin user:");
    console.log("📧 Email: admin@hackathon.com");
    console.log("🔑 Password: admin123");
    console.log("🆔 ID:", admin.id);
  } catch (error) {
    console.error("❌ خطأ:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
