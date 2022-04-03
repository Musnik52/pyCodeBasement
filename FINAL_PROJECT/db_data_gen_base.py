from abc import ABC, abstractmethod
from logger import Logger
from db_repo_connection_pool import DbRepoConnectionPool


class BaseDbDataGen(ABC):

    @abstractmethod
    def __init__(self):
        self.repool = DbRepoConnectionPool.get_instance()
        self.repo = self.repool.get_connection()
        self.logger = Logger.get_instance()
