import mongoose from "mongoose"
import passportLocalMongoose from 'passport-local-mongoose';
//Sales Model
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

//Expenses Model
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

//Card Model
const cardSchema = new mongoose.Schema({
type: String,
name: String,
price: String,
})
const Card = new mongoose.model('card', cardSchema)


//User Model
const userSchema = new mongoose.Schema ({
    //account info
    username: {type: String, unique: true, required: true},
})

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('user', userSchema)


export {Sale, Expense, Card, User};

