from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, validates
from sqlalchemy import create_engine
import datetime
from passlib.apps import custom_app_context as pwd_context

Base = declarative_base()
secret_key = 'Spray tans are so 1998.'

class User(Base):
	__tablename__ = 'user'

	name = Column(String(80))
	id = Column(Integer, primary_key=True)
	email = Column(String(250), unique=True, nullable=False)
	username = Column(String(80), nullable=False)
	password_hash = Column(String(128))
	picture = Column(String(250))

	@property
	def serialize(self):
		"""Return object data in easily serializeable format"""
		return {
			'name': self.name,
			'email': self.email,
			'username': self.username,
			'id': self.id,
			'picture': self.picture,
		}

	def hash_password(self, password):
		self.password_hash = pwd_context.encrypt(password)

	def verify_password(self, password):
		return pwd_context.verify(password, self.password_hash)



class Category(Base):
	__tablename__ = 'category'

	id = Column(Integer, primary_key=True)
	name = Column(String(250), nullable=False)
	user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
	item = relationship('Item', cascade="all, delete-orphan")
	img_url = Column(String(500))
	timestamp = Column(DateTime, default=datetime.datetime.utcnow)

	@property
	def serialize(self):
		"""Return object data in easily serializeable format"""
		return {
			'name': self.name,
			'id': self.id,
			'user_id': self.user_id,
			'img_url': self.img_url,
			'created': list(self.timestamp.timetuple())
		}


class Item(Base):
	__tablename__ = 'items'

	name = Column(String(80), nullable=False)
	id = Column(Integer, primary_key=True)
	description = Column(String(250))
	category_id = Column(Integer, ForeignKey('category.id'))
	category = relationship(Category)
	user_id = Column(Integer, ForeignKey('user.id'))
	user = relationship(User)
	timestamp = Column(DateTime, default=datetime.datetime.utcnow)
	img_url = Column(String(500))

	@property
	def serialize(self):
		"""Return object data in easily serializeable format"""
		return {
			'name': self.name,
			'description': self.description,
			'id': self.id,
			'category_id': self.category_id,
			'user_id': self.user_id,
			'timestamp': datetimeformat(self.timestamp),
			'img_url': self.img_url
		}


# Datetime formatting to allow json serialization of datetime objects
def datetimeformat(value, format='%A,%B %d,%Y'):
	return value.strftime(format)


engine = create_engine('sqlite:///catalog.db')

Base.metadata.create_all(engine)
