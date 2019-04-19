"""This is a resource file for db-model: IpAddress"""

import pytz
import socket
import datetime
from flask import jsonify
from flask_restful import Resource
from microservice.models import IpAddress

class IpAddressSave(Resource):
    """
    This is the API which will grab the IP address from running
    container and save it into the database.
    """
    def get(self):
        create_date = datetime.datetime.now(pytz.timezone("America/New_York"))
        ip = socket.gethostbyname(socket.gethostname())
        ipi = IpAddress(ip_addr=ip, created=create_date)
        ipi.save_to_db()
        return {"message": "IP address was saved to database."}, 200


class IsAlive(Resource):
    """
    Pseudo micro-service health check which simply returns status code 200 when called.
    It does not perform any action since this is a quite simple micro-service with minimal
    functionality.
    """
    def get(self):
        return {"message": True}, 200


class GetAllIpAddresses(Resource):
    """
    Returns all records from the database.
    """
    def get(self):
        print("breakpoint.")
        _addresses = IpAddress.get_all_ip_address()
        if _addresses:
            data = [{"id": _addr.id, "created": str(_addr.created), "ipaddress": _addr.ip_addr} for _addr in _addresses]
            return data, 200
        return {"message": "No data could be retrived from database."}, 404


