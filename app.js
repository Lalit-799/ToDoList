//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const _= require("lodash"); 
require('dotenv').config();
const  mongoose   = require("mongoose");
const mongoURI = process.env.MONGO_URI;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const  itemsSchema= new mongoose.Schema({
  name: String
});
const  Item = mongoose.model("Item", itemsSchema);

const  item1 = new Item ({
    name: "welcome --> to do list"
});
const  item2 = new Item ({
  name: "click + button to add new item"
});
const  item3 = new Item ({
  name: "click box to delete item"
});

const defaultItems =[item1,item2,item3];

const listschema= {
  name: String,
  items:[itemsSchema]
};

const List= mongoose.model("List", listschema);

app.get("/", function(req, res) {

  Item.find(function(err,results){

    if (results.length===0) {
         Item.insertMany( defaultItems,function(err){
      if(err){
          console.log("not inserted");
      }else{
          console.log("inserted");
      }
  });
    res.redirect("/");
    } 
    else {
  res.render("list", {listTitle: "Today", newListItems: results});
    }
});
});
app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,findList){
    if(!err){
      if (!findList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", {listTitle: findList.name, newListItems: findList.items});
      }
    }
  });
});
 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
   
  const  item = new Item ({
    name: itemName
});
if (listName==="Today") {
  item.save();
  res.redirect("/");
   
} else {
  List.findOne({name: listName},function(err,findList){
    if(err){
      console.log("err in find");
    }else{
      findList.items.push(item);
      findList.save();
      res.redirect("/"+listName);
    }
  })
}
 
});
app.post("/delete", function(req,res){
  const checkedItemId= req.body.deleteItem;
  const listName= req.body.listName;
  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted.");
        res.redirect("/");
      }
     });
        }
     else {
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,findList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
    
  }
  
});

 

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


 