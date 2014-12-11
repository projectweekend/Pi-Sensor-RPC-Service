from StringIO import StringIO

from fabric import api
from fabric.contrib.files import exists


UPSTART_TEMPLATE = """
description "Pi-Sensor-RPC-Service"
start on runlevel [2345]
stop on runlevel [06]
respawn
respawn limit 10 5

env LOGGLY_TOKEN={loggly_token}
env LOGGLY_SUBDOMAIN={loggly_domain}
env RABBIT_URL={rabbit_url}

script
        cd /home/pi/Pi-Sensor-RPC-Service/app && node main.js
end script
"""


def raspberry_pi():
	api.env.hosts = ['{0}.local'.format(api.prompt('Raspberry Pi:'))]
	api.env.user = 'pi'


def install():
	api.require('hosts', provided_by=[raspberry_pi])

	if exists('/etc/init/sensor-rpc.conf', use_sudo=True):
		print('"sensor-rpc" is already installed, use the "update" task for changes')
		return

	upstart_values = {}
	upstart_values['loggly_token'] = api.prompt("Loggly token:")
	upstart_values['loggly_domain'] = api.prompt("Loggly domain:")
	upstart_values['rabbit_url'] = api.prompt("Rabbit URL:")
	upstart_file = StringIO(UPSTART_TEMPLATE.format(**upstart_values))

	api.sudo('echo Yes, do as I say! | apt-get -y --force-yes install upstart')

	with api.cd('/etc/init'):
		upload = api.put(upstart_file, 'sensor-rpc.conf', use_sudo=True)
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
