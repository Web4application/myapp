from .db import Base, engine, SessionLocal
from .models import *

# Create all tables
Base.metadata.create_all(bind=engine)
