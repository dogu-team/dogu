export const config = {
  aws: {
    region: 'ap-northeast-2',
    accountId: '910027912039',
    address: (): string => `${config.aws.accountId}.dkr.ecr.${config.aws.region}.amazonaws.com`,
    loginCommand: (): string => `aws ecr get-login-password --region ${config.aws.region} | docker login --username AWS --password-stdin ${config.aws.address()}`,
    ecr: {
      repository: (): string => `${config.aws.address()}/${config.docker.containerName}`,
    },
  },
  docker: {
    imageName: (): string => `${config.aws.ecr.repository()}:latest`,
    containerName: 'protocol-exporter',
  },
};
