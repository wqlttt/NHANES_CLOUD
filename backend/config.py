import os
from GetNhanes.config import Config

class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'prod-key'

class DevelopmentConfig(Config):
    DEBUG = True
