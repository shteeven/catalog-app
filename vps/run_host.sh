requirements="../requirements.txt"
config="../pg_config.sh"
regex="^apt-get|^pip"
sudo pip install -r $requirements

cat $config | while read line; do
	if [[ $line =~ $regex ]]; then
		sudo $line
	fi
done
