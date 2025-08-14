import { PrismaClient } from "@prisma/client"
import { hashPassword } from "./lib/auth"

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
	const adminPassword = await hashPassword("admin123")
	await prisma.admin.upsert({
		where: { email: "admin@hackathon.gov.sa" },
		update: {},
		create: { name: "مدير النظام", email: "admin@hackathon.gov.sa", password_hash: adminPassword },
	})

	// Create sample judges (5)
	const judgePassword = await hashPassword("judge123")
	const judges = [
		{ name: "د. أحمد محمد", email: "judge1@hackathon.gov.sa" },
		{ name: "د. فاطمة علي", email: "judge2@hackathon.gov.sa" },
		{ name: "م. خالد السعد", email: "judge3@hackathon.gov.sa" },
		{ name: "أ. ندى القحطاني", email: "judge4@hackathon.gov.sa" },
		{ name: "م. يوسف الحربي", email: "judge5@hackathon.gov.sa" },
	]
	for (const judge of judges) {
		await prisma.judge.upsert({
			where: { email: judge.email },
			update: {},
			create: { name: judge.name, email: judge.email, password_hash: judgePassword },
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
