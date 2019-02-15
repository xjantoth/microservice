"""This is a database model for IP ADDRESS store"""
import pytz
import datetime
from microservice.database_initialized import db


class IpAddress(db.Model):
    __tablename__ = 'request_ips'

    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=datetime.datetime.now(pytz.timezone("Europe/Bratislava")))
    # ipaddr = db.Column(db.IPAddressType)
    ipaddr = db.Column(db.String)

    def __init__(self, ipaddr, created):
        """

        :param ipaddr:
        """
        self.ipaddr = ipaddr
        self.created = created

    def json(self):
        return self.ipaddr

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_address_id(cls, ip):
        """

        :param _id:
        :return:
        """
        return cls.query.filter_by(ipaddr=ip).first()