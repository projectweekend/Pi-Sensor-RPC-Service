var os = require( "os" );
var throng = require( "throng" );
var connections = require( "./shared/connections" );
var utils = require( "./shared/utils" );


var logger = connections.logger( [ "Pi-Sensor-RPC-Service" ] );

var run = function () {
    logger.log( "Starting Pi-Sensor-RPC-Service" );

    var serialPort = connections.serialport();
    var broker = connections.jackrabbit();

    var handleMessage = function ( message, ack ) {
        serialPort.on( "data", function ( data ) {
            ack( utils.parseSerialData( data ) );
        } );
        serialPort.write( message.serialMessage, function ( err, data ) {
            if ( err ) {
                logger.log( "Error with 'serialPort.write': " + err );
                process.exit();
            }
        } );
    };

    var serve = function () {
        logger.log( "Broker ready" );
        broker.handle( "sensor.get", handleMessage );
    };

    var create = function () {
        logger.log( "Broker connected" );
        broker.create( "sensor.get", { prefetch: 5 }, serve );
    };

    process.once( "uncaughtException", function ( err ) {
        logger.log( "Stopping Pi-Sensor-RPC-Service" );
        logger.log( err );
        process.exit();
    } );

    serialPort.on( "open", function () {
        logger.log( "Serial port open" );
        broker.once( "connected", create );
    } );
};

throng( run, {
    workers: os.cpus().length,
    lifetime: Infinity
} );
