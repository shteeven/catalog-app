__author__ = 'Shtav'
from flask import Flask, render_template, request, redirect, jsonify, url_for, flash, make_response, abort
from flask.ext.login import LoginManager
from urlparse import urljoin
from werkzeug.contrib.atom import AtomFeed
from sqlalchemy import create_engine, asc
from sqlalchemy.orm import sessionmaker, exc
from database_setup import Base, Category, Item, User
from flask import session as login_session
import random
import string
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
import httplib2
import json
import requests

app = Flask(__name__)

APPLICATION_NAME = "Catalog"
CLIENT_ID = json.loads(open('client_secrets.json', 'r').read())['web']['client_id']

# Connect to Database and create database session
engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

# Initialize authentication
login_manager = LoginManager()

default_img_url = 'http://orig04.deviantart.net/fa85/f/2012/296/8/7/random_funny___2_by_guppy22-d5irouc.jpg'



@app.route('/gconnect', methods=['POST'])
def gconnect():
	# Validate state token
	if request.args.get('state') != login_session['state']:
		response = make_response(json.dumps('Invalid state parameter.'), 401)
		response.headers['Content-Type'] = 'application/json'
		return response
	# Obtain authorization code, now compatible with Python3
	# request.get_data()
	code = request.data.decode('utf-8')

	try:
		# Upgrade the authorization code into a credentials object
		oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
		oauth_flow.redirect_uri = 'postmessage'
		credentials = oauth_flow.step2_exchange(code)
	except FlowExchangeError:
		response = make_response(
			json.dumps('Failed to upgrade the authorization code.'), 401)
		response.headers['Content-Type'] = 'application/json'
		return response

	# Check that the access token is valid.
	access_token = credentials.access_token
	url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
	       % access_token)
	# Submit request, parse response - Python3 compatible
	h = httplib2.Http()
	response = h.request(url, 'GET')[1]
	str_response = response.decode('utf-8')
	result = json.loads(str_response)

	# If there was an error in the access token info, abort.
	if result.get('error') is not None:
		response = make_response(json.dumps(result.get('error')), 500)
		response.headers['Content-Type'] = 'application/json'

	# Verify that the access token is used for the intended user.
	gplus_id = credentials.id_token['sub']
	if result['user_id'] != gplus_id:
		response = make_response(
			json.dumps("Token's user ID doesn't match given user ID."), 401)
		response.headers['Content-Type'] = 'application/json'
		return response

	# Verify that the access token is valid for this app.
	if result['issued_to'] != CLIENT_ID:
		response = make_response(
			json.dumps("Token's client ID does not match app's."), 401)
		response.headers['Content-Type'] = 'application/json'
		return response

	stored_access_token = login_session.get('access_token')
	stored_gplus_id = login_session.get('gplus_id')
	if stored_access_token is not None and gplus_id == stored_gplus_id:
		login_session['access_token'] = access_token
		response = make_response(
			json.dumps('Current user is already connected.'),
			200)
		response.headers['Content-Type'] = 'application/json'
		return response

	# Store the access token in the session for later use.
	login_session['provider'] = 'google'
	login_session['access_token'] = access_token
	login_session['gplus_id'] = gplus_id

	# Get user info
	userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
	params = {'access_token': access_token, 'alt': 'json'}
	answer = requests.get(userinfo_url, params=params)

	data = answer.json()

	login_session['username'] = data['name']
	login_session['picture'] = data['picture']
	login_session['email'] = data['email']

	# see if user exists, if it doesn't make a new one
	user_id = getUserID(login_session['email'])
	if not user_id:
		user_id = createUser(login_session)
	login_session['user_id'] = user_id

	output = ''
	output += '<h1>Welcome, '
	output += login_session['username']
	output += '!</h1>'
	output += '<img src="'
	output += login_session['picture']
	output += ' " style = "width: 300px; height: 300px;border-radius: 150px;-webkit-border-radius: 150px;-moz-border-radius: 150px;"> '
	flash("you are now logged in as %s" % login_session['username'])
	return output


@app.route('/login', methods=['GET', 'POST'])
def login():
	print(request.json)
	return redirect(url_for('index'))

@app.route('/loginform')
def loginForm():
	state = generateRandomString()
	login_session['state'] = state
	return render_template("login-form.html", STATE=state, client_id=CLIENT_ID)


@app.route('/api/users', methods=['POST'])
def new_user():
		email = request.json.get('email')
		password = request.json.get('password')
		if email is None or password is None:
				abort(400)  # missing arguments
		if session.query(User).filter_by(email=email).first() is not None:
				abort(400)  # existing user
		user = User(email=email)
		user.hash_password(password)
		session.add(user)
		session.commit()
		return jsonify({'email': user.email}), 201, {'Location': url_for('get_user', id=user.id, _external=True)}


@app.route('/api/users/<int:id>')
def get_user(id):
		user = User.query.get(id)
		if not user:
				abort(400)
		return jsonify({'username': user.username})


@app.route('/')
@app.route('/<path:path>')
def index(path=''):
		if 'username' not in login_session:
				return render_template('index.html')
		else:
				return render_template('index.html', logged='true')


def generateRandomString():
	return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(32))


def generateCsrfToken():
	if '_csrf_token' not in login_session:
		login_session['_csrf_token'] = generateRandomString()
	return login_session['_csrf_token']


if __name__ == '__main__':
	app.secret_key = 'super_secret_key'
	app.debug = True
	app.run(host='0.0.0.0', port=8000)
