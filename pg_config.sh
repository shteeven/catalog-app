#@IgnoreInspection BashAddShebang
apt-get -qqy update
apt-get -qqy install postgresql python-psycopg2
apt-get -qqy install python-flask python-sqlalchemy
apt-get -qqy install python-pip
apt-get -qqy install python-passlib
pip install werkzeug==0.8.3
pip install flask==0.9
pip install Flask-Login==0.1.3
pip install oauth2client
pip install requests
pip install httplib2
pip install google-api-python-client
pip install bleach

vagrantTip="[35m[1mThe shared directory is located at /vagrant\nTo access your shared files: cd /vagrant(B[m"
echo -e $vagrantTip > /etc/motd