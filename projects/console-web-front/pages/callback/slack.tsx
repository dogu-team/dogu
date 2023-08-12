import { ConnectSlackDtoBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { connectSlack } from '../../src/api/slack';
import { getUserInServerSide } from '../../src/api/registery';
import { NextPageWithLayout } from '../_app';

interface PageProps {
  user: UserBase;
}

const SlackConnectionPage: NextPageWithLayout<PageProps> = ({ user }) => {
  const router = useRouter();
  const query = router.query as Object as ConnectSlackDtoBase;

  const userVisits = user.userVisits;
  if (!userVisits) {
    return <>Not Auth</>;
  }

  const latestVisit = userVisits[0];
  if (!latestVisit) {
    return <>Not Auth</>;
  }

  const organizationId = latestVisit.organizationId;
  if (!organizationId) {
    return <>Not Auth</>;
  }

  connectSlack(organizationId, query).then((redirectUrl) => {
    router.push(redirectUrl);
  });

  return null;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  try {
    const [user] = await Promise.all([getUserInServerSide(context)]);

    return {
      props: {
        user,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export default SlackConnectionPage;
