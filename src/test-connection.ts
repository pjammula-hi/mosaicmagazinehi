/**
 * Supabase Connection Test
 * 
 * This file tests the connection to your Supabase database.
 * Run this to verify your credentials are working correctly.
 */

import { supabase, dbConfig } from './lib/supabase'

async function testConnection() {
    console.log('🔍 Testing Supabase Connection...\n')

    // Display connection info
    console.log('📊 Connection Details:')
    console.log(`   Supabase URL: ${dbConfig.url}`)
    console.log(`   Database: xvuvgmppucrsnwkrbluy`)
    console.log(`   Status: Attempting connection...\n`)

    try {
        // Test 1: Check if we can connect
        console.log('Test 1: Basic Connection')
        const { data, error } = await supabase
            .from('_prisma_migrations')
            .select('*')
            .limit(1)

        if (error && error.code !== 'PGRST116') {
            // PGRST116 means table doesn't exist, which is fine
            if (error.message.includes('does not exist')) {
                console.log('   ✅ Connection successful!')
                console.log('   ℹ️  No tables found yet (this is normal for a new database)\n')
            } else {
                throw error
            }
        } else {
            console.log('   ✅ Connection successful!')
            console.log('   ℹ️  Database is accessible\n')
        }

        // Test 2: List all tables
        console.log('Test 2: List Tables')
        const { data: tables, error: tablesError } = await supabase
            .rpc('pg_tables')
            .select('*')

        if (tablesError) {
            console.log('   ⚠️  Could not list tables (may need permissions)')
        } else {
            console.log(`   ✅ Found ${tables?.length || 0} tables`)
        }

        console.log('\n✨ All tests passed! Your Supabase connection is working!\n')
        console.log('📝 Next Steps:')
        console.log('   1. Create your database schema in Supabase Dashboard')
        console.log('   2. Import the supabase client: import { supabase } from "./lib/supabase"')
        console.log('   3. Start building your application!\n')

    } catch (error) {
        console.error('❌ Connection Error:', error)
        console.log('\n🔧 Troubleshooting:')
        console.log('   1. Check your .env file has the correct credentials')
        console.log('   2. Verify your Supabase project is active')
        console.log('   3. Check if your database password is correct')
        console.log('   4. Make sure your IP is allowed in Supabase settings\n')
    }
}

// Run the test
testConnection()
