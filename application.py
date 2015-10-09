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

default_img_url = 'http://img2.wikia.nocookie.net/__cb20130511180903/legendmarielu/images/b/b4/No_image_available.jpg'

##########################
# GET: API and Page Rendering
##########################
# send initial page, client-side will handle routing
@app.route('/')
@app.route('/<path:path>')
def index(path=''):
	if 'username' not in login_session:
		return render_template('index.html')
	else:
		print(login_session['username'])
		return render_template('index.html', logged='true')


# render login-form.html with state and client_id
@app.route('/loginform')
def loginForm():
	state = generateRandomString()
	login_session['state'] = state
	login_session['_csrf_token'] = state
	return render_template("login-form.html", client_id=CLIENT_ID)


# return all catalogs to any request, optional limit
@app.route('/api/categories')
def getCategories():
	categories = session.query(Category).order_by(Category.timestamp).all()
	return jsonify(Category=[r.serialize for r in categories])


##########################
# CRUD: All reqs must be 'POST' for XSRF verification
##########################

# CREATE a CATEGORY, requires login  (COMPLETE)
@app.route('/api/createcategory', methods=['POST'])
def createCategory():
	if 'username' not in login_session:
		abort(401)
	if validateExists(request.form['name']):
		valid, img_url, msg = validateImageUrl(request.form['img_url'])
		# Save new category.
		if valid == 200:
			newCategory = Category(name=request.form['name'], img_url=img_url, user_id=login_session['user_id'])
			session.add(newCategory)
			session.commit()
		else:
			return jsonify('message', msg), valid
	else:
		return jsonify('message', 'You must enter a name.'), 422


# CREATE an ITEM, requires login and category ownership TODO:
@app.route('/api/createitem', methods=['POST'])
def createItem():
	if 'username' not in login_session:
		abort(401)
	if validateExists(request.form['name']):
		valid, img_url, msg = validateImageUrl(request.form['img_url'])
		# Save new category.
		if valid == 200:
			newCategory = Category(name=request.form['name'], img_url=img_url, user_id=login_session['user_id'])
			session.add(newCategory)
			session.commit()
		else:
			return jsonify('message', msg), valid
	else:
		return jsonify('message', 'You must enter a name.'), 422

# EDIT a CATEGORY, requires login and category ownership TODO
@app.route('/api/createcategory', methods=['POST'])
def createCategory():
	if 'username' not in login_session:
		abort(401)
	if validateExists(request.form['name']):
		valid, img_url, msg = validateImageUrl(request.form['img_url'])
		# Save new category.
		if valid == 200:
			newCategory = Category(name=request.form['name'], img_url=img_url, user_id=login_session['user_id'])
			session.add(newCategory)
			session.commit()
		else:
			return jsonify('message', msg), valid
	else:
		return jsonify('message', 'You must enter a name.'), 422

# EDIT an ITEM, requires login and item ownership TODO
@app.route('/api/createcategory', methods=['POST'])
def createCategory():
	if 'username' not in login_session:
		abort(401)
	if validateExists(request.form['name']):
		valid, img_url, msg = validateImageUrl(request.form['img_url'])
		# Save new category.
		if valid == 200:
			newCategory = Category(name=request.form['name'], img_url=img_url, user_id=login_session['user_id'])
			session.add(newCategory)
			session.commit()
		else:
			return jsonify('message', msg), valid
	else:
		return jsonify('message', 'You must enter a name.'), 422



##########################
# User Authentication
##########################
@app.route('/api/gconnect', methods=['POST'])
def gconnect():
	# Validate state token
	if request.args.get('state') != login_session['_csrf_token']:
		response = make_response(json.dumps('Invalid state parameter.'), 401)
		response.headers['Content-Type'] = 'application/json'
		return response
	# Obtain authorization code, now compatible with Python3
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

	# Get user info
	userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
	params = {'access_token': access_token, 'alt': 'json'}
	answer = requests.get(userinfo_url, params=params)

	data = answer.json()

	# see if user exists, if it doesn't make a new one
	user_id = getUserID(data['email'])
	if not user_id:
		user_id = createUser(login_session)

	# set login_session data
	user = getUser(user_id)
	login_session['access_token'] = access_token
	login_session['gplus_id'] = gplus_id

	login_session['username'] = user.username
	login_session['email'] = user.email
	login_session['picture'] = user.picture
	login_session['user_id'] = user.id
	login_session['provider'] = 'google'
	response = make_response(json.dumps(user.serialize), 200)
	response.headers['Content-Type'] = 'application/json'
	return response


# Revoke google oauth token
def gdisconnect():
	# Only disconnect a connected user.
	access_token = login_session.get('access_token')
	if access_token is None:
		return '200'
	url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
	h = httplib2.Http()
	result = h.request(url, 'GET')[0]
	print(result)
	if result['status'] == '200':
		# Reset the user's session.
		print(result)
		return '200'
	else:
		# For whatever reason, the given token was invalid.
		response = make_response(
			json.dumps('Failed to revoke token for given user.', 400))
		response.headers['Content-Type'] = 'application/json'
		return '200'


# umbrella disconnect function, signing out user regardless of service used
@app.route('/api/disconnect')
def disconnect():
	provider = login_session.pop('provider', None)
	if provider == 'google':
		gdisconnect()
	login_session.clear()
	return 'Successfully logged out.'


# register users without oauth
@app.route('/api/register', methods=['POST'])
def registerUser():
	email = request.form.get('email')
	password = request.form.get('password')
	username = request.form.get('username')
	if email is None or password is None or username is None:
		print('Form fields incomplete.')
		abort(400)  # missing arguments
	if session.query(User).filter_by(email=email).first() is not None:
		print('User already registered.')
		abort(400)  # existing user
	# initialize user
	user = User(email=email)
	user.username = username
	user.hash_password(password)
	session.add(user)
	session.commit()

	# set login_session data
	user = session.query(User).filter_by(email=email).one()
	login_session['username'] = user.username
	login_session['email'] = user.email
	login_session['picture'] = user.picture
	login_session['user_id'] = user.id
	login_session['provider'] = 'none'

	return jsonify({'username': user.username, 'email': user.email, 'picture': user.picture, 'user_id': user.id}), 201

# login user without oauth
@app.route('/api/login', methods=['POST'])
def login():
	username = request.form.get('username')
	password = request.form.get('password')
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

	# set login_session data
	login_session['username'] = user.username
	login_session['email'] = user.email
	login_session['picture'] = user.picture
	login_session['user_id'] = user.id
	login_session['provider'] = 'none'
	return jsonify({'username': user.username, 'email': user.email, 'picture': user.picture, 'user_id': user.id}), 201

# get the user who is currently signed in.
@app.route('/api/userdata')
def getCurrentUser():
	if 'username' not in login_session:
		abort(403)
	else:
		user = session.query(User).filter_by(username=login_session['username']).first()
		return jsonify({'username': user.username, 'email': user.email, 'picture': user.picture, 'user_id': user.id}), 201


##########################
# CRUD Helpers
##########################

# check to see if name exists; returns a boolean
def validateExists(item):
	if item == '' or item is None:
		return False
	return True


# validate image url as an actual url
def validateImageUrl(img_url):
	# if user does not include an image url, send back a default
	if img_url == '':
		return 200, default_img_url, ''
	# if user includes img, check if valid.
	else:
		try:
			r = requests.get(img_url)
			return r.status_code, img_url, ''
		except requests.exceptions.MissingSchema:
			return '400', '', 'Image url is an invalid schema. Enter an actual url or leave the field blank.'
		except requests.exceptions.InvalidSchema:
			return '400', '', 'Image url is missing schema. A preceding "http://" might fix it, or leave the field blank.'


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

# get user object
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
# Security Helpers
##########################

# Create 'STATE' strings
def generateRandomString():
	return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(32))

# Generate a token for a cookie XSRF-prevention for registered users
def generateCsfrToken(user_id, expiration=1200):
	s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
	token = s.dumps({'id': user_id})
	login_session['_csrf_token'] = token
	return token

# Read in token
@app.before_request
def csrfProtectRead():
	if request.method == "POST" and request.endpoint != "gconnect":
		print('it popped')
		token = login_session.pop('_csrf_token', None)
		req_token = request.cookies.get('XSRF-TOKEN')  # or request.args.get('state')
		if not token or token != req_token:
			print('Token does not match.')
			abort(403)

# Set csrf token
@app.after_request
def crsfProtectWrite(resp):
	if 'username' not in login_session:
		token = generateRandomString()
	else:
		token = generateCsfrToken(login_session['user_id'])
	login_session['_csrf_token'] = token
	resp.set_cookie('XSRF-TOKEN', token.decode('ascii'))
	return resp


##########################
# Run application
##########################
if __name__ == '__main__':
	app.secret_key = 'Spray tans are so 1998.'
	app.debug = True
	app.run(host='0.0.0.0', port=8000)


