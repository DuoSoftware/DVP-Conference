FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-Conference.git /usr/local/src/conference
RUN cd /usr/local/src/conference; npm install
CMD ["nodejs", "/usr/local/src/conference/app.js"]

EXPOSE 8821