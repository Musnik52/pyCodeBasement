from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# user-name: postgres
# password: admin
# database: sqlalchemy_test
connection_string = 'postgresql+psycopg2://postgres:admin@localhost/sqlalchemy_test'

Base = declarative_base()

engine = create_engine(connection_string, echo=True)  # echo makes the console print all the sql statements being run

def create_all_entities():
    Base.metadata.create_all(engine)

Session = sessionmaker()

local_session = Session(bind=engine)

'''
from sqlalchemy import asc, text, desc

class DbRepo:
    def __init__(self, local_session):
        self.local_session = local_session

    def get_all(self, table_class):
        return self.local_session.query(table_class).all()

    def get_all_limit(self, table_class, limit_num):
        return self.local_session.query(table_class).limit(limit_num).all()

    def get_all_order_by(self, table_class, column_name, direction=asc):
        return self.local_session.query(table_class).order_by(direction(column_name)).all()

    def get_by_column_value(self, table_class, column_name, value):
        return self.local_session.query(table_class).filter(column_name == value).all()
    
    def get_by_ilike(self,table_class, column_name, exp):
        return self.local_session.query(table_class).filter(column_name.ilike(exp)).all()

    def add(self, one_row):
        self.local_session.add(one_row)
        self.local_session.commit()
        print('added')

    def add_all(self, rows_list):
        self.local_session.add_all(rows_list)
        self.local_session.commit()
        print('Multiple added')

    def delete_by_id(self, table_class, id_column_name, id):
        self.local_session.query(table_class).filter(id_column_name == id).delete(synchronize_session=False)
        self.local_session.commit()
        print('Deleted')

    def update_by_id(self, table_class, id_column_name, id, data):
        self.local_session.query(table_class).filter(id_column_name == id).update(data)
        self.local_session.commit()
        print('Updated')

'''