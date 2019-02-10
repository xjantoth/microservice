"""This is a resource file for db-model: IpAddress"""

import pytz
import socket
import datetime
from models import IpAddress
from flask_restful import Resource

class IpAddressSave(Resource):
    """
    This is the API which will grab the IP address from running
    container and save it into the database.
    """
    def get(self):
        create_date = datetime.datetime.now(pytz.timezone("Europe/Bratislava"))
        ip = socket.gethostbyname(socket.gethostname())
        ipi = IpAddress(ipaddr=ip, created=create_date)
        ipi.save_to_db()
        return {"message": "IP address was saved to database."}, 200


