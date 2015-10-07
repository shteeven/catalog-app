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
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, SignatureExpired, BadSignature
from flask.ext.cors import cross_origin


app = Flask(__name__)

APPLICATION_NAME = "Catalog"
CLIENT_ID = json.loads(open('client_secrets.json', 'r').read())['web']['client_id']

# Connect to Database and create database session
engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

default_img_url = 'http://orig04.deviantart.net/fa85/f/2012/296/8/7/random_funny___2_by_guppy22-d5irouc.jpg'

##########################
# API and Page Rendering
##########################
# Create a new category; verify auth and redirect/render accordingly
# @app.route('/category/new/', methods=['GET', 'POST'])
# def newCategory():
# 	if not validateSignedIn():
# 		return redirect('/login')
# 	if request.method == 'POST':
# 		if validateName(request.form['name']):
# 			valid, img_url = validateImageUrl(request.form['img_url'])
# 			# Save new category.
# 			if valid == 200:
# 				newCategory = Category(name=request.form['name'], img_url=img_url, user_id=login_session['user_id'])
# 				session.add(newCategory)
# 				session.commit()
# 				flash('New Category %s Successfully Created' % newCategory.name)
# 				return redirect(url_for('showCategories'))
# 	return render_template('newCategory.html', logged='true')
@app.route('/')
@app.route('/<path:path>')
def index(path=''):
		if 'username' not in login_session:
				return render_template('index.html')
		else:
				return render_template('index.html', logged='true')


##########################
# User Authentication
##########################
@app.route('/gconnect', methods=['POST'])
def gconnect():
	# Validate state token
	print('this')
	print(request.args.get('state'))
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

	user = getUser(user_id)

	token = user.generate_auth_token()
	return jsonify({ 'token': token.decode('ascii') })
	# return jsonify({'email': data['email'], 'username': data['name'], 'user_id': user_id,
	#                 'picture': data['picture'], 'token': generate_auth_token(user_id, 600)}), 201


# DISCONNECT - Revoke a current user's token and reset their login_session
# @app.route('/gdisconnect')
def gdisconnect():
	# Only disconnect a connected user.
	access_token = login_session.get('access_token')
	if access_token is None:
		response = make_response(
			json.dumps('Current user not connected.'), 401)
		response.headers['Content-Type'] = 'application/json'
		return response
	url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
	h = httplib2.Http()
	result = h.request(url, 'GET')[0]
	if result['status'] == '200':
		# Reset the user's sesson.
		return result
	else:
		# For whatever reason, the given token was invalid.
		response = make_response(
			json.dumps('Failed to revoke token for given user.', 400))
		response.headers['Content-Type'] = 'application/json'
		return response


# umbrella disconnect function, signing out user regardless of service used
@app.route('/disconnect')
def disconnect():
	if 'provider' in login_session:
		if login_session['provider'] == 'google':
			gdisconnect()
			del login_session['gplus_id']
			del login_session['access_token']
		if login_session['provider'] == 'facebook':
			# fbdisconnect()
			del login_session['facebook_id']

		del login_session['username']
		del login_session['email']
		del login_session['picture']
		del login_session['user_id']
		del login_session['provider']
		flash('Successfully logged out.')
		return redirect(url_for('index'))
	else:
		return redirect(url_for('index'))


# register users without oauth
@app.route('/register', methods=['POST'])
def registerUser():
		email = request.json.get('email')
		password = request.json.get('password')
		username = request.json.get('username')
		if email is None or password is None or username is None:
				print('Form fields incomplete.')
				abort(400)  # missing arguments
		if session.query(User).filter_by(email=email).first() is not None:
				print('User already registered.')
				abort(400)  # existing user
		user = User(email=email)
		user.username = username
		user.hash_password(password)
		session.add(user)
		session.commit()

		# set login_session data
		user = session.query(User).filter_by(email=email).one()
		login_session['username'] = user.username
		login_session['email'] = user.email
		login_session['user_id'] = user.id
		token = user.generate_auth_token()
		return jsonify({ 'token': token.decode('ascii') })
		# return jsonify({'email': user.email, 'username': user.username, 'token': generate_auth_token(user.id, 600)}), 201


# login user without oauth
@app.route('/login', methods=['POST'])
def login():
	username = request.json.get('username')
	password = request.json.get('password')
	if username is None or password is None:
		print('Form fields incomplete.')
		abort(400)  # missing arguments
	user = session.query(User).filter_by(username=username).first()
	if user is None:
		print('User not registered.')
		abort(400)  # non-existent user
	if not user.verify_password(password=password):
		print('Username or password incorrect.')
		abort(401)  # invalid credentials
	login_session['username'] = user.username
	login_session['email'] = user.email
	login_session['user_id'] = user.id

	token = user.generate_auth_token()
	return jsonify({'token': token.decode('ascii')})
	# return jsonify({'email': user.email, 'username': user.username, 'user_id': user.id, 'token': generate_auth_token(user.id, 600)}), 201


# render login-form.html with state and client_id
@app.route('/loginform')
def loginForm():
	state = generateRandomString()
	login_session['state'] = state
	print(state)
	return render_template("login-form.html", STATE=state, client_id=CLIENT_ID)


# return user data if user is signed in and token is valid
@app.route('/api/userdata')
def returnUserData():
	if not validateSignedIn():
		return redirect('/loginpage')

	return jsonify({'name': 'steven'})

##########################
# Security Helpers: Login
##########################
# Create 'STATE' strings
def generateRandomString():
	return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(32))

# Check if user is signed in
def validateSignedIn():
	if 'username' not in login_session:
		return False
	else:
		return True


##########################
# User Helper
##########################
# register user with oauth
def createUser(login_session):
	newUser = User(name=login_session['username'], email=login_session[
		'email'], picture=login_session['picture'], username=login_session['username'])
	session.add(newUser)
	session.commit()
	user = session.query(User).filter_by(email=login_session['email']).one()
	return user.id


# get user info
def getUser(user_id):
	user = session.query(User).filter_by(id=user_id).one()
	return user


# get user ID
def getUserID(email):
	try:
		user = session.query(User).filter_by(email=email).one()
		return user.id
	except:
		flash("Failed to retrieve user ID.")
		return None


##########################
# Security Helpers: CSRF
##########################
# Generate a token for a cookie XSRF-prevention for registered users
def generate_auth_token(user_id, expiration=600):
	s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
	return s.dumps({'id': user_id})

# refresh the token and append it as a cookie
@app.after_request
def after_request(resp):
	try:
		user = getUserID(login_session['email'])
	except KeyError:
		return resp
	if user is not None:
		# refresh token
		token = generate_auth_token(user)
		resp.set_cookie('XSRF-TOKEN', token.decode('ascii'))
	return resp

# Is auth token valid
def user_valid(cookie=False):
	if cookie:
		token = request.cookies.get('XSRF-TOKEN')
	else:
		token = request.headers.get('X-XSRF-TOKEN')
	if token is None:
		return None
	user = verify_auth_token(token)
	return user

# verify token matches token sent to user
def verify_auth_token(token):
	print(app.config['SECRET_KEY'])
	s = Serializer(app.config['SECRET_KEY'])
	try:
		data = s.loads(token)
	except SignatureExpired:
		return None    # valid token, but expired
	except BadSignature:
		return None    # invalid token
	return User.query.get(data['id'])

@app.after_request
def add_header(response):
	# prevent browser caching
	response.headers['Cache-Control'] = 'public, max-age=0'
	return response



##########################
# Run application
##########################
if __name__ == '__main__':
	app.secret_key = 'Spray tans are so 1998.'
	app.debug = True
	app.run(host='0.0.0.0', port=8000)
