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

        socket.on('custom_data',function(data){
            // inserting all page data into the database

            console.log('custom_data');
            // connect to database
            mongoose.connect('mongodb://localhost/'+data.domain_name,function(err){

                if(err)
                    console.error('Connection failed ,Check if Mongo instance is started?')
                else
                    console.log('[INFO] '+'MONGODB:Connection established successfully');

            })

            // inserting all registered users into the database

            db.collection(data.event_name.toString()).insert(data,function(response){
                console.log(response);
                mongoose.disconnect();
            });
        })

        socket.on('get_data',function(data){
            console.log(data);
            var domain_name=data;
            var url = 'mongodb://localhost:27017/'+data.database_name;

            MongoClient.connect(url, function(err, db) {

                aggregateData(db, function() {
                    db.close();
                });


            });

            var aggregateData = function(db, callback) {
                db.collection('page_views').aggregate(
                    [
                        //{ $match:{"domain_name":"localhost"}},
                        { $group: { "_id": "$"+data.event, "count": { $sum: 1 } } }
                    ]
                ).toArray(function(err, result) {
                    console.log(result);
                    var data_set=[]
                    var x=result;
                    for(i=0;i<x.length;i++) {
                        var temp_list = []
                        if(x[i]['_id']==='')
                        continue;
                        for (var key in x[i]) {
                            temp_list.push(x[i][key])
                        }
                        data_set.push(temp_list)
                        temp_list = [];

                    }
                    console.log(result)
                    socket.emit('send_response',data_set)
                    callback(result);
                });
            };
        })


        socket.on('get_collection',function(data){
            var item_list=[]
            var url = 'mongodb://localhost:27017/'+data.database_name;








            MongoClient.connect(url, function(err, db) {
                db.collections(function(err,collections){
                    for(i=0;i<collections.length-1;i++){
                        item_list.push(collections[i].namespace.toString().split('.')[1]);
                    console.log(item_list)
                    }
                    socket.emit('send_collection',item_list);
                })
                });


        })

       socket.on('names',function(data){
            var url = 'mongodb://localhost:27017/';
            MongoClient.connect(url, function(err, db) {
            var items_list=[];
                db.admin().listDatabases(function (err, items) {

                for(i=0;i<items.databases.length-2;i++) {

                    items_list.push(items.databases[i].name);
                }
                    console.log(items_list);
                    socket.emit('database_list',items_list);
                })
            })
       })


// done


    })
