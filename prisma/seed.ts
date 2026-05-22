import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@govdeskbd.com' },
    update: {},
    create: {
      email: 'admin@govdeskbd.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
