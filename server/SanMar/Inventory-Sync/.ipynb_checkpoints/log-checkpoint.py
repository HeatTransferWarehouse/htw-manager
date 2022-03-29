import logging as log
import os
from datetime import date
from colorama import Fore, Style

cwd_path = os.getcwd()
today = date.today()
logfilename = '%s/logs/%s-inventory.log' % (
    cwd_path, today.strftime('%y-%m-%d'))
log.basicConfig(filename=logfilename, format='%(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S %p', level=log.INFO)


class Log():
    def __init__(self):
        self.foo = 'bar'

    def success(self, msg):
        print(Fore.GREEN + msg + Style.RESET_ALL)
        log.info(msg)

    def info(self, msg):
        print(Fore.CYAN + msg + Style.RESET_ALL)
        log.info(msg)

    def warn(self, msg):
        print(Fore.YELLOW + msg + Style.RESET_ALL)
        log.warning(msg)

    def error(self, msg):
        print(Fore.RED + msg + Style.RESET_ALL)
        log.error(msg)
