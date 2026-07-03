from database import engine
from models import Base

print("Creating Tables...")

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully!")