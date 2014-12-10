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
            console.log( "Calling serial write with: " + data );
            serialResponse = null;
            SerialPort.write( data, done );
        };
    };

    var getSerialResponse = function ( done ) {
        console.log( "Calling serial response" );
        console.log( "serialResponse: " + serialResponse );
        return done( null, serialResponse );
        // var takingTooLong = false;
        // var start = new Date();
        // while ( !serialResponse && !takingTooLong ) {
        //     var end = new Date();
        //     takingTooLong = end - start > 2000;
        // }
        // while ( !serialResponse ) {

        // }

        // if ( serialResponse ) {
        //     return done( null, serialResponse );
        // }
        // return done( new Error( "Serial response timeout" ) );
    };

    var handleMessage = function ( message, ack ) {
        console.log( "Calling message handler - message.serialMessage: " + message.serialMessage );
        async.series( [
            serialWrite( message.serialMessage ),
            getSerialResponse
        ], function ( err, result ) {
            if ( err ) {
                console.log( err );
                logger.log( err );
                ack();
                process.exit( 1 );
            }
            console.log( result );
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
