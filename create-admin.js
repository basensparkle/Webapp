const { createLocalUser } = require('./server/db.ts');
const { hashPassword } = require('./server/_core/localAuth.ts');
const { nanoid } = require('nanoid');

async function createAdmin() {
  try {
    const { hash, salt } = hashPassword('admin123456');
    const openId = `local_${nanoid(32)}`;
    
    const user = await createLocalUser({
      openId,
      email: 'admin@ict-eerbeek.test',
      name: 'Admin User',
      passwordHash: hash,
      passwordSalt: salt,
      loginMethod: 'local',
      role: 'admin',
      lastSignedIn: new Date(),
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@ict-eerbeek.test');
    console.log('Password: admin123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
