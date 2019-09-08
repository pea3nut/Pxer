FROM node
MAINTAINER pea3nut "626954412@qq.com"

RUN mkdir /pxer
COPY . /pxer/

WORKDIR /pxer
RUN rm -rf /pxer/node_modules
RUN npm install --production

EXPOSE 80

ENTRYPOINT ["npm","run","prod"]
