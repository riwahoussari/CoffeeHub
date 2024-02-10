import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

XLSX.set_fs(fs);
//server
import express from 'express';
import path from 'path';
import cors from 'cors'

const app = express();
const PORT = 5050;

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static('public'));

app.use(express.json())
app.use(cors())
app.post('/addSale', (req, res) => {
  console.log('received sale')
  addSale(formatDate(), req.body.item , req.body.price, req.body.qty)
  
  res.json({ message: 'Data received successfully' });
  console.log('sale added')
})
app.post('/addExpense', (req, res) => {
  console.log('received expense')
  addExpense(formatDate(), req.body.item , req.body.price, req.body.qty)
  res.json({ message: 'Data received successfully' });
  console.log('added expense')
})

app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


function addSale(date, item, price, qty){
    //get workbook and worksheet
    const currentMonth = getMonth()
    //get workbook and worksheet
    const workBook = XLSX.readFile("CoffeeHub.xlsx")
    const workSheet = workBook.Sheets[currentMonth]
    //get the new row index
    let rowNb = 2; 
    while (true) {
      //if current row has content continue looping
      if(workSheet['A' + rowNb] != null){
        rowNb++
      }
      //if current row is empty check the next 20 rows 
        //if we find content in a row then continue looping from that found row
        //else if all 10 rows are empty then break the loop and the rowNb = the empty row
      else {
        let correctRow = true;
        for(let i=1; i<11; i++){
            if(workSheet['A'+(rowNb+i)] != null) { 
              rowNb = rowNb + i + 1; 
              i=12; //break
              correctRow = false;
            }
        }
        if(correctRow){break}
      }
    }

    //add content to new cells
    workSheet['A' + rowNb] = {t:'s', v:`${date}`, r:`<t>${date}</t>`, h:`${date}`, w:`${date}`};
    workSheet['B' + rowNb] = { t:'s', v: `${item}`, r: `<t>${item}</t>`, h: `${item}`, w: `${item}` };
    workSheet['C' + rowNb] = { t:'n', v: price, w: `${price}`};
    workSheet['D' + rowNb] = { t:'n', v: qty, w: `${qty}` };
    workSheet['E' + rowNb] = { t:'n', v: price*qty, w: `${price*qty}` };

    //update xlsx file
    workBook.Sheets[currentMonth] = workSheet
    XLSX.writeFile(workBook, "CoffeeHub.xlsx")
}
function addExpense(date, item, price, qty){
    const currentMonth = getMonth()
    //get workbook and worksheet
    const workBook = XLSX.readFile("CoffeeHub.xlsx")
    const workSheet = workBook.Sheets[currentMonth]
    //get the new row index
    let rowNb = 2; 
    while (true) {
      //if current row has content continue looping
      if(workSheet['G' + rowNb] != null){
        rowNb++
      }
      //if current row is empty check the next 20 rows 
        //if we find content in a row then continue looping from that found row
        //else if all 10 rows are empty then break the loop and the rowNb = the empty row
      else {
        let correctRow = true;
        for(let i=1; i<11; i++){
            if(workSheet['G'+(rowNb+i)] != null) { 
              rowNb = rowNb + i + 1; 
              i=12; //break
              correctRow = false;
            }
        }
        if(correctRow){break}
      }
    }
    //add content to new cells
    workSheet['G' + rowNb] = {t:'s', v:`${date}`, r:`<t>${date}</t>`, h:`${date}`, w:`${date}`};
    workSheet['H' + rowNb] = { t:'s', v: `${item}`, r: `<t>${item}</t>`, h: `${item}`, w: `${item}` };
    workSheet['I' + rowNb] = { t:'n', v: price, w: `${price}`};
    workSheet['J' + rowNb] = { t:'n', v: qty, w: `${qty}` };
    workSheet['K' + rowNb] = { t:'n', v: price*qty, w: `${price*qty}` };

    //update xlsx file
    workBook.Sheets[currentMonth] = workSheet
    XLSX.writeFile(workBook, "CoffeeHub.xlsx")
}

function formatDate() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const currentDate = new Date();
  const dayOfWeek = days[currentDate.getDay()];
  const dayOfMonth = currentDate.getDate();
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return `${dayOfWeek} ${dayOfMonth < 10 ? '0' : ''}${dayOfMonth}/${months.indexOf(month) + 1 < 10 ? '0' : ''}${months.indexOf(month) + 1}/${year}`;
}
function getMonth(){
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentDate = new Date();
  const month = months[currentDate.getMonth()]
  return month
}

// function editRanges(){
//   const workBook = XLSX.readFile("CoffeeHub.xlsx")
  
//   Object.keys(workBook.Sheets).forEach(key=>{
//     if(key != "2024 SUMMARY"){
//       const sheet = workBook.Sheets[key]
//       const range = XLSX.utils.decode_range(sheet['!ref'])
//       range.e.r = 500
//       sheet["!ref"] = XLSX.utils.encode_range(range)
//       workBook.Sheets[key] = sheet
//     }
//   })
//   XLSX.writeFile(workBook, "CoffeeHub.xlsx")

// }
