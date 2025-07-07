const express = require('express')
const dotenv = require('dotenv')
dotenv.config();
const app = express();
const cors = require('cors');
const connectToDb = require('./db/db');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/user.routes')


connectToDb();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/user',userRoutes)


app.get('/',(req,res) => {
    res.send('Hello World');
})

module.exports = app;