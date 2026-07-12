import logging


class BaseService:
    def __init__(self) -> None:
        """
        Base Service Layer class. Initializes logger dynamically for subclasses.
        """
        self.logger = logging.getLogger(self.__class__.__module__ + "." + self.__class__.__name__)
