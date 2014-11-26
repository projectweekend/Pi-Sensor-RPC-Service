exports.parseSerialData = function ( serialData ) {
    var output = {
        date: new Date()
    };
    serialData.split( "|" ).map( function ( sensorReading ) {
        var parts = sensorReading.split( ":" );
        output[ parts[ 0 ] ] = parseFloat( parts[ 1 ] );
    } );
    return output ;
};
