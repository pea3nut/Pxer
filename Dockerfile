FROM nginx
MAINTAINER pea3nut "626954412@qq.com"

RUN rm /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/*
COPY ./dist/ /usr/share/nginx/html/
COPY ./public /usr/share/nginx/html/public

COPY ./nginx.conf /etc/nginx/conf.d/pxer.conf

EXPOSE 80
