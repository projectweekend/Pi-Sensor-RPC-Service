var jr = require( "jackrabbit" );
var sp = require( "serialport" );
var loggly = require( "loggly" );
var config = require( "./configuration" );


exports.jackrabbit = function () {
    return jr( config.rabbitURL, 1 );
};


exports.logger = function ( tag ) {
    return loggly.createClient( {
        token: config.logglyToken,
        subdomain: config.logglySubdomain,
        tags: [ tag ]
    } );
};


exports.serialport = function () {
    return new sp.SerialPort( config.serialAddress, {
        baudrate: config.serialRate,
        parser: sp.parsers.readline( "\n" )
    } );
};
