var jr = require( "jackrabbit" );
var sp = require( "serialport" );
var loggly = require( "loggly" );


var logglyToken = process.env.LOGGLY_TOKEN;
var logglySubdomain = process.env.LOGGLY_SUBDOMAIN;
var serialAddress = process.env.SERIAL_ADDRESS;
var serialRate = process.env.SERIAL_RATE;
var rabbitURL = process.env.RABBIT_URL;


exports.jackrabbit = function () {
    return jr( rabbitURL, 1 );
};


exports.logger = function ( tags ) {
    return loggly.createClient( {
        token: logglyToken,
        subdomain: logglySubdomain,
        tags: tags
    } );
};


exports.serialport = function () {
    return new sp.SerialPort( serialAddress, {
        baudrate: serialRate,
        parser: sp.parsers.readline( "\n" )
    } );
};
