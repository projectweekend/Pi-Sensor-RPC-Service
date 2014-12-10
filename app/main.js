var os = require( "os" );
var async = require( "async" );
var throng = require( "throng" );
var connections = require( "./shared/connections" );
var utils = require( "./shared/utils" );


var logger = connections.logger( [ "Pi-Sensor-RPC-Service" ] );

var run = function () {
    logger.log( "Starting Pi-Sensor-RPC-Service" );

    var serialPort = connections.serialport();
    var broker = connections.jackrabbit();

    var serialResponse = null;

    var serialWrite = function ( data ) {
        return function ( done ) {
            serialResponse = null;
            serialPort.write( data, done );
        };
    };

    var serialDrain = function ( done ) {
        serialPort.drain( done );
    };

    var getSerialResponse = function ( done ) {
        var takingTooLong = false;
        var start = new Date();
        while ( !serialResponse && !takingTooLong ) {
            var end = new Date();
            takingTooLong = end - start > 500;
        }

        if ( serialResponse ) {
            return done( null, serialResponse );
        }
        return done( new Error( "Serial response timeout" ) );
    };

    var handleMessage = function ( message, ack ) {
        console.log( "Calling message handler" );
        async.series( [
            serialWrite( message.serialMessage ),
            serialDrain,
            getSerialResponse
        ], function ( err, result ) {
            if ( err ) {
                console.log( err );
                logger.log( err );
                ack();
                process.exit( 1 );
            }
            return ack( result[ 2 ] );
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

    serialPort.on( "open", function () {
        console.log( "Serial Open" );
        serialPort.on( "data", function ( data ) {
            console.log( "Serial data handler registered" );
            serialData = utils.parseSerialData( data );
        } );
        logger.log( "Serial port open" );
        broker.once( "connected", create );
    } );
};


throng( run, {
    workers: os.cpus().length,
    lifetime: Infinity
} );
