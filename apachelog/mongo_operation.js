

             This file is a memo file of mongo shell operations.


$ mongo --host black sumibi
MongoDB shell version: 2.0.1
connecting to: black:27017/test
> use sumibi
switched to db sumibi
> show collections
sumibiorg
system.indexes
> db.sumibiorg.count();
6072350


> a = db.sumibiorg.findOne().timestamp;
ISODate("2011-10-08T21:28:36Z")
> a.getDay();
0
> a.getMonth();
9
> a.getFullYear();
2011
> b = new Date( a.getFullYear(), a.getMonth(), a.getDate(), 0, 0, 0);
ISODate("2011-10-08T15:00:00Z")
> b
ISODate("2011-10-08T15:00:00Z")

> var cursor = db.sumibiorg.find().limit(2);
> cursor.forEach(function(x) { print( x.timestamp ); });
Sun Oct 09 2011 06:28:36 GMT+0900 (JST)
Sun Oct 09 2011 06:28:40 GMT+0900 (JST)


> var cursor = db.sumibiorg.find().limit(2);
> cursor.forEach(function(x) {
   d1 = x.timestamp
   d2 = new Date( d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0 )
   print( d2 )
 });
Sun Oct 09 2011 00:00:00 GMT+0900 (JST)
Sun Oct 09 2011 00:00:00 GMT+0900 (JST)


# test for heavy query
var cursor = db.sumibiorg.find().limit(2);
cursor.forEach(function(x) {
    d1 = x.timestamp
    d2 = new Date( d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0 )
    print( x._id )
    db.sumibiorg.update( { _id: x._id }, { "$set" : { "timestampDaily" : d2 }} );
})

#  heavy query
var cursor = db.sumibiorg.find();
cursor.forEach(function(x) {
    d1 = x.timestamp
    d2 = new Date( d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0 )
    db.sumibiorg.update( { _id: x._id }, { "$set" : { "timestampDaily" : d2 }} );
})

db.sumibiorg.ensureIndex( { timestampDaily : 1 } )

a = db.sumibiorg.distinct( "timestampDaily" )

for ( i = 0 ; i < a.length ; i++ ) {
  print ( a[i] )
}


# group by timestampDaily
g = db.sumibiorg.group(
    {key: { timestampDaily:true },
     cond: {},
     reduce: function(obj,prev) { prev.count += 1; },
     initial: { count: 0 }
    })

for ( i = 0 ; i < g.length ; i++ ) {
    d = g[i].timestampDaily
    print( d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "\t" + g[i].count )
}


# group by timestampDaily  and filtering sumibi.cgi
g = db.sumibiorg.group(
    {key: { timestampDaily:true },
     cond: { url : "/cgi-bin/sumibi/testing/sumibi.cgi" },
     reduce: function(obj,prev) { prev.count += 1; },
     initial: { count: 0 }
    })

for ( i = 0 ; i < g.length ; i++ ) {
    d = g[i].timestampDaily
    print( d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate() + "\t" + g[i].count )
}





# heavy query
var cursor = db.sumibiorg.find()
cursor.forEach(function(x) {
    lst = x.request.split(/ /)
    db.sumibiorg.update( { _id: x._id }, { "$set" : 
					   { "req" : 
					     { "method" : lst[0],
					       "url"    : lst[1] }}} )
})
db.sumibiorg.ensureIndex( { url : 1 } )

var cursor = db.sumibiorg.find()
cursor.forEach(function(x) {
    lst = x.request.split(/ /)
    db.sumibiorg.update( { _id: x._id }, { "$set" : { "method" : lst[0] }} )
    db.sumibiorg.update( { _id: x._id }, { "$set" : { "url" :    lst[1] }} )
})
db.sumibiorg.ensureIndex( { url : 1 } )


db.sumibiorg.distinct( "req.url" );

g = db.sumibiorg.group(
    {key: { req : { url:true }},
     cond: {},
     reduce: function(obj,prev) { prev.count += 1; },
     initial: { count: 0 }
    });


for ( i = 0 ; i < g.length ; i++ ) {
    db.sumibiorg.top.insert( { url: g[i].req.url, count: g[i].count } );
}

# Top access url as TSV format.
db.sumibiorg.top.find().sort( { count: -1 } ).limit( 50 ).forEach( function( x ) {
    print( x.count + "\t" + x.url );
} )


