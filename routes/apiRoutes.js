import { Router as expressRouter } from "express";
const apiRouter = expressRouter()
import {Card, Sale, Expense} from "../models.js"


//get menu items cards content
apiRouter.get('/getCards', async (req, res) => {
    console.log("/getCards request")
    const cards = await Card.find({})
    res.json(cards)
    console.log("Cards sent")
})

//add sale
apiRouter.post('/addSale', (req, res) => {
    console.log("/addSale post request")

    addMongoSale(req.body.item , req.body.price, req.body.qty)
    res.json({ message: 'Data received successfully' });

    console.log("Sale added")
})
//add expense
apiRouter.post('/addExpense', (req, res) => {
    console.log("/addExpense post request")

    addMongoExpense(req.body.item , req.body.price, req.body.qty, 'lorem ipsum dolor')
    res.json({ message: 'Data received successfully' });
    
    console.log("Expense added")
})

//get sales-expenses data for certain month/full year
apiRouter.post('/fetchSheet', async (req, res)=>{
    console.log("/fetchSheet request")
    const {month, year} = req.body
    let sales, expenses;
    if (month < 13) {
        sales = await Sale.find({deleted: false, "date.month": month, "date.year": year}, {__v: 0}).sort({"date.date":1})
        expenses = await Expense.find({deleted: false, "date.month": month, "date.year": year}, {__v: 0}).sort({"date.date":1})
        res.json({sales, expenses})
    }else {
        const data = await getFullYearData(year);
        res.json(data)
        console.log("/fetchSheet responded")
    }
})

//delete order
apiRouter.post('/delete', async (req, res)=>{
    console.log("/delete post request");
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
        console.log("deleted");
    }else{
        res.json({message: 'false', err: 'There was a server error deleting this item.'})
        console.log("error");
    }
})


///functions
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

//connect  auth router
import authRouter from "./authRoutes.js";
apiRouter.use('/auth', authRouter)

export default apiRouter