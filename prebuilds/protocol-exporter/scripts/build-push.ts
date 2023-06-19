import shelljs from 'shelljs';
import { config } from './config';

if (shelljs.exec(`docker build --tag ${config.docker.imageName()} --platform linux/amd64 .`).code != 0) {
  shelljs.echo('Error: Docker build failed');
  shelljs.exit(1);
}

if (shelljs.exec(config.aws.loginCommand()).code != 0) {
  shelljs.echo('Error: Docker login failed');
  shelljs.exit(1);
}

if (shelljs.exec(`docker tag ${config.docker.imageName()} ${config.aws.ecr.repository()}`).code != 0) {
  shelljs.echo('Error: Docker tag failed');
  shelljs.exit(1);
}

if (shelljs.exec(`docker push ${config.aws.ecr.repository()}`).code != 0) {
  shelljs.echo('Error: Docker push failed');
  shelljs.exit(1);
}
