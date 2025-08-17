import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
	// حذف الفريق رقم 19 إذا كان موجوداً
	const deletedTeam = await prisma.team.deleteMany({
		where: {
			team_number: {
				gt: 18  // أكبر من 18
			}
		}
	})
	console.log(`تم حذف ${deletedTeam.count} فريق زائد`)

	// Create teams (1-18) instead of 19
	for (let i = 1; i <= 18; i++) {
		await prisma.team.upsert({
			where: { team_number: i },
			update: {},
			create: { team_number: i },
		})
	}

	// Create admin account
	const adminPasswordHash = await bcrypt.hash("admin123", 12)
	await prisma.admin.upsert({
		where: { email: "admin@hackathon.gov.sa" },
		update: {},
		create: { name: "مدير النظام", email: "admin@hackathon.gov.sa", password_hash: adminPasswordHash },
	})

	// الأيميلات المسموح بها للمحكمين الـ 5
	const allowedEmails = [
		"Nizar@bu.edu.sa",
		"H.Mohammed@albaha.gov.sa", 
		"awaji@gdp.gov.sa",
		"Yzrashidi@gdp.gov.sa",
		"Chairman@sic.org.sa"
	]

	// حذف جميع المحكمين الآخرين (الذين ليسوا في القائمة المسموحة)
	const deletedJudges = await prisma.judge.deleteMany({
		where: {
			email: {
				notIn: allowedEmails
			}
		}
	})
	console.log(`تم حذف ${deletedJudges.count} محكم آخر`)

	// الـ 5 محكمين المحددين فقط
	const judges = [
		{ name: "د. نزار بن حسن محمد الشريف", email: "Nizar@bu.edu.sa", password: "Nizar@2025" },
		{ name: "مهندس هاني الغامدي", email: "H.Mohammed@albaha.gov.sa", password: "Hani@2025" },
		{ name: "العقيد علي بن صالح الزهراني", email: "awaji@gdp.gov.sa", password: "Ali@2025" },
		{ name: "نقيب مهندس/ يعقوب زعل الرشيدي", email: "Yzrashidi@gdp.gov.sa", password: "Yaqoub@2025" },
		{ name: "م. ماجد العنزوان (رئيس نادي الابتكار السعودي)", email: "Chairman@sic.org.sa", password: "Majed@2025" },
	]

	for (const judge of judges) {
		const password_hash = await bcrypt.hash(judge.password, 12)
		await prisma.judge.upsert({
			where: { email: judge.email },
			update: { name: judge.name, password_hash, is_active: true },
			create: { name: judge.name, email: judge.email, password_hash, is_active: true },
		})
	}

	console.log("تم إنشاء/تحديث الـ 5 محكمين المحددين بنجاح")
	console.log("المحكمين الموجودين الآن:")
	judges.forEach((judge, index) => {
		console.log(`${index + 1}. ${judge.name} - ${judge.email}`)
	})
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	}) 