requirements="../requirements.txt"
config="../pg_config.sh"

# TODO: I think this only involves vagrant
# not necessary??? Doesn't hurt to have it though.
pip install -r $requirements

chmod +x ${config}
${config}

# move wsgi for use by the VPS
cp -f catalog-app.wsgi ../