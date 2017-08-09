FROM ubuntu

RUN apt-get update

RUN apt-get install build-essential autoconf libboost-all-dev libssl-dev libprotobuf-dev\

                protobuf-compiler libtool autoconf automake \

                autotools-dev m4 libdb++-dev pkg-config git bsdmainutils -y

RUN apt-get install vim npm curl mongodb -y

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - &&  apt-get install -y nodejs

RUN cd ~ && git clone -b develop --single-branch https://github.com/NIC619/gcoin-community.git

RUN cd ~/gcoin-community && ./autogen.sh && ./configure --with-gui=no --without-miniupnpc && make

RUN cd ~/gcoin-community/src && make install && gcoind -daemon

RUN cd ~/.gcoin && echo "txindex=1\nport=5566\n" > gcoin.conf

ADD / /web/

RUN cd web && npm install && gcoind -daemon -reindex

RUN cd / && echo "#!/bin/bash\n if [ \$node ];then\n echo addnode=\$node >> ~/.gcoin/gcoin.conf\n fi\n gcoind -daemon\n gcoin-cli setgenerate true\n service mongodb start\n cd web && node app.js" > bootstrap.sh

CMD ["sh","bootstrap.sh"]