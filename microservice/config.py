"""This config hold database connection details."""
import os

POSTGRES = {
    'user': os.environ.get('PSQL_DB_USER', 'micro'),
    'pw': os.environ.get('PSQL_DB_PASS', 'password'),
    'db': os.environ.get('PSQL_DB_NAME', 'microservice'),
    'host': os.environ.get('PSQL_DB_ADDRESS', '127.0.0.1'),
    'port': os.environ.get('PSQL_DB_PORT', '5432'),
}