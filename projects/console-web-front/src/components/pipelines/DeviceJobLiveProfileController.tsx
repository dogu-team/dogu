import { RoutineDeviceJobBase, RuntimeInfoResponse } from '@dogu-private/console';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import useWebSocket from '../../hooks/useWebSocket';
import { isPipelineInProgress } from '../../utils/pipeline';
import RuntimeProfiles from './RuntimeProfiles';

interface Props {
  deviceJob: RoutineDeviceJobBase;
}

const DeviceJobLiveProfileController = ({ deviceJob }: Props) => {
  const router = useRouter();
  const [liveProfiles, setLiveProfiles] = useState<RuntimeInfoResponse[]>([]);
  const profileWebsocketRef = useWebSocket(
    isPipelineInProgress(deviceJob.status)
      ? `/ws/live-profile?organization=${router.query.orgId}&project=${router.query.pid}&pipeline=${router.query.pipelineId}&job=${deviceJob.routineJobId}&deviceJob=${deviceJob.routineDeviceJobId}`
      : null,
  );

  useEffect(() => {
    setLiveProfiles([]);
    if (profileWebsocketRef.current) {
      profileWebsocketRef.current.onmessage = (e) => {
        const data: RuntimeInfoResponse = JSON.parse(e.data);
        setLiveProfiles((prev) => [...prev, data]);
      };
    }

    return () => {
      if (profileWebsocketRef.current) {
        profileWebsocketRef.current.close();
      }
    };
  }, [deviceJob.routineDeviceJobId]);

  const data: RuntimeInfoResponse = {
    deviceRuntimeInfos: liveProfiles.map((profile) => profile.deviceRuntimeInfos).flat(),
    gameRuntimeInfos: liveProfiles.map((profile) => profile.gameRuntimeInfos).flat(),
  };

  return <RuntimeProfiles profileData={data} startedAt={deviceJob.inProgressAt ? new Date(deviceJob.inProgressAt) : new Date()} endedAt={new Date()} />;
};

export default DeviceJobLiveProfileController;
