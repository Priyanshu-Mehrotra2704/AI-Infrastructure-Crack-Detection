import os

from dotenv import load_dotenv
import redis

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# decode_responses=True so we get str back instead of bytes everywhere
redis_client = redis.from_url(REDIS_URL, decode_responses=True)