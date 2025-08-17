import { PrismaClient } from "@prisma/client"
import { hashPassword } from "./lib/password"

const prisma = new PrismaClient()

async function main() {
	// Create teams (1-19) instead of 20
	for (let i = 1; i <= 19; i++) {
		await prisma.team.upsert({
			where: { team_number: i },
			update: {},
			create: { team_number: i },
		})
	}

	// Create admin account
	const adminPassword = await hashPassword("admin123")
	await prisma.admin.upsert({
		where: { email: "admin@hackathon.gov.sa" },
		update: {},
		create: { name: "مدير النظام", email: "admin@hackathon.gov.sa", password_hash: adminPassword },
	})

	// Create real judges with updated emails and names
	const judges = [
		{ name: "د. نزار بن حسن محمد الشريف", email: "Nizar@bu.edu.sa", password: "Nizar@2025" },
		{ name: "مهندس هاني الغامدي", email: "H.Mohammed@albaha.gov.sa", password: "Hani@2025" },
		{ name: "العقيد علي بن صالح الزهراني", email: "awaji@gdp.gov.sa", password: "Ali@2025" },
		{ name: "نقيب مهندس/ يعقوب زعل الرشيدي", email: "Yzrashidi@gdp.gov.sa", password: "Yaqoub@2025" },
		{ name: "م. ماجد العنزوان (رئيس نادي الابتكار السعودي)", email: "Chairman@sic.org.sa", password: "Majed@2025" },
	]

	for (const judge of judges) {
		const password_hash = await hashPassword(judge.password)
		await prisma.judge.upsert({
			where: { email: judge.email },
			update: { name: judge.name, password_hash },
			create: { name: judge.name, email: judge.email, password_hash },
		})
	}

	console.log("Database seeded successfully!")
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
