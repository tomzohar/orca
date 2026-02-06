import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('Instantiating PrismaClient...');
    try {
        const prisma = new PrismaClient();
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
