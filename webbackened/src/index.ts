import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Redis from 'ioredis';
import cors from 'cors';
import mongoose from 'mongoose';

// --- Configuration ---
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatApp';

// --- Database Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Database Schemas ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    roomId: { type: String, required: true, index: true },
    sender: {
        id: { type: String },
        name: { type: String, required: true },
        avatar: { type: String }
    },
    text: { type: String, required: true },
    timestamp: { type: String, required: true }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// --- Express App Setup ---
const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);

interface AuthWebSocket extends WebSocket {
    userId: string;
    username: string;
    currentRoom?: string;
}

// --- Helper Function to Format Data ---
// THE FIX: This function converts MongoDB documents (_id) to frontend-friendly objects (id).
const formatMessageForFrontend = (messageDoc: any) => {
    // Mongoose documents have a .toObject() method to convert them to plain objects
    const messageObject = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
    const { _id, __v, ...rest } = messageObject; // Destructure to remove _id and __v
    return {
        id: _id.toString(), // Rename _id to id and convert to string
        ...rest
    };
};


// --- Auth Endpoints ---
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send('Username and password required');
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).send('Username already exists');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// --- WebSocket Logic ---
wss.on('connection', (ws: AuthWebSocket, req) => {
    try {
        const token = req.url?.split('?token=')[1];
        if (!token) throw new Error("Token not provided");
        const decoded: any = jwt.verify(token, JWT_SECRET);
        ws.userId = decoded.userId;
        ws.username = decoded.username;
        console.log(`User connected: ${ws.username}`);
    } catch (e) {
        ws.close(1008, "Invalid token");
        return;
    }

    ws.on('message', async (message) => {
        const parsedMessage = JSON.parse(message.toString());
        const { type, payload } = parsedMessage;

        switch (type) {
            case 'join':
                if (ws.currentRoom) sub.unsubscribe(ws.currentRoom);
                ws.currentRoom = payload.roomId;
                sub.subscribe(ws.currentRoom, (err) => {
                    if (err) return console.error('Redis subscription failed', err);
                });

                // THE FIX: Fetch history and format each message for the frontend.
                const history = await Message.find({ roomId: ws.currentRoom }).sort({ createdAt: 1 }).limit(50).lean();
                const formattedHistory = history.map(formatMessageForFrontend);
                ws.send(JSON.stringify({ type: 'history', payload: formattedHistory }));
                break;

            case 'chat':
                if (ws.currentRoom) {
                    const messagePayload = {
                        roomId: ws.currentRoom,
                        text: payload.message,
                        sender: {
                            id: ws.userId,
                            name: ws.username,
                            avatar: `https://i.pravatar.cc/40?u=${ws.userId}`
                        },
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    
                    const newMessage = new Message(messagePayload);
                    await newMessage.save();

                    // THE FIX: Format the new message before broadcasting it.
                    const formattedMessage = formatMessageForFrontend(newMessage);
                    pub.publish(ws.currentRoom, JSON.stringify({ type: 'message', payload: formattedMessage }));
                }
                break;
            
            case 'clear_chat':
                 if (ws.currentRoom) {
                    await Message.deleteMany({ roomId: ws.currentRoom });
                    pub.publish(ws.currentRoom, JSON.stringify({ type: 'chat_cleared' }));
                }
                break;
        }
    });

    ws.on('close', () => {
        if (ws.currentRoom) sub.unsubscribe(ws.currentRoom);
        console.log(`User disconnected: ${ws.username}`);
    });
});

sub.on('message', (channel, message) => {
    wss.clients.forEach(client => {
        const authClient = client as AuthWebSocket;
        if (authClient.readyState === WebSocket.OPEN && authClient.currentRoom === channel) {
            authClient.send(message);
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
