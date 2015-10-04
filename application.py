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

# Connect to Database and create database session
engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

# Initialize authentication
login_manager = LoginManager()

default_img_url = 'http://orig04.deviantart.net/fa85/f/2012/296/8/7/random_funny___2_by_guppy22-d5irouc.jpg'


@app.route('/api/users', methods=['POST'])
def new_user():
		email = request.json.get('email')
		password = request.json.get('password')
		if email is None or password is None:
				abort(400) # missing arguments
		if session.query(User).filter_by(email=email).first() is not None:
				abort(400) # existing user
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
def index(path):
		if 'username' not in login_session:
				return render_template('index.html')
		else:
				return render_template('index.html', logged='true')

if __name__ == '__main__':
	app.secret_key = 'super_secret_key'
	app.debug = True
	app.run(host='0.0.0.0', port=8000)
