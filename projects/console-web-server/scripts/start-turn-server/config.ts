export const config = {
  containerName: 'dogu-coturn',
  imageName: 'coturn/coturn:4.5.2',
  userName: 'admin',
  password: 'dogutech',
  port: 3478,
  realm: '127.0.0.1',
};

console.log('config', config);
