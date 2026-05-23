import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin(email: string, password: string) {
  console.log(`\n🔍 Testing login with email: "${email}" and password: "${password}"`)
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    },
  })

  console.log('User query result:', user ? '✅ Found' : '❌ Not found')
  
  if (!user) {
    console.log('❌ Login failed: User not found')
    return
  }

  console.log('User data:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    passwordLength: user.password.length,
  })

  const passwordsMatch = await bcrypt.compare(password, user.password)
  console.log(`Password match: ${passwordsMatch ? '✅ YES' : '❌ NO'}`)

  if (passwordsMatch) {
    console.log('✅ Login successful!')
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } else {
    console.log('❌ Login failed: Invalid password')
  }
}

async function main() {
  // Test with the exact credentials the user is trying
  await testLogin('admin@govdeskbd.com', 'Admin@123')
  
  // Also test with lowercase
  await testLogin('admin@govdeskbd.com', 'Admin@123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
