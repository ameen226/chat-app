require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const URI = process.env.MONGO_URI;
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


// DB
async function main() {
    await mongoose.connect(URI);
    console.log('connected to DB');
}

const messageSchema = new mongoose.Schema({
    name: String,
    message: String
})

const Message = mongoose.model('Message', messageSchema);


// Middlewares
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



// Socket.io Connections
io.on('connection', () => {
    console.log('User is connected')
})



// Routes
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
})

app.post('/messages', async (req, res) => {
    const { name, message } = req.body;
    const messageDoc = await Message.create({
        name,
        message
    })
    io.emit('message', {
        name,
        message
    })
    res.sendStatus(200);
})


main().catch(
    err => {
        console.log(err);
    }
)

//server
const server = http.listen(3000, () => {
    console.log('Listening in port 3000');
})