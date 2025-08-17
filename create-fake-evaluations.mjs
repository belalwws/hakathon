import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("🎯 بدء إنشاء تقييمات وهمية...")
        
        // الحصول على جميع المحكمين
        const judges = await prisma.judge.findMany()
        console.log(`👨‍⚖️ عدد المحكمين: ${judges.length}`)
        
        // الحصول على جميع الفرق
        const teams = await prisma.team.findMany({
            orderBy: { team_number: 'asc' }
        })
        console.log(`👥 عدد الفرق: ${teams.length}`)
        
        // حذف التقييمات الموجودة أولاً
        const deleted = await prisma.score.deleteMany({})
        console.log(`🗑️ تم حذف ${deleted.count} تقييم سابق`)
        
        let totalEvaluations = 0;
        
        // إنشاء تقييمات لكل محكم وكل فريق
        for (let i = 0; i < judges.length; i++) {
            const judge = judges[i]
            console.log(`\n📝 إنشاء تقييمات للمحكم ${i+1}: ${judge.name}`)
            
            for (let j = 0; j < teams.length; j++) {
                const team = teams[j]
                
                // توليد درجة عشوائية واقعية بين 2.0 و 4.5
                const baseScore = 2.0 + Math.random() * 2.5;
                const finalScore = Math.round(baseScore * 100) / 100;
                
                await prisma.score.create({
                    data: {
                        judge_id: judge.id,
                        team_id: team.id,
                        score: finalScore
                    }
                })
                
                totalEvaluations++
                console.log(`   ✅ فريق ${team.team_number}: ${finalScore}/5.0`)
            }
        }
        
        console.log(`\n🎉 تم إنشاء ${totalEvaluations} تقييم وهمي بنجاح!`)
        console.log("🏆 يمكنك الآن اختبار صفحة النتائج!")
        
    } catch (error) {
        console.error("❌ خطأ:", error.message)
        throw error
    }
}

main()
    .catch((e) => {
        console.error("❌ فشل في إنشاء التقييمات:", e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 