This project currently runs on a Raspberry Pi connected, via serial port, to an Arduino ([Ar-Starbug](https://github.com/projectweekend/Ar-Starbug)) that is monitoring a few sensors. **Pi-Sensor-RPC-Service** connects to a [RabbitMQ](http://www.rabbitmq.com/) server and listens for messages. When a message is received on the appropriate queue, the sensor data is read and returned to the client that sent the message. This architecture makes it simple for any process, running anywhere (like [Holly](https://github.com/projectweekend/Holly)), to access the sensor data as needed. All it has to do is pass messages to the RabbitMQ server.
