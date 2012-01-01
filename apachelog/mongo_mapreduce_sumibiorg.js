

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
    var d = this.timestamp
    var dmyStr = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear()
    var cgiFlag = false
    if ( this.url ) {
	if ( this.url.match( /.cgi$/ )) {
	    cgiFlag = true
	}
    }
    key = dmyStr
    if ( cgiFlag ) {
	emit( key, { count:1, cgi: 1, other: 0 } )
    }
    else {
	emit( key, { count:1, cgi: 0, other: 1 } )
    }
}

reduce = function( key, values ) {
    result = { count: 0, cgi: 0, other: 0}
    values.forEach( function( value ) {
	result.count   += value.count
	result.cgi     += value.cgi
	result.other   += value.other
    })
    return result
}

db.runCommand(
    {
	mapReduce: "master",
	map: map,
	reduce: reduce,
	//query: { timestamp : { $gt : new Date( '2011/11/01' ) }},
	out: "daily"
    })


// daily by CSV
db.daily.find( ).forEach(function(x) {
    d = new Date( x._id )
    dateStr = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear()
    print( dateStr + "\t" + x.value.cgi + "\t" + x.value.other )
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
    var d = this.timestamp
    var dmyStr = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear()
    if ( this.url ) {
	if ( this.url.match( /.cgi$/ )) {
	    key = dmyStr + " " + this.hostname
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
    var d = this.timestamp
    var dmyStr = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear()
    if ( this.url ) {
	if ( this.url.match( /.cgi$/ )) {
	    value = {}
	    value[ this.hostname ] = 1
	    emit( dmyStr, value )
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
	//query: { timestamp : { $gt : new Date( '2011/11/01' ) }},
	out: "uniquser"
    })

// uniq user by CSV
db.uniquser.find().forEach(function(x) {
    users = 0
    for ( k in x.value ) {
	users++
    }
    print( x._id + "\t" + users )
})
