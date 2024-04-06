import 'dotenv/config'
import { fileURLToPath } from 'url';
import express from 'express';
import path from 'path';
import cors from 'cors'
import MongoStore from 'connect-mongo';
import session from 'express-session';
import passport from 'passport';
import mongoose from "mongoose";
import apiRouter from './routes/apiRoutes.js';

//server setup
const app = express();
const PORT = 5050;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//setup session and passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
      maxAge: 24 * 60 * 60 * 1000,
  },
  store: MongoStore.create({mongoUrl: process.env.MONGO_URL})
}))  
app.use(passport.initialize())
app.use(passport.session())


//mongo database
mongo().then(console.log('mongo connected successfully.')).catch(err => console.log('mongo err: ', err))
async function mongo(){
  await mongoose.connect(process.env.DB_URL ,{})
}


//middleware setup 
app.use(express.static('public'));
app.use(express.json())
app.use(cors())

app.use("/api", apiRouter)


//routes

app.get('/sheet', (req, res) => {
  console.log("/sheet get request");
  const indexPath = path.resolve(__dirname, 'public', 'sheet.html');
  res.sendFile(indexPath);
  console.log("sheet responded");
});
app.get('*', (req, res) => {
  console.log("* get request");
  const indexPath = path.resolve(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
  console.log("* responded");
});
app.listen(PORT, () => {
  console.log(`Server is up and running`);
});






