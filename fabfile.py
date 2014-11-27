from StringIO import StringIO

from fabric import api
from fabric.operations import prompt, put


UPSTART_TEMPLATE = """
description "Pi-Sensor-RPC-Service"
start on runlevel [2345]
stop on runlevel [06]
respawn
respawn limit 10 5

env LOGGLY_TOKEN={loggly_token}
env LOGGLY_SUBDOMAIN={loggly_domain}
env SERIAL_ADDRESS={serial_address}
env SERIAL_RATE={serial_rate}
env RABBIT_URL={rabbit_url}

script
        cd /home/pi/Pi-Sensor-RPC-Service/app && node main.js
end script
"""


def raspberry_pi():
	api.env.hosts = ["{0}.local".format(prompt("Raspberry Pi:"))]
	api.env.user = 'pi'


def install():
	api.require('hosts', provided_by=[raspberry_pi])

	upstart_values = {}
	upstart_values['loggly_token'] = prompt("Loggly token:")
	upstart_values['loggly_domain'] = prompt("Loggly domain:")
	upstart_values['serial_address'] = prompt("Serial address:")
	upstart_values['serial_rate'] = prompt("Serial rate:")
	upstart_values['rabbit_url'] = prompt("Rabbit URL:")
	upstart_file = StringIO(UPSTART_TEMPLATE.format(**upstart_values))

	with api.cd('/etc/init'):
		upload = put(upstart_file, 'sensor-rpc.conf', use_sudo=True)
		assert upload.succeeded

	api.run('git clone https://github.com/projectweekend/Pi-Sensor-RPC-Service.git')

	with api.cd('~/Pi-Sensor-RPC-Service/app'):
		api.run('npm install')

	api.sudo('service sensor-rpc start')


def update():
	api.require('hosts', provided_by=[raspberry_pi])

	with api.settings(warn_only=True):
		api.sudo('service sensor-rpc stop')

	with api.cd('~/Pi-Sensor-RPC-Service'):
		api.run('git pull origin master')

	with api.cd('~/Pi-Sensor-RPC-Service/app'):
		api.run('npm install')

	api.sudo('service sensor-rpc start')
