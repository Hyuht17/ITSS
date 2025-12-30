import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js';
import MatchingRequest from '../models/MatchingRequest.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const seedMatchingRequests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing requests
        await MatchingRequest.deleteMany({});
        console.log('Cleared existing requests');

        // Find users
        const users = await User.find();
        if (users.length < 2) {
            console.log('Need at least 2 users to create requests');
            process.exit(1);
        }

        // Assume first user is "Me" (User A)
        const me = users[0];
        const others = users.slice(1);

        console.log(`Creating requests for User: ${me.email} (${me.name})`);

        const requests = [];

        // 1. Receive a request (Pending)
        if (others[0]) {
            requests.push({
                requesterId: others[0]._id,
                receiverId: me._id,
                status: 'pending',
                message: 'Hello, I would like to connect!'
            });
            console.log(`Creating INCOMING request from ${others[0].name}`);
        }

        // 2. Send a request (Pending)
        if (others[1]) {
            requests.push({
                requesterId: me._id,
                receiverId: others[1]._id,
                status: 'pending',
                message: 'Please accept my request.'
            });
            console.log(`Creating OUTGOING request to ${others[1].name}`);
        }

        // 3. Approved Match (Incoming)
        if (others[2]) {
            requests.push({
                requesterId: others[2]._id,
                receiverId: me._id,
                status: 'approved',
                message: 'Matched!'
            });
            console.log(`Creating APPROVED match with ${others[2].name}`);
        }

        await MatchingRequest.insertMany(requests);
        console.log('Seed completed successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding matching requests:', error);
        process.exit(1);
    }
};

seedMatchingRequests();
