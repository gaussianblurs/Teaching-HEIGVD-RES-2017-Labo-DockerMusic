FROM node:4.3.1
MAINTAINER Arnold von Bauer Gauss <arnold.vonbauergauss@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system.
#
COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/auditor.js"]
