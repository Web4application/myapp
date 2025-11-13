from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from database.db import Base
import datetime

# Association table for friends
friend_table = Table(
    'friends', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('friend_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    bio = Column(String, default="New user bio")
    avatar = Column(String)
    friends = relationship(
        "User",
        secondary=friend_table,
        primaryjoin=id==friend_table.c.user_id,
        secondaryjoin=id==friend_table.c.friend_id,
        backref="friend_of"
    )
    friend_requests = relationship("FriendRequest", back_populates="to_user")
    posts = relationship("Post", back_populates="user")
    messages_sent = relationship("Message", back_populates="sender", foreign_keys='Message.sender_id')
    messages_received = relationship("Message", back_populates="receiver", foreign_keys='Message.receiver_id')
    events_created = relationship("Event", back_populates="creator")

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"))
    to_user_id = Column(Integer, ForeignKey("users.id"))
    to_user = relationship("User", back_populates="friend_requests")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    image = Column(String)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    post = relationship("Post", back_populates="comments")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="messages_received", foreign_keys=[receiver_id])

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    time = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="events_created")
