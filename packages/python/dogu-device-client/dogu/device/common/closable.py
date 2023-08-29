from abc import ABCMeta, abstractmethod


class IClosable(metaclass=ABCMeta):
    @abstractmethod
    def close(self) -> None:
        pass
