// express is a node framework that is helps in creating
// 2 or more web-pages application
const express = require('express');
const upload=require('express-fileupload');
const kenx=require('knex');
// filesystem is a node module that allows us to work with
// the files that are stored on our pc
// const file_system = require('fs')

// it is an npm package.this is to be required in our JS
// file for the conversion of data to a zip file!
const admz = require('adm-zip')

// stores the express module into the app variable!
const app = express()
// app.use(function (req, res, next) {
// 	res.setHeader(
// 	  'Content-Security-Policy-Report-Only',
// 	  "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; frame-src 'self'"
// 	);
// 	next();
//   });
// app.set('views', './views')
// app.set('view engine','ejs');
app.use(upload())
const db=kenx({
	client:'pg',
	connection: {
		host : '127.0.0.1',
		port : 5432,
		user : 'postgres',
		password : 'test',
		database : 'postgres'
	  }
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));
// this is the name of specific folder which is to be
// changed into zip file1
// var to_zip = file_system.readdirSync(__dirname+'/'+'upload_data')

// this is used to request the specific file and then print
// the data in it!
app.get('/login',function(req,res){
	res.sendFile(__dirname+'/'+'login.html')
})
app.get('/signup',function(req,res){
	res.sendFile(__dirname+'/'+'signup.html')
})
var authenticate=false;
var useremail="";
app.post('/login',function(req,res){
	const {email,password}=req.body;
    if(email&&password){
        db.select('email', 'password').from('login')
        .where('email', '=', email)
        .then(data => {
        const isValid = password===data[0].password?true:false;
        if (isValid) {
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
				// console.log(res.json(user[0]));
				authenticate=true;
				useremail=user[0].email;
				console.log(useremail);
				// res.render('index');
				// console.log(user[0]);
				res.redirect('/index');
            })
            .catch(err => res.status(400).json('unable to login'))
        } else {
            res.status(400).json('wrong  credentials')
        }
        })
        .catch(err => res.status(400).json('wrong credentials'))
    }
    else{
        res.status(400).json("fill the details");
    }
})
app.post('/signup',function(req,res){
	// console.log(req.body);
	const {email,password}=req.body;
    
    if(email&&password){
    db.transaction(trx => {
      trx.insert({
        password: password,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            joined: new Date()
          })
          .then(user => {
            // res.json(user[0]);
			authenticate=true;
			res.redirect('/index');
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
    }else{
        res.status(400).json("fill the details");
    }
 
})
app.get('/index',function(req,res){
	if(authenticate)
	res.sendFile(__dirname+'/'+'index.html')
	else
	res.redirect('/login');
})
app.get('/account',function(req,res){
	if(authenticate)
	db.select("*").from('users')
	.where('email','=',useremail)
	.then(data=>{
	res.send(`<html><body>
	<div>user email:- ${data[0].email}<div>
	<div>Total Number of files converte to zip:- ${data[0].no_of_files} <div>
	<div>Total cost:- $${data[0].no_of_files *3}<div>
	</body><html/>`)
	}).catch(e=>res.status(400).json("unable to fetch details"))
	else
	res.redirect('/login');
})
app.post('/',(req,res)=>{
	if(req.files){
		// console.log(req.files)
		var zp = new admz();
		var f=req.files.files;
	// this is the main part of our work!
	// here for loop check counts and passes each and every
	// file of our folder "upload_data"
	// and convert each of them to a zip!
	var i=0;
	f.forEach((a)=>{
		i=i+1;
		zp.addFile(a.name,Buffer.from(a.data,'utf-8'));
	})


	// here we assigned the name to our downloaded file!
	const file_after_download = 'downloaded_file.zip';

	// toBuffer() is used to read the data and save it
	// for downloading process!
	const data = zp.toBuffer();
	

	// this is the code for downloading!
	// here we have to specify 3 things:
		// 1. type of content that we are downloading
		// 2. name of file to be downloaded
		// 3. length or size of the downloaded file!
	// res.send("uploaded");
	//application/octet-stream
	res.set('Content-Type','application/octet-stream');
	res.set('Content-Disposition',`attachment; filename=${file_after_download}`);
	res.set('Content-Length',data.length);
	db.select('no_of_files').from('users')
        .where('email', '=', useremail)
        .then(data => {
			console.log(data);
			var no_of_files=data[0].no_of_files+i;
			db('users')
			.where('email','=', useremail)
			.update({no_of_files:no_of_files})
			.then(x=>{
				console.log(x);
				res.send(data);
			})
		}).catch(e=>res.status(400).json('unable to update file count'));
	
		// console.log(req.files.files)
		
	}
	
})
// app.get('/convert',function(req,res){
// 	// zp is created as an object of class admz() which
// 	// contains functionalities
// 	var zp = new admz();


// 	// this is the main part of our work!
// 	// here for loop check counts and passes each and every
// 	// file of our folder "upload_data"
// 	// and convert each of them to a zip!
// 	for(var k=0 ; k<to_zip.length ; k++){
// 		zp.addLocalFile(__dirname+'/'+'upload_data'+'/'+to_zip[k])
// 	}


// 	// here we assigned the name to our downloaded file!
// 	const file_after_download = 'downloaded_file.zip';

// 	// toBuffer() is used to read the data and save it
// 	// for downloading process!
// 	const data = zp.toBuffer();
	

// 	// this is the code for downloading!
// 	// here we have to specify 3 things:
// 		// 1. type of content that we are downloading
// 		// 2. name of file to be downloaded
// 		// 3. length or size of the downloaded file!

// 	res.set('Content-Type','application/octet-stream');
// 	res.set('Content-Disposition',`attachment; filename=${file_after_download}`);
// 	res.set('Content-Length',data.length);
// 	res.send(data);

// })

// this is used to listen a specific port!
app.listen(3000,function(){
	console.log(`port is active at 3000`);
})
process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
	// some other closing procedures go here
	process.exit(1);
 });