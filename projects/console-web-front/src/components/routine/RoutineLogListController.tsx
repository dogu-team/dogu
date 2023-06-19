export const pkTemp = 1;
// FIXME: felix
// import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
// import { PageBase, RoutineBase, RoutineLogBase } from '@dogu-private/console';
// import { OrganizationId, ProjectId } from '@dogu-private/types';
// import { List } from 'antd';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import styled from 'styled-components';
// import useSWR from 'swr';

// import { swrAuthFetcher } from '../../api';
// import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
// import { localizeDate } from '../../utils/date';
// import ProfileImage from '../ProfileImage';
// import ProfileImageWithName from '../users/ProfileImageWithName';

// interface ItemProps {
//   log: RoutineLogBase;
//   routineName: string;
// }

// const LogItem = ({ log, routineName }: ItemProps) => {
//   const router = useRouter();
//   const iconStyle = { fontSize: '.8rem', marginRight: '.25rem' };

//   return (
//     <ItemBox>
//       <div>
//         <LinkWrapper>
//           <Link href={log.configUrl} target="_blank">
//             {routineName}.yml
//           </Link>
//         </LinkWrapper>
//         <FlexRowBox>
//           <UserOutlined style={iconStyle} />
//           <ProfileImageWithName
//             profileImage={<ProfileImage size={24} profileImageUrl={log.actor.profileImageUrl} name={log.actor.name} shape="circle" style={{ fontSize: '.9rem' }} />}
//             name={<DescriptionText>{log.actor.name}</DescriptionText>}
//           />
//         </FlexRowBox>
//       </div>
//       <FlexRowBox>
//         <CalendarOutlined style={iconStyle} />
//         <DescriptionText style={{ marginLeft: '0' }}>
//           {new Intl.DateTimeFormat(router.locale, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(
//             localizeDate(new Date(log.createdAt)),
//           )}
//         </DescriptionText>
//       </FlexRowBox>
//     </ItemBox>
//   );
// };

// interface Props {
//   orgId: OrganizationId;
//   projectId: ProjectId;
//   routine: RoutineBase;
// }

// const RoutineLogListController = ({ orgId, projectId, routine }: Props) => {
//   const { data, isLoading, error } = useSWR<PageBase<RoutineLogBase>>(`/organizations/${orgId}/projects/${projectId}/routines/${routine.routineId}/logs`, swrAuthFetcher);
//   const router = useRouter();
//   const page = router.query.page;

//   return (
//     <>
//       <List<RoutineLogBase>
//         dataSource={data?.items}
//         renderItem={(item) => {
//           return <LogItem log={item} routineName={routine.name} />;
//         }}
//         loading={isLoading}
//         rowKey={(item) => `${item.routineId}${item.actorId}${item.configUrl}`}
//         pagination={{
//           defaultCurrent: 1,
//           pageSize: 10,
//           current: Number(page) || 1,
//           onChange: (p) => {
//             scrollTo(0, 0);
//             router.push({ pathname: router.pathname, query: { orgId, pid: projectId, routineId: routine.name, page: p } });
//           },
//           total: data?.totalCount,
//         }}
//       />
//     </>
//   );
// };

// export default RoutineLogListController;

// const ItemBox = styled(List.Item)`
//   ${flexRowSpaceBetweenStyle}
//   padding: 1rem;
// `;

// const FlexRowBox = styled.div`
//   ${flexRowBaseStyle}
// `;

// const LinkWrapper = styled.div`
//   margin-bottom: 0.5rem;
// `;

// const DescriptionText = styled.p`
//   font-size: 0.8rem;
//   margin-left: -0.25rem;
// `;
