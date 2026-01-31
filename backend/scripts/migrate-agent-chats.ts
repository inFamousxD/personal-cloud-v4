/**
 * Migration Script: Add agentId to existing agent chats
 * Run with: npx ts-node scripts/migrate-agent-id.ts
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_ATLAS_CONNECTION || '';
const DEFAULT_AGENT_ID = 'gemma3:4b'; // Change this to your preferred default model

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

        console.log('='.repeat(50));
        console.log('AGENT ID MIGRATION');
        console.log('='.repeat(50));
        console.log(`Default Agent ID: ${DEFAULT_AGENT_ID}\n`);

        // Step 1: Update existing chats to have agentId
        console.log('Step 1: Adding agentId to existing chats...');
        const chatsResult = await db.collection('agent_chats').updateMany(
            { agentId: { $exists: false } },
            { 
                $set: { 
                    agentId: DEFAULT_AGENT_ID 
                } 
            }
        );
        console.log(`✓ Updated ${chatsResult.modifiedCount} chats with agentId: ${DEFAULT_AGENT_ID}\n`);
        
        // Step 2: Update existing settings to have defaultAgentId
        console.log('Step 2: Adding defaultAgentId to user settings...');
        const settingsResult = await db.collection('agent_settings').updateMany(
            { defaultAgentId: { $exists: false } },
            { 
                $set: { 
                    defaultAgentId: DEFAULT_AGENT_ID,
                    updatedAt: new Date()
                } 
            }
        );
        console.log(`✓ Updated ${settingsResult.modifiedCount} user settings with defaultAgentId: ${DEFAULT_AGENT_ID}\n`);
        
        // Step 3: Create indexes for better performance
        console.log('Step 3: Creating indexes...');
        try {
            await db.collection('agent_chats').createIndex({ userId: 1, agentId: 1 });
            await db.collection('agent_chats').createIndex({ agentId: 1 });
            console.log('✓ Created indexes on agent_chats collection\n');
        } catch (error: any) {
            if (error.code === 85) {
                console.log('⚠ Indexes already exist, skipping...\n');
            } else {
                throw error;
            }
        }
        
        // Step 4: Verification
        console.log('Step 4: Verification...');
        const totalChats = await db.collection('agent_chats').countDocuments();
        const chatsWithAgent = await db.collection('agent_chats').countDocuments({ agentId: { $exists: true } });
        const chatsWithoutAgent = await db.collection('agent_chats').countDocuments({ agentId: { $exists: false } });
        
        console.log(`  Total chats: ${totalChats}`);
        console.log(`  Chats with agentId: ${chatsWithAgent}`);
        console.log(`  Chats without agentId: ${chatsWithoutAgent}`);
        
        if (chatsWithoutAgent > 0) {
            console.warn('\n⚠️  WARNING: Some chats still missing agentId!');
        } else {
            console.log('  ✓ All chats have agentId\n');
        }
        
        // Step 5: Agent distribution statistics
        console.log('Step 5: Agent distribution statistics...');
        const agentDistribution = await db.collection('agent_chats').aggregate([
            {
                $group: {
                    _id: '$agentId',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]).toArray();
        
        console.log('  Chats per agent:');
        agentDistribution.forEach(({ _id, count }) => {
            console.log(`    ${_id}: ${count} chats`);
        });
        console.log();
        
        // Step 6: Show sample of migrated data
        console.log('Step 6: Sample of migrated chats...');
        const sampleChats = await db.collection('agent_chats')
            .find({})
            .limit(5)
            .project({ _id: 1, title: 1, agentId: 1, userId: 1, createdAt: 1 })
            .toArray();
        
        if (sampleChats.length > 0) {
            console.table(sampleChats.map(chat => ({
                id: chat._id.toString().slice(-8),
                title: chat.title.slice(0, 30),
                agentId: chat.agentId,
                userId: chat.userId.slice(0, 8) + '...',
                created: new Date(chat.createdAt).toLocaleDateString()
            })));
        } else {
            console.log('  No chats found in database\n');
        }
        
        // Step 7: Verify settings
        console.log('Step 7: User settings verification...');
        const totalSettings = await db.collection('agent_settings').countDocuments();
        const settingsWithDefault = await db.collection('agent_settings').countDocuments({ 
            defaultAgentId: { $exists: true } 
        });
        
        console.log(`  Total user settings: ${totalSettings}`);
        console.log(`  Settings with defaultAgentId: ${settingsWithDefault}`);
        
        if (settingsWithDefault < totalSettings) {
            console.warn(`  ⚠️  ${totalSettings - settingsWithDefault} settings missing defaultAgentId`);
        } else {
            console.log('  ✓ All settings have defaultAgentId\n');
        }

        // Summary
        console.log('='.repeat(50));
        console.log('MIGRATION COMPLETE');
        console.log('='.repeat(50));
        console.log('\n✅ Summary:');
        console.log(`  • ${chatsResult.modifiedCount} chats updated with agentId`);
        console.log(`  • ${settingsResult.modifiedCount} user settings updated`);
        console.log(`  • ${totalChats} total chats in database`);
        console.log(`  • ${agentDistribution.length} different agents in use`);
        
        if (chatsWithoutAgent === 0 && settingsWithDefault === totalSettings) {
            console.log('\n✅ All data successfully migrated!');
        } else {
            console.log('\n⚠️  Migration completed with warnings - review output above');
        }
        
        console.log('\n💡 Next steps:');
        console.log('  1. Update your backend code with the new agent.ts routes');
        console.log('  2. Update your frontend code with the new AgentChat.tsx');
        console.log('  3. Restart your backend server');
        console.log('  4. Test creating new chats and loading existing ones');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✓ Disconnected from MongoDB');
    }
}

migrate();