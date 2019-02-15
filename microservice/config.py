"""This config hold database connection details."""
import os

def get_db_ipaddress():
    try:
        return os.environ['PSQL_DB_ADDRESS']
    except:
        return "127.0.0.1"

psql_db_address = get_db_ipaddress()

POSTGRES = {
    'user': 'micro',
    'pw': 'password',
    'db': 'microservice',
    'host': psql_db_address,
    'port': '5432',
}