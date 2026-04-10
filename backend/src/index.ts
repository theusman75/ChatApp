import "dotenv/config"
import express, { Application } from 'express';
import morgan from 'morgan';
import { createServer } from 'http';
import router from './routes/index';
import { initSocket } from './lib/socket';

const PORT = process.env.PORT || 3000;

const app: Application = express();
const httpServer = createServer(app); // wrap express with http server

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Init Socket.IO
initSocket(httpServer);

app.get("/", (req, res) => {
    res.send('Welcome to Juneteenth backend 😊.')
});
app.use(router);

// Server Listening
httpServer
    .listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
    .on("error", (error) => {
        throw new Error(error.message);
    });