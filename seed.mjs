import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
	// Create teams (1-20)
	for (let i = 1; i <= 20; i++) {
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

	// Judges
	const judges = [
		{ name: "الدكتور /  نزار بن حسن محمد الشريف", email: "nizar.alshareef@hackathon.gov.sa", password: "Nizar@2025" },
		{ name: "المهندس/ هاني محمد الغامدي", email: "hani.alghamdi@hackathon.gov.sa", password: "Hani@2025" },
		{ name: "عقيد/ على بن صالح الزهراني", email: "ali.alzahrani@hackathon.gov.sa", password: "Ali@2025" },
		{ name: "نقيب مهندس/يعقوب زعل الرشيدي", email: "yaqoub.alrashidi@hackathon.gov.sa", password: "Yaqoub@2025" },
		{ name: "المهندس /  ماجد بن محمد بن عنزان", email: "majed.anzan@hackathon.gov.sa", password: "Majed@2025" },
	]

	for (const judge of judges) {
		const password_hash = await bcrypt.hash(judge.password, 12)
		await prisma.judge.upsert({
			where: { email: judge.email },
			update: { name: judge.name, password_hash },
			create: { name: judge.name, email: judge.email, password_hash },
		})
	}

	console.log("Seeding completed successfully")
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	}) 