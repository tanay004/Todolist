const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Buy groceries"});
const item2 = new Item({name: "Exercise"});
const item3 = new Item({name: "Hit this to delete an item"});

const defaultItems= [item1, item2, item3];
const listSchema= new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(function(items){
        console.log(items);
      }).catch(function(err){
        console.log(err);
      })
    }
    res.render("list",{listTitle:"Today", newListItems:foundItems});
  })
})

app.post("/", function(req, res){
  const itemName= req.body.itemName;

  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");
})
app.post("/delete", function(req, res){
  const selectedId= req.body.checkbox;
  Item.findByIdAndRemove(selectedId).then(function(item){

  }).catch(function(err){
    console.log(err);
  });
  res.redirect("/");
})

app.get("/:customListName", function(req, res){
  const customListName= req.params.customListName;

  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }
    else{
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  })




})



app.listen(3000, function(){
  console.log("Server is running on port 3000");
})
