require('dotenv').config();
const UserService = require('../services/userService');

async function main() {
  const userService = new UserService();

  const vendors = [
    {
      firstName: 'Alice',
      lastName: 'Vendor',
      email: 'alice.vendor@example.com',
      phone: '+201000000001',
      role: 'vendor',
      password: 'Vendor@1234',
      isVerified: true,
      company: 'Alice Dental Co',
      country: 'EG'
    },
    {
      firstName: 'Bob',
      lastName: 'Vendor',
      email: 'bob.vendor@example.com',
      phone: '+201000000002',
      role: 'vendor',
      password: 'Vendor@1234',
      isVerified: true,
      company: 'Bob Ortho Supplies',
      country: 'EG'
    },
    {
      firstName: 'Carol',
      lastName: 'Vendor',
      email: 'carol.vendor@example.com',
      phone: '+201000000003',
      role: 'vendor',
      password: 'Vendor@1234',
      isVerified: true,
      company: 'Carol Smile Tech',
      country: 'EG'
    }
  ];

  for (const v of vendors) {
    try {
      const existing = await userService.getUserByEmail(v.email);
      if (existing) {
        console.log(`Vendor already exists: ${v.email}`);
        continue;
      }
      const user = await userService.createUser(v);
      // Immediately mark verified if not already
      if (!user.isVerified) {
        await userService.updateProfile(user.id, { isVerified: true });
      }
      console.log(`Created vendor: ${v.email}`);
    } catch (e) {
      console.error(`Failed to create vendor ${v.email}:`, e.message);
    }
  }

  console.log('Vendor seeding complete.');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});




