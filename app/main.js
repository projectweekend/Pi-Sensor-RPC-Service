var os = require( "os" );
var async = require( "async" );
var throng = require( "throng" );
var connections = require( "./shared/connections" );
var utils = require( "./shared/utils" );


var logger = connections.logger( [ "Pi-Sensor-RPC-Service" ] );

var run = function () {
    logger.log( "Starting Pi-Sensor-RPC-Service" );

    var SerialPort = connections.serialport();
    var broker = connections.jackrabbit();

    var serialResponse = null;

    var serialWrite = function ( data ) {
        return function ( done ) {
            serialResponse = null;
            SerialPort.write( data, done );
        };
    };

    var serialRead = function ( done ) {
        var checkForResponse = function () {
            if ( serialResponse === null ) {
                setTimeout( checkForResponse, 50 );
            } else {
                return done( null, serialResponse );
            }
        };
        checkForResponse();
    };

    var handleMessage = function ( message, ack ) {
        async.series( [
            serialWrite( message.serialMessage ),
            serialRead
        ], function ( err, result ) {
            if ( err ) {
                logger.log( err );
                ack();
                process.exit( 1 );
            }
            console.log( result );
            return ack( result[ 1 ] );
        } );
    };

    var serve = function () {
        console.log( "Serve" );
        broker.handle( "sensor.get", handleMessage );
    };

    var create = function () {
        console.log( "Create" );
        broker.create( "sensor.get", { prefetch: 5 }, serve );
    };

    process.once( "uncaughtException", function ( err ) {
        logger.log( "Stopping Pi-Sensor-RPC-Service" );
        logger.log( err );
        process.exit();
    } );

    SerialPort.on( "open", function () {
        console.log( "Serial Open" );
        SerialPort.on( "data", function ( data ) {
            console.log( "Serial data handler called" );
            serialResponse = utils.parseSerialData( data );
        } );
        broker.once( "connected", create );
    } );
};


throng( run, {
    workers: os.cpus().length,
    lifetime: Infinity
} );
