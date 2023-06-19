import ErrorBox from 'src/components/common/boxes/ErrorBox';

const NoConnectionBox = () => {
  return <ErrorBox title={'No Connection'} desc={'Check your network or devices'} />;
};

export default NoConnectionBox;
