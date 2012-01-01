

            // This file is a memo of mongo's MapReduce 


$ mongo --host localhost sumibi
MongoDB shell version: 2.0.2
connecting to: localhost:27017/sumibi
> use sumibi
switched to db sumibi
> show collections
master
system.indexes
> db.master.count()
6072350

// Heavy update query
var cursor = db.master.find()
cursor.forEach(function(x) {
    lst = x.request.split(/ /)
    db.master.update( { _id: x._id }, { "$set" : { "method" : lst[0] }} )
    db.master.update( { _id: x._id }, { "$set" : { "url" :    lst[1] }} )
})


map = function( ) {
    var d1 = this.timestamp
    var ymdStr = d1.getFullYear() + "/" + d1.getMonth() + "/" +  d1.getDate()
    var cgiFlag = false
    var url = this.url
    if ( url ) {
	if ( url.match( /.cgi$/ )) {
	    cgiFlag = true
	}
    }
    key = ymdStr + " " + cgiFlag
    emit( key, { count:1, cgi: cgiFlag } )
}

reduce = function( key, values ) {
    result = { count: 0, cgi: false }
    values.forEach( function( value ) {
	result.count   += value.count
	result.cgi      = value.cgi
    })
    return result
}

db.runCommand(
    {
	mapReduce: "master",
	map: map,
	reduce: reduce,
	out: "daily"
    })

// daily by CSV
var cursor = db.daily.find( { "value.cgi" :  true  } ) // for cgi
cursor.forEach(function(x) {
    lst = x._id.split( / / )
    print( lst[0] + "\t" + x.value.count )
})

var cursor = db.daily.find( { "value.cgi" :  false } ) // for others
cursor.forEach(function(x) {
    lst = x._id.split( / / )
    print( lst[0] + "\t" + x.value.count )
})


map = function( ) {
    emit( this.url, { count:1 } )
}

reduce = function( key, values ) {
    result = { count: 0 }
    values.forEach( function( value ) {
	result.count   += value.count
    })
    return result
}

db.runCommand(
    {
	mapReduce: "master",
	map: map,
	reduce: reduce,
	out: "top"
    })


// convert time
map = function( ) {
    var d1 = this.timestamp
    var ymdStr = d1.getFullYear() + "/" + d1.getMonth() + "/" +  d1.getDate()
    if ( this.url ) {
	if ( this.url.match( /.cgi$/ )) {
	    key = ymdStr + " " + this.hostname
	    emit( key, { count:1 } )
	}
    }
}

reduce = function( key, values ) {
    result = { count: 0 }
    values.forEach( function( value ) {
	result.count   += value.count
    })
    return result
}

db.runCommand(
    {
	mapReduce: "master",
	map: map,
	reduce: reduce,
	out: "convert_time"
    })



// uniq user
map = function( ) {
    var d1 = this.timestamp
    var ymdStr = d1.getFullYear() + "/" + d1.getMonth() + "/" +  d1.getDate()
    if ( this.url ) {
	if ( this.url.match( /.cgi$/ )) {
	    value = {}
	    value[ this.hostname ] = 1
	    emit( ymdStr, value )
	}
    }
}

reduce = function( key, values ) {
    result = {}
    values.forEach( function ( value ) {
	for ( var k in value ) {
	    result[ k ] = 1
	}
    })
    return result
}

db.runCommand(
    {
	mapReduce: "master",
	map: map,
	reduce: reduce,
	out: "uniquser"
    })

// uniq user by CSV
var cursor = db.uniquser.find()
cursor.forEach(function(x) {
    users = 0
    for ( k in x.value ) {
	users++
    }
    print( x._id + "\t" + users )
})
