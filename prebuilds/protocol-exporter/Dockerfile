
FROM golang:1.18.4-bullseye as GoBuilder
RUN apt-get update -y \
    && apt-get upgrade -y \
    && apt-get dist-upgrade -y \
    && apt-get -y autoremove \
    && apt-get clean \
    && apt-get install -y unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/go
RUN go install -v google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 \
    && go install -v google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2 

WORKDIR /app/protoc
RUN curl --location --output protoc.zip https://github.com/protocolbuffers/protobuf/releases/download/v21.7/protoc-21.7-linux-x86_64.zip \
    && unzip protoc.zip -d . \
    && rm -f protoc.zip 


FROM node:16.16-bullseye as NodeBuilder
WORKDIR /app/node
RUN npm init --yes \
    && npm install @grpc/grpc-js @grpc/proto-loader ts-proto@1.130.0 


FROM swift:5.7 as SwiftBuilder
RUN apt-get update -y \
    && apt-get upgrade -y \
    && apt-get dist-upgrade -y \
    && apt-get -y autoremove \
    && apt-get clean \
    && apt-get install -y unzip  curl make \
    && apt-get install -y git libncurses5 clang libcurl4 libpython2.7 libpython2.7-dev libxml2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/swift
RUN git clone https://github.com/grpc/grpc-swift.git \
    && cd grpc-swift \
    && git checkout tags/1.11.0 \
    && make plugins 


# RUNNING
FROM swift:5.7

RUN rm $HOME/.bashrc
COPY --from=GoBuilder /app/go /app/go
COPY --from=GoBuilder /go/bin /go/bin
COPY --from=GoBuilder /app/protoc /app/protoc
RUN echo 'export PATH=/go/bin:$PATH' >> $HOME/.bashrc
RUN echo 'export PATH=/app/protoc/bin:$PATH' >> $HOME/.bashrc

COPY --from=NodeBuilder /app/node/node_modules/ /app/node/node_modules/
COPY --from=NodeBuilder /usr/local/bin/node /usr/local/bin/node
RUN echo 'export PATH=/app/node/node_modules/.bin:$PATH' >> $HOME/.bashrc

COPY --from=SwiftBuilder /app/swift/grpc-swift /app/swift/grpc-swift
RUN echo 'export PATH=/app/swift/grpc-swift:$PATH' >> $HOME/.bashrc

WORKDIR /app/host
