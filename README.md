This project runs on a Raspberry Pi connected, via serial port, to an Arduino ([Ar-Starbug](https://github.com/projectweekend/Ar-Starbug)) that monitors a few sensors. **Pi-Sensor-RPC-Service** connects to a [RabbitMQ](http://www.rabbitmq.com/) server and listens for messages. When a message is received on the appropriate queue, the sensor data is read and returned to the client that sent the message. This architecture makes it simple for any process, running anywhere (like [Holly](https://github.com/projectweekend/Holly)), to access the sensor data as needed.


### Installation with Fabric

Using [Fabric](http://www.fabfile.org/) there is an installation task included in this project's `fabfile`. With the Raspberry Pi connected to the same network as your computer, run the following command:

```
fab raspberry_pi install
```

The task will prompt you for these values:

* `Raspberry Pi:` - The hostname of the Raspberry Pi, for example: `red-dwarf`. Given the example, the Fabric script will attempt to ssh into `red-dwarf.local`.
* `Loggly token:` - The token from your [Loggly](https://www.loggly.com/) account. The service logs data using Loggly which makes it easier to remotely monitor.
* `Loggly domain:` - The domain from your Loggly account.
* `Rabbit URL:` - The connection URL for the RabbitMQ server. If you don't feel like running your own, check out [CloudAMPQ](https://www.cloudamqp.com/).

The install process will add an [Upstart](http://upstart.ubuntu.com/) script that will handle starting/stopping the service when the Raspberry Pi starts up or shuts down.

To manually stop it:
```
sudo service sensor-rpc stop
```

To manually start it:
```
sudo service sensor-rpc start
```


### Environment Variables

The following environment variables can be used to control configuration. The required items are auto-populated via the install task.

* `RABBIT_URL` - Required - The connection URL for the RabbitMQ server. If you don't feel like running your own, check out [CloudAMPQ](https://www.cloudamqp.com/).
* `LOGGLY_TOKEN` - Required - The token from your [Loggly](https://www.loggly.com/) account. The service logs data using Loggly which makes it easier to remotely monitor.
* `LOGGLY_SUBDOMAIN` - Required - The domain from your Loggly account.
* `SENSOR_QUEUE` - Optional - The name of the queue to use. Defaults to `sensor.get`.
* `SENSOR_LOGGLY_TAG` - Optional - The tag name to use in Loggly when recording items. Defaults to `Pi-Sensor-RPC-Service`.
* `SERIAL_ADDRESS` - Optional - The serial address to use. Defaults to `/dev/ttyAMA0`.
* `SERIAL_RATE` - Optional - The baud rate for the serial connection. Defaults to `9600`.
* `SERIAL_READ_INTERVAL` - Optional - The interval, in milliseconds, used for checking the serial line for new data. Defaults to `50`.


### Usage

Any script or program can request data from this sensor provided:

* It has the same `Rabbit URL` value used during installation and can connect to the RabbitMQ server.
* It sends messages to the correct queue (`sensor.get` in this project).

#### JavaScript Example

There are plenty of JavaScript client libraries for RabbitMQ. This example uses [Jackrabbit](https://github.com/hunterloftis/jackrabbit).

```javascript
var jackrabbit = require( "jackrabbit" );

// Use an environment variable for RABBIT_URL
var broker = jackrabbit( process.env.RABBIT_URL, 1 );

var ready = function () {
    // Send a message to request the sensor data
    broker.publish( "sensor.get", { serialMessage: "A" }, function ( err, data ) {
        if ( err ) {
            // Do something with the error
            console.log( err );
        }
        // Do something with the sensor data
        console.log( data );
        process.exit();
    } );
};

var create = function () {
  broker.create( "sensor.get", { prefetch: 5 }, ready );
};

broker.once( "connected", create );
```
