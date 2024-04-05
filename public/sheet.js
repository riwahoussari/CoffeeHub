const navButtons = document.querySelectorAll('header .month')
const salesSection = document.getElementById('sales')
const expensesSection = document.getElementById('expenses')
const monthMenu = document.getElementById('monthMenu')
const yearMenu = document.getElementById('yearMenu')
const fetchUrl = "https://coffeehub-u2y1.onrender.com/"
//navigation between months
window.addEventListener('load', ()=>{
    const currentMonth = new Date().toISOString().split("-")[1]
    const currentYear = new Date().getFullYear()
    switchTo(currentMonth, String(currentYear))
    console.log('switchto triggered')
    document.querySelector(`#monthMenu option[value="${currentMonth}"]`).setAttribute('selected', true)
    document.querySelector(`#yearMenu option[value="${currentYear}"]`).setAttribute('selected', true)
})
monthMenu.addEventListener('change', (e) => {
    switchTo(e.target.value, yearMenu.value)
})
yearMenu.addEventListener('change', (e) => {
    switchTo(monthMenu.value, e.target.value)
})
function switchTo(month, year){
    //remove old rows
    let rows = document.querySelectorAll('.sheetRow');
    rows.forEach(row => {
    row.parentNode.removeChild(row);
    });

    //make current nav button active
    navButtons.forEach(btn => {
        if(btn.getAttribute('id') == month){btn.classList.add('active')}
        else{btn.classList.remove('active')}
    })

    //fetch data and display new rows
    fetch(`${fetchUrl}fetchSheet`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({month,year})
    })
    .then(res => {
        if (!res.ok) { throw new Error('Network response was not ok'); }
        return res.json();
      })
      .then(data => {
        if(month < 13) {
            salesSection.classList.remove('hidden')
            expensesSection.classList.remove('hidden')
            document.querySelector('main').classList.remove('fullYear')

            let totalSales = 0
            let totalExpenses = 0

            data.sales.forEach(({_id, date, item, price, qty, total}) => {
                let newDate = `${date.date}/${date.month}/${date.year}`
                createRow("sales", _id, newDate, item, price, qty, total)
                totalSales += total
            })
            data.expenses.forEach(({_id, date, item, price, qty, total}) => {
                let newDate = `${date.date}/${date.month}/${date.year}`
                createRow("expenses", _id, newDate, item, price, qty, total)
                totalExpenses += total
            })
            
            updateFooter(totalSales, totalExpenses)
        }
        else{
            salesSection.classList.add('hidden')
            expensesSection.classList.add('hidden')
            document.querySelector('main').classList.add('fullYear')
            let totalSales = 0;
            let totalExpenses = 0;
            Object.keys(data).sort().forEach(key => {
                createSpecialRow(key, data[key])
                totalExpenses += data[key].expenses
                totalSales += data[key].sales
            })
            updateFooter(totalSales, totalExpenses)
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

function updateFooter(sales, expenses){
    document.querySelector('footer .sales .number').textContent = formatLiras(sales)
    document.querySelector('footer .expenses .number').textContent = formatLiras(expenses)
    document.querySelector('footer .profit .number').textContent = formatLiras(sales - expenses)
    document.querySelector('footer .profitPercent .number').textContent = expenses && (100 * (sales - expenses)/expenses ).toFixed(2)

    if(sales - expenses > 0){
        document.querySelector('footer .profit .number').classList.add('green')
        document.querySelector('footer .profitPercent .number').classList.add('green')
    }else if(sales - expenses < 0){
        document.querySelector('footer .profit .number').classList.add('red')
        document.querySelector('footer .profitPercent .number').classList.add('red')
    }

    document.getElementById('sheet').style.paddingBottom = `${document.querySelector('footer').clientHeight * 2}px`
}

function createRow(section, id, date, name, price, qty, total){
    let sheetRow = document.createElement('div')
    sheetRow.classList.add('sheetRow')
    sheetRow.setAttribute('id', id)
    
    let dateElmt = document.createElement('p')
    dateElmt.classList.add('date')
    dateElmt.textContent = date
    sheetRow.appendChild(dateElmt)

    let nameElmt = document.createElement('p')
    nameElmt.classList.add('name')
    nameElmt.textContent = name
    sheetRow.appendChild(nameElmt)

    let priceElmt = document.createElement('p')
    priceElmt.classList.add('price')
    priceElmt.textContent = formatLiras(price)
    sheetRow.appendChild(priceElmt)

    let qtyElmt = document.createElement('p')
    qtyElmt.classList.add('qty')
    qtyElmt.textContent = `x${qty}`
    sheetRow.appendChild(qtyElmt)

    let totalElmt = document.createElement('p')
    totalElmt.classList.add('total')
    totalElmt.textContent = formatLiras(total)
    sheetRow.appendChild(totalElmt)


    //delete button + swipe to show the button

    let delBtn = document.createElement('button')
    delBtn.classList.add('delBtn')
    delBtn.textContent = 'x'
    sheetRow.appendChild(delBtn)
    delBtn.addEventListener('click', () => handleDelete(sheetRow))

    // Add event listeners for touch events
    sheetRow.addEventListener('touchstart', handleStart);
    sheetRow.addEventListener('touchend', e=> handleEnd(e, sheetRow));

    // Add event listeners for mouse events
    sheetRow.addEventListener('mousedown', handleStart);
    sheetRow.addEventListener('mouseup', e => handleEnd(e, sheetRow));



    if(section == 'sales'){salesSection.appendChild(sheetRow)}
    else{expensesSection.appendChild(sheetRow)}
}

function createSpecialRow(month, data){

    const months = {
        "01": 'Jan', "02": 'Feb', "03": 'Mar', "04": 'Apr', "05": 'May', "06": 'Jun', "07": 'Jul', "08": 'Aug', "09": 'Sep', "10": 'Oct', "11": 'Nov', "12": 'Dec'
    }

    let sheetRow = document.createElement('div')
    sheetRow.classList.add('sheetRow')
    
    let dateElmt = document.createElement('p')
    dateElmt.classList.add('date')
    dateElmt.textContent = months[String(month)]
    sheetRow.appendChild(dateElmt)

    let nameElmt = document.createElement('p')
    nameElmt.classList.add('name')
    nameElmt.textContent = formatLiras(data.sales)
    sheetRow.appendChild(nameElmt)

    let priceElmt = document.createElement('p')
    priceElmt.classList.add('price')
    priceElmt.textContent = formatLiras(data.expenses)
    sheetRow.appendChild(priceElmt)

    let qtyElmt = document.createElement('p')
    qtyElmt.classList.add('qty')
    qtyElmt.textContent = formatLiras(data.sales - data.expenses)
    sheetRow.appendChild(qtyElmt)

    
    let totalElmt = document.createElement('p')
    totalElmt.classList.add('total')
    totalElmt.textContent = data.expenses && `${(100*(data.sales - data.expenses)/data.expenses).toFixed(2)}%`
    sheetRow.appendChild(totalElmt)
    
    if(data.sales - data.expenses > 0){
        qtyElmt.classList.add('green')
        totalElmt.classList.add('green')
    } else if (data.sales - data.expenses < 0){
        qtyElmt.classList.add('red')
        totalElmt.classList.add('red')
    }

    document.querySelector('main').appendChild(sheetRow)
    
}
/////////////////////////////////////////////////////////////////////////////////////////
//swipe to show delete button
let startX = 0;
let endX = 0;

// Function to handle touchstart and mousedown events
function handleStart(event) {
    startX = event.clientX || event.touches[0].clientX;
}

// Function to handle touchend and mouseup events
function handleEnd(event, targetRow) {
    endX = event.clientX || event.changedTouches[0].clientX;
    handleSwipe(targetRow);
}

// Function to handle swipe
function handleSwipe(targetRow) {
    const swipeThreshold = 30; 
    const swipeDistance = endX - startX;
    
    if (swipeDistance < -swipeThreshold) {
        // Handle swipe left
        targetRow.classList.add('swiped')
    }
}

//function to reset items on click after a swipe
window.addEventListener('click', (e) => {

    const classes = ['date', 'name', 'price', 'qty', 'total', 'delBtn']
    let target = e.target

    //make sure it's a click and not a swipe
    if (!(Math.abs(endX - startX) > 30)) {
        //if the click happens on the elements contained in the 'sheetRow' make 'sheetRow' the target
        if (classes.includes(target.classList[0])){target = target.parentElement}
        //make sure the 'sheetRow' clicked isn't a swiped row
        if(![...target.classList].includes('swiped')){
            //reset rows' positions
            let sheetRow = document.querySelectorAll('.sheetRow')
            sheetRow.forEach(row => row.classList.remove('swiped'))
        }
    }
    
    
    endX = 0
    startX = 0
})

//function to delete items
const popup = document.querySelector('.popup')
const overlay = document.querySelector('.overlay')
let sheetRowToDelete;
function handleDelete(sheetRow){
    popup.classList.remove('hidden')
    overlay.classList.remove('hidden')
    sheetRowToDelete = sheetRow
}
popup.querySelector('.cancel').addEventListener('click', () => {
    popup.classList.add('hidden')
    overlay.classList.add('hidden')
})
popup.querySelector('.confirm').addEventListener('click', () => {

    fetch(`${fetchUrl}delete`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
            section: sheetRowToDelete.parentElement.getAttribute('id') , 
            id: sheetRowToDelete.getAttribute('id')
        })
    })
    .then(res => {
        if (!res.ok) { throw new Error('Network response was not ok'); }
        return res.json();
      })
      .then(data => {
        if(data.message == 'true'){
            sheetRowToDelete.parentNode.removeChild(sheetRowToDelete)
        }else{
            throw new Error(data.err)
        }
        popup.classList.add('hidden')
        overlay.classList.add('hidden')
      })
      .catch(error => {
        alert('Error. Something went wrong')
        console.error('Error:', error);
      });


})


//utility functions
function formatLiras(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}