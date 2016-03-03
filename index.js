/**
 * Created by pramod on 2/26/16.
 */

// import all required modules

var express=require('express')
var app = express();
var server = require('http').createServer(app).listen(9090);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var db = mongoose.connection;
var schema = mongoose.schema;
var objectId = mongoose.objectId;
var nodeMailer=require('nodemailer');
var crypto=require('crypto');
var smtpTransport = require('nodemailer-smtp-transport');
var MongoClient = require('mongodb').MongoClient;



// allows static file serving through url, public is the root directory

    app.use(express.static('public'));

    app.get('/track',function(request,response){
        response.sendFile(__dirname+'/public/js/track.js')
    })

// home page

    app.get('/home',function(request,response){
        response.sendFile(__dirname+'/public/html/home.html');
    });

// registration page

    app.get('/register',function(request,response){
        response.sendFile(__dirname+'/public/html/register.html');
    });

//login page

    app.get('/login',function(request,response){
        response.sendFile(__dirname+'/public/html/login.html');
    })

// reporting page

    app.get('/render',function(request,response){
        response.sendFile(__dirname+'/public/html/render.html')
    })

// socket connection

    io.sockets.on('connection',function(socket){
        socket.on('send_form_data',function(data){
            console.log('[USER]'+' A user registered')
            var userName='pramodkumarp95',
                password='',
                timeStamp=new Date().getTime();
            transporter = nodeMailer.createTransport(
                smtpTransport('smtps://pramodkumarp95%40gmail.com:ihavegotmyownways@smtp.gmail.com')
            );
            console.log(data);
            // generating API_KEYS and API_SECRET

            var api_key=crypto.createHash('md5').update(data.userName+data.domainName+password).digest('hex'),
                api_secret=crypto.createHash('md5').update(data.userName+data.domainName+password+timeStamp).digest('hex');

                data.api_key=api_key;
                data.api_secret=api_secret;

                mail_options={
                    from:'pramodkumarp95@gmail.com',
                    to:data.email,
                    subject: 'hello world',
                    html:'' +
                    '<p style="color:blue">api_key = '
                    +api_key+
                    '</p><br><p style="color:blue" >api_token = '+api_secret+'</p>',
                    text:'your credentials to access raw data'
                }

            // sending email

            transporter.sendMail(mail_options,function(err,response){
                    if(err)
                        console.error('Error sending email');
                    else {
                        console.log('[INFO] '+'Email sent successfully');
                        socket.emit('success','');
                    }
            })

            // connect to database

            mongoose.connect('mongodb://localhost/'+data.domainName,function(err){
                if(err)
                    console.error('Connection failed ,Check if Mongo instance is started?')
                else
                    console.log('[INFO] '+'MONGODB:Connection established successfully');
            })

            // inserting all registered users into the database

            db.collection(data.domainName).insert(data,function(response){
                    console.log(response);
                mongoose.disconnect();
            });

        })

            // tracked data

        socket.on('custom_data',function(data){
            console.log('custom_data');

            // connect to database

            mongoose.connect('mongodb://localhost/'+data.domain_name,function(err){
                if(err)
                    console.error('Connection failed ,Check if Mongo instance is started?')
                else
                    console.log('[INFO] '+'MONGODB:Connection established successfully');
            })

            // inserting tracked data into corresponding DB

            db.collection(data.event_name.toString()).insert(data,function(response){
                mongoose.disconnect();
            });
        })

    })
