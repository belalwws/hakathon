import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const emails = [
    "judge1@hackathon.gov.sa",
    "judge2@hackathon.gov.sa",
    "judge3@hackathon.gov.sa",
  ]

  const judges = await prisma.judge.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  })

  if (judges.length === 0) {
    console.log("No placeholder judges found.")
    return
  }

  const judgeIds = judges.map((j) => j.id)

  const deletedScores = await prisma.score.deleteMany({
    where: { judge_id: { in: judgeIds } },
  })

  const deletedJudges = await prisma.judge.deleteMany({
    where: { id: { in: judgeIds } },
  })

  console.log(`Removed ${deletedJudges.count} judges and ${deletedScores.count} related scores.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 