

            // This file is a memo of mongo's MapReduce 


$ mongo --host localhost sumibi
MongoDB shell version: 2.0.2
connecting to: localhost:27017/sumibi
> use sumibi
switched to db sumibi
> show collections
sumibiorg
system.indexes
> db.sumibiorg.count();
6072350

# Heavy update query
var cursor = db.sumibiorg.find()
cursor.forEach(function(x) {
    lst = x.request.split(/ /)
    db.sumibiorg.update( { _id: x._id }, { "$set" : { "method" : lst[0] }} )
    db.sumibiorg.update( { _id: x._id }, { "$set" : { "url" :    lst[1] }} )
})


map = function( ) {
    var d1 = this.timestamp
    var ymdStr = d1.getFullYear() + "/" + d1.getMonth() + "/" +  d1.getDate()
    var cgiFlag = "0"
    if ( this.url.match( /.cgi$/ )) {
	cgiFlag = "1"
    }
    key = ymdStr + " " + cgiFlag
    emit( key, { count:1 } )
}

reduce = function( key, values ) {
    result = { count: 0 }
    values.forEach( function( value ) {
	result.count += value.count
    })
    return result
}

db.runCommand(
    {
	mapReduce: "sumibiorg",
	map: map,
	reduce: reduce,
	out: "out"
    })

// result
> db.out.find().limit(10)
{ "_id" : "2011/11/10 0", "value" : { "count" : 223 } }
{ "_id" : "2011/11/10 1", "value" : { "count" : 358 } }
{ "_id" : "2011/11/11 0", "value" : { "count" : 2794 } }
{ "_id" : "2011/11/11 1", "value" : { "count" : 4186 } }
{ "_id" : "2011/11/12 0", "value" : { "count" : 2459 } }
{ "_id" : "2011/11/12 1", "value" : { "count" : 7437 } }
{ "_id" : "2011/11/13 0", "value" : { "count" : 3092 } }
{ "_id" : "2011/11/13 1", "value" : { "count" : 9887 } }
{ "_id" : "2011/11/14 0", "value" : { "count" : 3577 } }
{ "_id" : "2011/11/14 1", "value" : { "count" : 9355 } }
 .
 .

    
      


