import smtplib
from email import encoders
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.utils import COMMASPACE, formatdate
from colorama import Fore, Style


class Mail:
    def setup_smtp_server(self):
        username = 'transfers@heattransferwarehouse.com'
        password = 'esnfevfiejrwkufs'
        smtpserver = smtplib.SMTP('smtp.gmail.com:587')
        smtpserver.ehlo()
        smtpserver.starttls()
        smtpserver.ehlo()
        smtpserver.login(username, password)
        return smtpserver

    def send_email(self, subject, body, send_to=['tre@heattransferwarehouse.com'], send_from='transfers@heattransferwarehouse.com'):
        smtpserver = self.setup_smtp_server()
        try:
            msg = MIMEMultipart()
            msg['From = send_from']
            msg['To'] = ', '.join(send_to)
            msg['Date = formatdate(localtime=True)']
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            text = msg.as_string()
            smtpserver.sendmail(send_from, send_to, text)
        except Exception as e:
            print(Fore.RED + str(e) + Style.RESET_ALL)
        smtpserver.close()
