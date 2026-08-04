import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool);

async function seedUsers() {
  console.log('👤 Seeding users...');

  try {
    const userData = [
      {
        name: "David Float",
        email: "owner@openfloat.com",
        password: await hash("admin123", 10),
        role: "Owner",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Director User",
        email: "director@openfloat.com",
        password: await hash("director123", 10),
        role: "Director",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Peter Mwangi",
        email: "manager@openfloat.com",
        password: await hash("manager123", 10),
        role: "Branch Manager",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Bob Kamau",
        email: "accountant@openfloat.com",
        password: await hash("accountant123", 10),
        role: "Accountant",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Storekeeper User",
        email: "storekeeper@openfloat.com",
        password: await hash("storekeeper123", 10),
        role: "Storekeeper",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Jane Doe",
        email: "cashier@openfloat.com",
        password: await hash("cashier123", 10),
        role: "Cashier",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Alice Wambui",
        email: "hr@openfloat.com",
        password: await hash("hr123", 10),
        role: "Human Resource Officer",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Sarah Njeri",
        email: "procurement@openfloat.com",
        password: await hash("procurement123", 10),
        role: "Procurement Officer",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Sales User",
        email: "sales@openfloat.com",
        password: await hash("sales123", 10),
        role: "Sales Representative",
        branchId: 1,
        isActive: true,
      },
      {
        name: "Rider Kipchirchir",
        email: "rider@openfloat.com",
        password: await hash("rider123", 10),
        role: "Delivery Rider",
        branchId: 1,
        isActive: true,
      },
      {
        name: "System Admin",
        email: "admin@openfloat.com",
        password: await hash("admin123", 10),
        role: "System Administrator",
        branchId: 1,
        isActive: true,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const user of userData) {
      try {
        const existing = await db.select().from(users).where(eq(users.email, user.email));
        
        if (existing.length > 0) {
          console.log(`⏭️ User ${user.email} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        await db.insert(users).values(user);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
        created++;
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`⏭️ User ${user.email} already exists (duplicate), skipping...`);
          skipped++;
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error.message);
        }
      }
    }

    console.log(`\n📊 Summary: ${created} users created, ${skipped} users skipped`);

    // Show all users
    const allUsers = await db.select().from(users);
    console.log('\n📋 Current users in database:');
    allUsers.forEach(u => {
      console.log(`  ${u.email} (${u.role}) - ${u.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

    console.log('\n🎉 Users seeding complete!');
    console.log('\n📝 All Login Credentials:');
    console.log('👑 Owner: owner@openfloat.com / admin123');
    console.log('🎯 Director: director@openfloat.com / director123');
    console.log('📊 Branch Manager: manager@openfloat.com / manager123');
    console.log('💰 Accountant: accountant@openfloat.com / accountant123');
    console.log('📦 Storekeeper: storekeeper@openfloat.com / storekeeper123');
    console.log('💳 Cashier: cashier@openfloat.com / cashier123');
    console.log('👔 HR: hr@openfloat.com / hr123');
    console.log('📋 Procurement: procurement@openfloat.com / procurement123');
    console.log('🤝 Sales: sales@openfloat.com / sales123');
    console.log('🚚 Rider: rider@openfloat.com / rider123');
    console.log('🛠️ System Admin: admin@openfloat.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed users:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedUsers().catch(console.error);