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
  prodForSale()
});

function start() {
  async function checkProduct(){
    var prod = await inquirer.prompt([
    {
      type: "input",
      name: "itemID",
      message: "What is the ID of the item you would like to purchase?",
    },
    {
      type: "input",
      name: "itemQuantity",
      message: "How many units would you like to purchase?"
    }
    ])
  
    checkAvailability(prod.itemID, parseInt(prod.itemQuantity))
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

function checkAvailability(id, quantity) {
   connection.query(
    'SELECT * FROM products WHERE ?',
    {
      item_id: id
    },
    function(err, res) {
        // console.log(res)
        var currentQuantity = res[0].stock_quantity
        var costPer = res[0].price

        var totalCost = quantity * costPer
        console.log(currentQuantity, quantity)

        if (currentQuantity > quantity){
          writeNewAmount(id, (currentQuantity - quantity), totalCost)
        }else{
          console.log('Current stock insufficient to meet order!')
          start()
        }
    }
  )
}

function writeNewAmount(id, quantity, cost){
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: quantity
      },
      {
        item_id: id
      }],
      function(err,res){
        writeProductSales(id, cost)
      })
}

function writeProductSales(id, cost){
  connection.query(
    "UPDATE products SET product_sales = product_sales + " + cost + " WHERE ?",
    [
      {
        item_id: id
      }],
      function(err,res){
        console.log("Your total charge was: $" + cost)
        start()
      })
}