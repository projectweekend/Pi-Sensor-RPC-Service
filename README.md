This project runs on a Raspberry Pi connected, via serial port, to an Arduino ([Ar-Starbug](https://github.com/projectweekend/Ar-Starbug)) that monitors a few sensors. **Pi-Sensor-RPC-Service** connects to a [RabbitMQ](http://www.rabbitmq.com/) server and listens for messages. When a message is received on the appropriate queue, the sensor data is read and returned to the client that sent the message. This architecture makes it simple for any process, running anywhere (like [Holly](https://github.com/projectweekend/Holly)), to access the sensor data as needed.

------------------------------------------------------------------------------
### Installation with Fabric
------------------------------------------------------------------------------

Using [Fabric](http://www.fabfile.org/) there is an installation task included in this project's `fabfile`. With the Raspberry Pi connected to the same network as your computer, run the following command:

```
fab raspberry_pi install
```

The task will prompt you for these values:

* `Raspberry Pi:` - The hostname of the Raspberry Pi, for example: `red-dwarf`. Given the example, the Fabric script will attempt to ssh into `red-dwarf.local`.
* `Loggly token:` - The token from your [Loggly](https://www.loggly.com/) account. The service logs data using Loggly which makes it easier to remotely monitor.
* `Loggly domain:` - The domain from your Loggly account.
* `Serial address:` - The address of the serial port in use, for example: `/dev/ttyAMA0`
* `Serial rate:` - The baud rate for the serial port connection, for example: `9600`
* `Rabbit URL:` - The connection URL for the RabbitMQ server. If you don't feel like running your own, check out [CloudAMPQ](https://www.cloudamqp.com/).
