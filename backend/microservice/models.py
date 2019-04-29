"""This is a database model for IP ADDRESS store"""
import pytz
import datetime
from microservice.database_initialized import db


class IpAddress(db.Model):
    __tablename__ = 'request_ips'

    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(
        db.DateTime,
        default=datetime.datetime.now(
            pytz.timezone("America/New_York")
        )
    )
    ip_addr = db.Column(db.String)

    def __init__(self, ip_addr, created):
        """

        :param ip_addr:
        :param created:
        """
        self.ip_addr = ip_addr
        self.created = created

    def json(self):
        return self.ip_addr

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_address_id(cls, ip):
        """

        :param ip:
        :return:
        """
        return cls.query.filter_by(ipaddr=ip).first()

    @classmethod
    def get_all_ip_address(cls):
        """

        :return:
        """
        try:
            addresses = cls.query.all()
            return addresses
        except Exception as e:
            print("Could not return data: {}".format(e))
            return None

