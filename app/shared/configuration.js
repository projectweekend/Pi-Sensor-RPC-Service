if ( !process.env.RABBIT_URL ) {
    throw new Error( "Configuration: RabbitMQ connection URL (RABBIT_URL) must be defined" );
}

if ( !process.env.LOGGLY_TOKEN ) {
    throw new Error( "Configuration: Loggly account token (LOGGLY_TOKEN) must be defined" );
}

if ( !process.env.LOGGLY_SUBDOMAIN ) {
    throw new Error( "Configuration: Loggly account subdomain (LOGGLY_SUBDOMAIN) must be defined" );
}

module.exports = {
    rabbitURL: process.env.RABBIT_URL,
    logglyToken: process.env.LOGGLY_TOKEN,
    logglySubdomain: process.env.LOGGLY_SUBDOMAIN,
    sensorQueue: process.env.SENSOR_QUEUE || "sensor.get",
    sensorReadingLogglyTag: process.env.SENSOR_LOGGLY_TAG || "Pi-Sensor-RPC-Service",
    serialAddress: process.env.SERIAL_ADDRESS || "/dev/ttyAMA0",
    serialRate: process.env.SERIAL_RATE || 9600,
    serialReadInterval: process.env.SERIAL_READ_INTERVAL || 50
};
