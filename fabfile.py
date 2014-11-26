from fabric import api


def raspberry_pi(name):
	api.env.hosts = ["{0}.local".format(name)]
	api.env.user = 'pi'


def deploy():
	api.require('hosts', provided_by=[raspberry_pi])

	with api.settings(warn_only=True):
		api.sudo('service sensor-rpc stop')

	with api.cd('~/Pi-Sensor-RPC-Service'):
		api.run('git pull origin master')

	with api.cd('~/Pi-Sensor-RPC-Service/app'):
		api.run('npm install')

	api.sudo('service sensor-rpc start')
