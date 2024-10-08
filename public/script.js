// const fetchUrl = "http://127.0.0.1:5050/api/"
const fetchUrl = "https://lslcoffeehub.onrender.com/api/"




/////////////////////////////////////////////////////////////////////
//check authentication
fetch(`${fetchUrl}auth/checkAuth`, {method: "POST", credentials: "include"}).then(res => {
    if(!res.ok){throw new Error('server response not ok')}
    return res.json()
}).then(response => {
    console.log(response)
    if(!response.auth){
        window.location.href = "./login"
    }
}).catch(err => console.log(err))


let order = [];
const popup = document.querySelector('.popup')
const overlay = document.querySelector('.overlay')
const orderBtn = document.querySelector('button.order')





///////////////////////////////////////////////////////////////////////
//place order

//when order button is clicked display popup to confirm order
orderBtn.addEventListener('click', ()=>{
    if(order.length > 0){
        popup.classList.remove('hidden')
        overlay.classList.remove('hidden')
    }
})
    //if confirmed place order
popup.querySelector('button.confirm').addEventListener('click', (e) => {
    if(!e.target.classList.contains('disabled')){
        postOrder()
        e.target.classList.add('disabled')
    }
})
    //if cancel hide popup
popup.querySelector('button.cancel').addEventListener('click', () => {
    popup.classList.add('hidden')
    overlay.classList.add('hidden')
    popup.querySelector('button.confirm').classList.remove('disabled')
})

async function postOrder() {
    let url = '';
    if(document.body.classList.contains('sales')){
        url = `${fetchUrl}addSale` ;
    }else {
        url = `${fetchUrl}addExpense`
    }
    
    const fetchPromises = order.map(item => {
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(item)
        })
        .then(res => {
            if(!res.ok) {
                popup.querySelector('button.confirm').classList.remove('disabled')
                alert('THERE WAS AN ERROR\nMake sure the excel sheet is closed. \nIf it is closed and the error still shows up contact the IT team :)')
            }
            return res.json()
        }).then(data => console.log(data)) 
    });

    try {
        await Promise.all(fetchPromises);
        clearOrder(true)
    } catch (error) {
        console.error('Error occurred during fetch:', error);
    }
}







////////////////////////////////////////////////////////////////////
//clear order

const clearSalesButton = document.querySelector('.sales.clearOrder')
const clearExpensesButton = document.querySelector('.expenses.clearOrder')

document.querySelectorAll('.clearOrder').forEach(btn => btn.addEventListener('click', () => clearOrder(false)))

function clearOrder(isAlert){
    order = [];
    document.querySelectorAll('#sidebar .items .item').forEach(item => item.remove())
    document.querySelector('#sidebar .total .price').textContent = '0LL'
    cards.forEach(card => {
        card.classList.remove('active')
        card.querySelector('.minus').classList.add('disabled');
        card.querySelector('.num').textContent = 0;
    })
    popup.classList.add('hidden')
    popup.querySelector('button.confirm').classList.remove('disabled')
    overlay.classList.add('hidden')

    isAlert && alert('Order added successfully!')
}





//////////////////////////////////////////////////////////////////////
//menu cards
const menu = document.getElementById('menu')
const cards = []

function createCard({type, name, price, img}){
    let card = document.createElement('div')
    card.classList.add("card")
    card.classList.add(type)
    type == 'expenses' && card.classList.add('hidden')

    let textDiv = document.createElement('div')
    textDiv.classList.add('text')

    let itemName = document.createElement('p')
    itemName.classList.add('item')
    itemName.textContent = name
    textDiv.appendChild(itemName)
    
    let priceElm = document.createElement('p')
    priceElm.classList.add('price')
    priceElm.textContent = price
    textDiv.appendChild(priceElm)

    let qtyDiv = document.createElement('div')
    qtyDiv.classList.add('qty')

    let minusBtn = document.createElement('button')
    minusBtn.classList.add('minus')
    qtyDiv.appendChild(minusBtn)
    
    let qtyNum = document.createElement('p')
    qtyNum.classList.add('num')
    qtyNum.textContent = '0'
    qtyDiv.appendChild(qtyNum)
    
    let plusBtn = document.createElement('button')
    plusBtn.classList.add('plus')
    qtyDiv.appendChild(plusBtn)

    //append divs to card
    card.appendChild(textDiv)
    card.appendChild(qtyDiv)

    //append card to menu
    if(type == 'sales'){
        menu.insertBefore(card, customeOrderSalesButton)
    }else{
        menu.insertBefore(card, customeOrderExpensesButton)
    }

    //card click functionality
    card.addEventListener('click', ()=>{

        //change card style
        card.classList.add('active')
        minusBtn.classList.remove('disabled')

        //increase qty
        qtyNum.textContent++

        //if the first time adding this item add it to the order list
        if(qtyNum.textContent == 1){ 
            let itemName = plusBtn.parentElement.parentElement.querySelector('.item').textContent
            let itemPrice = plusBtn.parentElement.parentElement.querySelector('.price').textContent.replace(',', '').replace('L', '').replace('L', '')

            addItemToSidebar(itemName , itemPrice)
        } 

        //if not the first time increase the qty in the order list
        else { increaseQty(plusBtn) }
    })

    //minus button functionality
    minusBtn.classList.add('disabled')
    minusBtn.addEventListener('click', (e)=>{
        //make sure the card event listerner isn't triggered
        e.bubbles = false
        e.cancelBubble = true

        //decrease number
        qtyNum.textContent > 0 && qtyNum.textContent--
        decreaseQty(minusBtn);

        //if order qty is 0 remove it from order list 
        if(qtyNum.textContent == 0){ 
            removeItemFromSidebar(minusBtn);
            minusBtn.classList.add('disabled')
            card.classList.remove('active')
        } 

    })

    cards.push(card)
    return card
}
function createCards(){
    console.log('fetching cards')
    fetch(`${fetchUrl}getCards`)
    .then(res => {
        if (!res.ok) { throw new Error('Network response was not ok'); }
        return res.json();
    })
    .then(data => {
        data.forEach(obj => {
            createCard(obj)
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

createCards()






////////////////////////////////////////////////////////////////////
//add custom item 
const customItemForm = document.querySelector('.customItemForm')

const customItemFormNameInput = customItemForm.querySelector('input[name="name"]')
const customItemFormPriceInput = customItemForm.querySelector('input[name="price"]')

const customItemFormCancel = customItemForm.querySelector('button.cancel')
customItemFormCancel.addEventListener('click', hideCustomItemForm)

const customeOrderSalesButton = document.querySelector('.sales.customOrder')
const customeOrderExpensesButton = document.querySelector('.expenses.customOrder')

customeOrderSalesButton.addEventListener('click', () => showCustomItemForm('sales'))
customeOrderExpensesButton.addEventListener('click', () => showCustomItemForm('expenses'))


function showCustomItemForm(type) {
    overlay.classList.remove('hidden')
    customItemForm.classList.remove('hidden')

    customItemForm.classList.add(type)
    type == "sales" ? customItemForm.classList.remove('expenses') : customItemForm.classList.remove('sales')
}
function hideCustomItemForm() {
    customItemFormNameInput.value = ''
    customItemFormPriceInput.value = ''
    customItemForm.classList.add('hidden')
    overlay.classList.add('hidden')
}

customItemForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let type;
    customItemForm.classList.contains('sales') ? type = 'sales' : type = "expenses"

    let name = customItemFormNameInput.value
    let price = `${formatLiras(customItemFormPriceInput.value)}LL`

    let card = createCard({type, name, price})
    card.classList.remove('hidden')

    hideCustomItemForm()

})






////////////////////////////////////////////////////////////////////
//Functions

//add a new item in the sidebar order list
function addItemToSidebar(itemName, itemPrice){
    // console.log(btn)
    // add new item
    const item = document.createElement('div')
    item.classList.add('item')

    const name = document.createElement('p')
    name.classList.add('name')
    name.textContent = itemName
    
    const span = document.createElement('span')
    span.classList.add('qty')
    span.textContent = 'x1'
    
    const input = document.createElement('input')
    input.setAttribute('type', 'number')
    input.setAttribute('name', name.textContent)
    input.classList.add('price')
    input.value = itemPrice
    input.addEventListener('change', (e) => updatePrice(e.target))
    
    name.appendChild(span)
    item.appendChild(name)
    item.appendChild(input)
    
    document.querySelector('#sidebar .items').appendChild(item)
    
    order.push({
        item: itemName,
        price: itemPrice,
        qty: 1
    })
    calcTotal()
}
//increase qty of an item in the sidebar order list
function increaseQty(btn){
    let buttonName = btn.parentElement.parentElement.querySelector('.item').textContent

    const items = document.querySelector('#sidebar .items').querySelectorAll('.item')
    
    items.forEach(item => {
        
        let itemName = item.querySelector('.name').textContent.split('x')[0]

        if(itemName == buttonName){ 
            let spanContent = item.querySelector('.name').textContent.split('x')[1]
            spanContent++
            
            item.querySelector('span').textContent = `x${spanContent}`
        }
    })

    order.forEach(obj => {
        if(obj.item == buttonName){
            obj.qty++
        }
    })
    calcTotal()
}
//decrease qty of an item in the sidebar order list
function decreaseQty(btn){
    let buttonName = btn.parentElement.parentElement.querySelector('.item').textContent

    const items = document.querySelector('#sidebar .items').querySelectorAll('.item')

    items.forEach(item => {
        
        let itemName = item.querySelector('.name').textContent.split('x')[0]

        if(itemName == buttonName){ 
            let spanContent = item.querySelector('.name').textContent.split('x')[1]
            spanContent--
            
            item.querySelector('span').textContent = `x${spanContent}`
        }
    })

    order.forEach(obj => {
        if(obj.item == buttonName){
            obj.qty--
        }
    })
    calcTotal()
}
//remove an item from the sidebar order list
function removeItemFromSidebar(btn){
    let buttonName = btn.parentElement.parentElement.querySelector('.item').textContent

    const items = document.querySelector('#sidebar .items').querySelectorAll('.item')

    items.forEach(item => {
        
        let itemName = item.querySelector('.name').textContent.split('x')[0]

        if(itemName == buttonName){ 
            item.remove()
        }
    })

    order.forEach(obj => {
        if(obj.item == buttonName){
            const index = order.indexOf(obj)
            if(index > -1){
                order.splice(index, 1)
            }
        }
    })
    calcTotal()
}
//update price of items in 'order' array
function updatePrice(input){
    order.forEach(obj => {
        if(obj.item == input.name){
            obj.price = input.value
        }
    })
    calcTotal()
}
//recalculate and reset the sidebar total on every change
function calcTotal(){
    let total = 0;
    order.forEach(obj => total += obj.price * obj.qty)

    let numberString = String(total);
    let reversedGroups = [];
    while (numberString.length > 0) {
        reversedGroups.push(numberString.slice(-3));
        numberString = numberString.slice(0, -3);
    }
    total = reversedGroups.reverse().join(',');
    
    document.querySelector('#sidebar .total .price').textContent = `${total}LL`;
}



//////////////////////////////////////////////////////////////////
const navExpensesBtn = document.querySelector('header nav .expenses')
navExpensesBtn.addEventListener('click', switchToExpenses )
const navSalesBtn = document.querySelector('header nav .sales')
navSalesBtn.addEventListener('click', switchToSales )

function switchToExpenses() {
    clearOrder()
    //change body class from sales to expenses
    document.body.classList.remove('sales')
    document.body.classList.add('expenses')

    //change the active nav button
    navSalesBtn.classList.remove('active')
    navExpensesBtn.classList.add('active')

    //hide sales cards and show expenses cards
    document.querySelectorAll('.card.sales').forEach(card => card.classList.add('hidden'))
    document.querySelectorAll('.card.expenses').forEach(card => card.classList.remove('hidden'))

    clearSalesButton.classList.add('hidden')
    clearExpensesButton.classList.remove('hidden')

    customeOrderSalesButton.classList.add('hidden')
    customeOrderExpensesButton.classList.remove('hidden')
}
function switchToSales() {
    clearOrder()
    //change body class from expenses to sales
    document.body.classList.remove('expenses')
    document.body.classList.add('sales')

    //change the active nav button
    navSalesBtn.classList.add('active')
    navExpensesBtn.classList.remove('active')

    //hide expenses cards and show sales cards
    document.querySelectorAll('.card.expenses').forEach(card => card.classList.add('hidden'))
    document.querySelectorAll('.card.sales').forEach(card => card.classList.remove('hidden'))

    clearExpensesButton.classList.add('hidden')
    clearSalesButton.classList.remove('hidden')

    customeOrderExpensesButton.classList.add('hidden')
    customeOrderSalesButton.classList.remove('hidden')
}




//utility functions
function formatLiras(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

