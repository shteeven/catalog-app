requirements="../requirements.txt"
config="../pg_config.sh"
regex="^apt-get|^pip"
sudo pip install -r $requirements

cat $config | while read line; do
	if [[ $line =~ $regex ]]; then
		sudo $line
	fi
done

# move wsgi for use by the VPS
sudo cp -f catalog-app.wsgi ../