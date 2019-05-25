const express = require('express');
var upload = require('express-fileupload');
const JSONToCSV=require('json2csv').parse;
const fs = require('fs');
const http = require('http');
const path=require('path');
const app=express();
http.Server(app).listen(8000); // make server listen on port 80
app.use(upload()); // configure middleware

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/csv");

// const contSchema=new mongoose.Schema({
// serialnu:String,
// title:String,
// subject:String,
// price:String,
// date:{
//   type:Date,default:Date.now
// }
// });
app.use('/downloads',express.static("downloads"));

app.use(express.static(path.join(__dirname, "downloads")));

const contSchema = new mongoose.Schema({
serialnu:String,
title:String,
subject:String,
price:String
});


const Content=mongoose.model("Content",contSchema);


// EJS
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));


app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
})

app.post('/upload',function(req,res){
  console.log(req.files);
  if(req.files.upfile){
    var file = req.files.upfile,
      name = file.name,
      type = file.mimetype;
    var uploadpath = __dirname + '/uploads/' + name;
    file.mv(uploadpath,function(err){
      if(err){
        console.log("File Upload Failed",name,err);
        res.send("Error Occured!")
      }
      else {
        console.log("File Uploaded",name);
        res.redirect('/upload');
      }
    });
  }
  else {
    res.send("No File selected !");
    res.end();
  };
})




// app.get('/upload',(req,res)=>{

// var csvjson = require('csvjson');

// var options = {
// };
// var file_data = fs.readFileSync('./uploads/download.csv', { encoding : 'utf8'});
// var result = csvjson.toObject(file_data, options);
// // console.log(result);
// console.log("$$$$$$$$");
// Content.create(result,function(err,newContent){
//   if(err){
//     console.log("error occured");
//   }else{
//     //redirect back to index
//     console.log("$$$$$$$$$$$$");
//     console.log(newContent);
//     console.log("successful");
//   }
// });
// res.redirect('/download');
// });
app.get('/upload',(req,res)=>{

var csvjson = require('csvjson');
var fs = require('fs');
var options = {
};
var file_data = fs.readFileSync('./uploads/source.csv', { encoding : 'utf8'});
var result = csvjson.toObject(file_data, options);
result.forEach(function(res){
      Content.create(res,function(err,newContent){
        if(err){
           console.log("error occured");
        }else{
          // console.log("8888");
          // console.log(newContent);
        //redirect back to index
        console.log("successful");
        }
    })
});
res.redirect('/download');
});


app.get('/download',(req,res)=>{
  Content.find({},function(err,contents){
        if(err){
            console.log(err);
        }else{
            res.render("download",{contents:contents});
        }
    })
});

app.get('/downloadcont',(req,res)=>{
  Content.find({},(err,foundContent)=>{
    if(err){
      res.redirect("/download");
    }else{

     const csv=JSONToCSV(foundContent,{fields:["serialnu","title","subject","price"]});
      console.log("*********");
      // console.log(csv);
      fs.writeFileSync("./downloads/vamsi.csv",csv);

      // res.download("./downloads/vamsi.csv");
      // //const csv=JSONToCSV(source,{fields:["serialnu","title","subject","price","date"]})
      // //fs.writeFileSync("./download.csv",csv);
      // download(csv);
      // res.download(path.join(__dirname, "/downloads/vamsi.csv"))
      res.redirect("/downloads/vamsi.csv");
    }
  })
});

app.get("/downloads/vamsi.csv",(req,res)=>{
  res.redirect("/");
});

const PORT = 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
