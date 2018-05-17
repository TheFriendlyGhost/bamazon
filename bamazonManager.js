var mysql = require("mysql")
var inquirer = require("inquirer")

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
})

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n")
  start();
});

function start() {
  async function checkProduct(){
    var prod = await inquirer.prompt([
    {
      name: "todoOptions",
      type: "rawlist",
      message: "What manager task would you like to accomplish?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }
    ])

    if(prod.todoOptions == "Exit"){
      process.exit()
    }else if(prod.todoOptions == 'View Products for Sale'){
      prodForSale()
    }else if(prod.todoOptions == 'View Low Inventory'){
      lowInventory()
    }else if(prod.todoOptions == 'Add to Inventory'){
      async function whatToAdd(){
        var toAdd = await inquirer.prompt([
        {
          name: "curProd",
          type: "input",
          message: "What is the ID of the item you would like to update?"
        },
        {
          name: "newAmount",
          type: "input",
          message: "How much would you like to add?"
        }
        ])

        writeNewAmount(parseInt(toAdd.curProd), parseInt(toAdd.newAmount))
      }
      
      whatToAdd()
    }else{
      async function newProd(){
        var toAdd = await inquirer.prompt([
        {
          name: "newProd",
          type: "input",
          message: "What is the new product for sale?"
        },
        {
          name: "department",
          type: "input",
          message: "What department will this be sold in?"
        },
        {
          name: "price",
          type: "input",
          message: "How much will we sell this for?"
        },
        {
          name: "stockQuant",
          type: "input",
          message: "How much is in the warehouse?"
        }
        ])

        addNewProd(toAdd.newProd, toAdd.department, parseInt(toAdd.price), parseInt(toAdd.stockQuant))
      }

      newProd()
    }
    // checkAvailability(prod.itemID, parseInt(prod.itemQuantity))
  }

  checkProduct()
}

function prodForSale() {
   connection.query(
    'SELECT * FROM products',
    function(err, res) {
      res.forEach(function(element){
        console.log(element)
      })
      start()
    }
  )
}

function lowInventory() {
   connection.query(
    'SELECT * FROM products WHERE stock_quantity <= 5',
    function(err, res) {
      res.forEach(function(element){
        console.log('-------------------------------')
        console.log(element)
        console.log('-------------------------------')
      })
      start()
    }
  )
}

function writeNewAmount(id, quantity){
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity + " + quantity +" WHERE ?",
      [
      {
        item_id: id
      } 
      ],
      function(err,res){
        start()
      }
  )
}

function addNewProd(name, department, price, quantity){
  var sql = "INSERT INTO products SET ?";
  var values = {product_name: name, department_name: department, price: price, stock_quantity: quantity}

  connection.query(sql, values, function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
    start()
  }); 
}