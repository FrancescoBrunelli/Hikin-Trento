FROM node:current-alpine3.23 AS building

ADD . /Hikin-Trento/client

WORKDIR /Hikin-Trento/client
RUN npm install
RUN npm run build

CMD ["/usr/local/bin/npm", "run", "preview"] 
