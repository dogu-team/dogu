import ErrorBox from 'src/components/common/boxes/ErrorBox';
import styled from 'styled-components';

const Box = styled.div`
  display: flex;
  height: 300px;
  padding: 24px;
  border-radius: 12px;
  background-color: #f78a77;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
`;

const Desc = styled.p`
  margin-top: 20px;
`;

const NonePermissionBox = () => {
  return (
    <ErrorBox title={'Permission Denied'} desc={'Contact to your team manager to use this menu'} />
  );
};

export default NonePermissionBox;
