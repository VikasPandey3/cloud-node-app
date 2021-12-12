// express is a node framework that is helps in creating
// 2 or more web-pages application
const express = require('express');
const upload=require('express-fileupload');
// filesystem is a node module that allows us to work with
// the files that are stored on our pc
const file_system = require('fs')

// it is an npm package.this is to be required in our JS
// file for the conversion of data to a zip file!
const admz = require('adm-zip')

// stores the express module into the app variable!
const app = express()
app.use(upload())
// this is the name of specific folder which is to be
// changed into zip file1
// var to_zip = file_system.readdirSync(__dirname+'/'+'upload_data')

// this is used to request the specific file and then print
// the data in it!
app.get('/',function(req,res){
	res.sendFile(__dirname+'/'+'index.html')
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
	f.forEach((a)=>{
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
	res.send(data);
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
app.listen(process.env.PORT||7777,function(){
	console.log(`port is active at${process.env.PORT}`);
})
