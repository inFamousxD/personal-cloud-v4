"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const notes_1 = __importDefault(require("./routes/notes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3333;
// CORS middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
let db;
const client = new mongodb_1.MongoClient(process.env.MONGODB_ATLAS_CONNECTION || '');
async function connectDB() {
    try {
        await client.connect();
        exports.db = db = client.db(); // Uses default database from connection string
        console.log('Connected to MongoDB Atlas');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
app.get('/', (_req, res) => {
    res.send('hello');
});
app.post('/post-test', (req, res) => {
    const data = req.body;
    console.log(data);
    (0, fs_1.writeFileSync)('test.txt', data.test);
    res.send(200);
});
// Mount notes routes
app.use('/api/notes', notes_1.default);
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
