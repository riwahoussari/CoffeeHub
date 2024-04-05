import 'dotenv/config'
import { fileURLToPath } from 'url';
//server
import express from 'express';
import path from 'path';
import cors from 'cors'

////////////////////////////////////////////////////////////
//mongo database
import mongoose from "mongoose";
mongo().then(console.log('mongo connected successfully.')).catch(err => console.log('mongo err: ', err))
async function mongo(){
  await mongoose.connect(process.env.DB_URL ,{})
}

//schemas - models
const saleSchema = new mongoose.Schema({
  date: Object,
  item: String,
  price: Number,
  qty: Number,
  total: Number,
  deleted: Boolean,
  deleteDate: String
})
const Sale = new mongoose.model('sale', saleSchema)
const expenseSchema = new mongoose.Schema({
  date: Object,
  item: String,
  price: Number,
  qty: Number,
  total: Number,
  deleted: Boolean,
  deleteDate: String
})
const Expense = new mongoose.model('expense', expenseSchema)
const cardSchema = new mongoose.Schema({
  type: String,
  name: String,
  price: String,
})
const Card = new mongoose.model('card', cardSchema)


//////////////////////////////////////////////////////////
//server setup
const app = express();
const PORT = 5050;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static('public'));

app.use(express.json())
app.use(cors())


//////////////////////////////////////////////////////////
//routes
app.get('/getCards', async (req, res) => {
  const cards = await Card.find({})
  res.json(cards)
})
app.post('/addSale', (req, res) => {
  addMongoSale(req.body.item , req.body.price, req.body.qty)
  res.json({ message: 'Data received successfully' });
})
app.post('/addExpense', (req, res) => {
  addMongoExpense(req.body.item , req.body.price, req.body.qty, 'lorem ipsum dolor')
  res.json({ message: 'Data received successfully' });
})

app.post('/fetchSheet', async (req, res)=>{
  const {month, year} = req.body
  let sales, expenses;
  if (month < 13) {
    sales = await Sale.find({deleted: false, "date.month": month, "date.year": year}, {__v: 0}).sort({"date.date":1})
    expenses = await Expense.find({deleted: false, "date.month": month, "date.year": year}, {__v: 0}).sort({"date.date":1})
    res.json({sales, expenses})
  }else {
    const data = await getFullYearData(year);
    res.json(data)
  }
})
app.post('/delete', async (req, res)=>{
  const {section, id} = req.body
  let record;
  if (section == 'sales'){
    record = await Sale.findOneAndUpdate({_id: id}, {$set: {deleted: true, deleteDate: new Date().toLocaleString()}}, {new: true})
  }
  else{
    record = await Expense.findOneAndUpdate({_id: id}, {$set: {deleted: true, deleteDate: new Date().toLocaleString()}}, {new: true})
  }

  if(!!record){
    res.json({message: "true"})
  }else{
    res.json({message: 'false', err: 'There was a server error deleting this item.'})
  }
})


app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});
app.listen(PORT, () => {
  console.log(`Server is up and running`);
});


//////////////////////////////////////////////////////////
//functions
function addMongoSale( item, price, qty){
  const {date, month, year} = formatDate()
  new Sale({deleted: false, deleteDate: null, date: {date, month, year}, item, price, qty, total: price*qty}).save()
}
function addMongoExpense( item, price, qty, description){
  const {date, month, year} = formatDate()
  new Expense({deleted: false, deleteDate: null, date: {date, month, year}, item, price, qty, total: price*qty, description}).save()
}

async function getFullYearData(year){
  const months = {
    "01": {}, "02": {}, "03": {}, "04": {}, "05": {}, "06": {}, "07": {}, "08": {}, "09": {}, "10": {}, "11": {}, "12": {}
  }

  for (let key in months){
    let totalMonthSales = 0;
    const sales = await Sale.find({deleted: false, "date.month": key, "date.year": year}, { total: 1})
    sales.forEach(sale => totalMonthSales += sale.total)
    
    let totalMonthExpenses = 0;
    const expenses = await Expense.find({deleted: false, "date.month": key, "date.year": year}, { total: 1})
    expenses.forEach(expense => totalMonthExpenses += expense.total)

    months[key] = {sales: totalMonthSales, expenses: totalMonthExpenses}
  }
  
  return months
}

function formatDate() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const currentDate = new Date();
  const dayOfWeek = days[currentDate.getDay()];
  const dayOfMonth = currentDate.getDate();
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return {
    date: `${dayOfMonth < 10 ? '0' : ''}${dayOfMonth}`,
    month: `${months.indexOf(month) + 1 < 10 ? '0' : ''}${months.indexOf(month) + 1}`,
    year: `${year}`
  }
}

