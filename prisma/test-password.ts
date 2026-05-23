import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get the admin user from database
  const user = await prisma.user.findUnique({
    where: { email: 'admin@govdeskbd.com' },
  })

  if (!user) {
    console.log('❌ User not found in database')
    return
  }

  console.log('✅ User found:', user.email)
  console.log('   Password hash in DB:', user.password)
  console.log('   Password length:', user.password.length)

  // Test the password comparison
  const testPassword = 'Admin@123'
  const isMatch = await bcrypt.compare(testPassword, user.password)
  
  console.log(`\n🔐 Password verification:`)
  console.log(`   Input password: "${testPassword}"`)
  console.log(`   Hash matches: ${isMatch ? '✅ YES' : '❌ NO'}`)

  if (!isMatch) {
    console.log('\n💡 Trying to create a new hash...')
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log('   New hash:', newHash)
    
    // Update the user with the new hash
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    })
    console.log('   ✅ Password updated in database')
  }
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
