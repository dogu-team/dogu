import { ProjectId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';

export const buildQueryPraramsByObject = (obj: object) => {
  const param = new URLSearchParams();
  Object.keys(obj).forEach((key) => {
    param.append(key, `${obj[key as keyof typeof obj]}`);
  });

  return param.toString();
};

export const projectPageGetServerSideProps: GetServerSideProps = async (context) => {
  const projectId = context.query.pid;

  if (!projectId) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      projectId: projectId as ProjectId,
    },
  };
};
