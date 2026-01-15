/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== Admin Setup Tool ===");
console.log("This script will make a user an ADMIN in your MongoDB database.\n");

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
}

async function run() {
    try {
        const uri = await ask("1. Enter your MongoDB Connection String (e.g., mongodb://localhost:27017/taskapp): ");
        if (!uri) throw new Error("Connection string is required");

        const email = await ask("2. Enter the Email of the user to make Admin: ");
        if (!email) throw new Error("Email is required");

        console.log("\nConnecting to database...");
        const client = new MongoClient(uri);

        try {
            await client.connect();
            console.log("Connected successfully.");

            // List databases to find the right one if not specified? 
            // Usually connection string has DB name, or it defaults to 'test'.
            // Let's assume the user knows, or we default to 'taskmgr' or similar via user input?
            // Better: Ask for DB name if not in URI?
            // Let's try to list collections in the default db.

            const db = client.db(); // Uses DB from URI
            console.log(`Using database: ${db.databaseName}`);

            const usersCollection = db.collection('users');

            console.log(`Searching for user with email: ${email}...`);
            const user = await usersCollection.findOne({ email });

            if (!user) {
                console.error(`\n❌ User not found! Please log in with this email in the app first to create the account.`);
            } else {
                await usersCollection.updateOne({ email }, { $set: { role: 'ADMIN' } });
                console.log(`\n✅ Success! User '${user.name}' (${email}) is now an ADMIN.`);
                console.log("Please log out and log back in to the application.");
            }

        } finally {
            await client.close();
        }
    } catch (error) {
        console.error("\n❌ Error:", error.message);
    } finally {
        rl.close();
    }
}

run();
