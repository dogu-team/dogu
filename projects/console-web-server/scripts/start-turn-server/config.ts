export const config = {
  containerName: 'dogu-coturn',
  imageName: 'coturn/coturn:4.5.2',
  userName: 'admin',
  password: 'dogutech',
  port: 3478,
  realm: 'localhost',
};

console.log('config', config);
