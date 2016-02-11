requirements="../requirements.txt"
config="../pg_config.sh"
regex="^apt-get|^pip"
pip install -r $requirements

chmod +x ${config}
${config}

#cat $config | while read line; do
#	if [[ $line =~ $regex ]]; then
#		echo "installing $line"
#		$line
#	else
#		echo "DID NOT INSTALL $line"
#	fi
#done

# move wsgi for use by the VPS
cp -f catalog-app.wsgi ../