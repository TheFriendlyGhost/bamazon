var mysql = require("mysql")
var inquirer = require("inquirer")
const cTable = require('console.table')

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
      choices: ["View product sales by Department", "Create new department", "Exit"]
    }
    ])

    if(prod.todoOptions === "Exit"){
      process.exit()
    }else if(prod.todoOptions === "View product sales by Department"){
      getAllDepartments()
    }else{
      async function newDept(){
        var dept = await inquirer.prompt([
        {
          name: "departmentName",
          type: "input",
          message: "What is the name of the department?"
        },{
          name: "overheadCosts",
          type: "input",
          message: "How much overhead will it incur?"
        }])

        createDepartment(dept.departmentName, dept.overheadCosts)
      }
      newDept()     
    }
  }
  checkProduct()
}

function createDepartment(department, overhead){
  var sql = "INSERT INTO departments SET ?";
  var values = {department_name: department, over_head_costs: overhead}

  connection.query(sql, values, function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
    start()
  }) 
}

function getAllDepartments(){
  var sql = `
        SELECT
          departments.department_id,
          departments.department_name,
          departments.over_head_costs,
          SUM(products.product_sales) product_sales,
          SUM(products.product_sales - departments.over_head_costs) total_profit
        FROM
          products
        INNER JOIN
          departments
        ON 
          departments.department_name = products.department_name
        GROUP BY departments.department_id`
  connection.query(sql, function (err, result) {
    if (err) throw err;

    console.table(result)
    start()
  })
}
