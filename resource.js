/**
 * Created by pramod on 3/3/16.
 */

var express=require('express')
var app = express();
var server = require('http').createServer(app).listen(9091);
var io = require('socket.io').listen(server);
var smtpTransport = require('nodemailer-smtp-transport');
var MongoClient = require('mongodb').MongoClient;



io.sockets.on('connection',function(socket){

    // for dashboards

    socket.on('get_data',function(data){
        var domain_name=data;
        var url = 'mongodb://localhost:27017/'+data.database_name;
        MongoClient.connect(url, function(err, db) {

            find_user(db,function(){

            })


        });

        var find_user = function(db, callback) {
            var cursor =db.collection(data.database_name).find( { "domainName":data.database_name } );
            cursor.each(function(err, doc) {

                for(var key in doc){
                    console.log(doc[key.toString()])
                    if(doc[key.toString()]==data.password) {
                        aggregateData(db, function() {
                            db.close();
                        });
                    }
                }
            });
        };

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


    // to get list of collections in database

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


    // to get database names

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



});