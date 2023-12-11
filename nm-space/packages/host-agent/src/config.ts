export const config = {
  host: {
    connect: {
      retry: {
        count: 3,
        intervalMilliseconds: 2000,
      },
    },
    reconnect: {
      intervalMilliseconds: 5000,
    },
    heartbeat: {
      retry: {
        count: 3,
        intervalMilliseconds: 1000,
      },
      intervalMilliseconds: 3000,
    },
  },
  device: {
    connectionSubscriber: {
      reconnect: {
        intervalMilliseconds: 3000,
      },
    },
    heartbeat: {
      intervalMilliseconds: 3000,
    },
    message: {
      pull: {
        intervalMilliseconds: 500,
        count: 10,
      },
    },
  },
  deviceJob: {
    heartbeat: {
      intervalMilliseconds: 3000,
    },
  },
};
