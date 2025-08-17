import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("التحقق من المحكمين الموجودين:")
    const judges = await prisma.judge.findMany({
        orderBy: { email: 'asc' }
    })
    
    console.log(`عدد المحكمين: ${judges.length}`)
    judges.forEach((judge, index) => {
        console.log(`${index + 1}. ${judge.name} - ${judge.email} (نشط: ${judge.is_active})`)
    })
    
    // التحقق من المحكمين المطلوبين
    const requiredEmails = [
        "Nizar@bu.edu.sa",
        "H.Mohammed@albaha.gov.sa", 
        "awaji@gdp.gov.sa",
        "Yzrashidi@gdp.gov.sa",
        "Chairman@sic.org.sa"
    ]
    
    console.log("\nالتحقق من وجود المحكمين المطلوبين:")
    for (const email of requiredEmails) {
        const judge = judges.find(j => j.email === email)
        if (judge) {
            console.log(`✅ ${email} - موجود`)
        } else {
            console.log(`❌ ${email} - غير موجود`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 