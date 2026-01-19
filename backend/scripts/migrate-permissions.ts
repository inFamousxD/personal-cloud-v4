/**
 * Migration Script: Set up permissions system
 * Run with: npx ts-node scripts/migrate-permissions.ts
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_ATLAS_CONNECTION || '';
const DEFAULT_DENIED_FEATURES = ['agent', 'terminal', 'server'];

async function migrate() {
    if (!MONGODB_URI) {
        console.error('ERROR: MONGODB_ATLAS_CONNECTION not set');
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        console.log('✓ Connected to MongoDB\n');

        // 1. Create default_permissions
        await db.collection('default_permissions').updateOne(
            { _id: 'default' as any },
            {
                $setOnInsert: {
                    deniedFeatures: DEFAULT_DENIED_FEATURES,
                    updatedAt: new Date(),
                    updatedBy: 'migration-script',
                },
            },
            { upsert: true }
        );
        console.log('✓ Default permissions configured');

        // 2. Create indexes
        const userPerms = db.collection('user_permissions');
        await userPerms.createIndex({ userId: 1 }, { unique: true });
        await userPerms.createIndex({ email: 1 }, { sparse: true });
        await userPerms.createIndex({ isAdmin: 1 });
        console.log('✓ Indexes created');

        // 3. Find all existing userIds
        const collections = ['notes', 'journals', 'folders', 'lists', 'list_folders', 'trackers', 'tracker_entries', 'tracker_folders', 'agent_chats', 'agent_messages'];
        const userIds = new Set<string>();

        for (const coll of collections) {
            try {
                const ids = await db.collection(coll).distinct('userId');
                ids.forEach(id => id && userIds.add(id));
            } catch { /* collection doesn't exist */ }
        }
        console.log(`✓ Found ${userIds.size} unique users`);

        // 4. Create user_permissions for each user
        let created = 0;
        for (const userId of userIds) {
            const result = await userPerms.updateOne(
                { userId },
                {
                    $setOnInsert: {
                        userId,
                        isAdmin: false,
                        deniedFeatures: [...DEFAULT_DENIED_FEATURES],
                        useDefaults: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        grantedBy: 'migration-script',
                    },
                },
                { upsert: true }
            );
            if (result.upsertedCount > 0) created++;
        }
        console.log(`✓ Created ${created} user permission records\n`);

        // Summary
        console.log('='.repeat(50));
        console.log('MIGRATION COMPLETE');
        console.log('='.repeat(50));
        console.log('\nSet yourself as admin:');
        console.log('  db.user_permissions.updateOne(');
        console.log('    { email: "YOUR_EMAIL@gmail.com" },');
        console.log('    { $set: { isAdmin: true } }');
        console.log('  )');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrate();