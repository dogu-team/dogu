import { create } from 'zustand';

export type EventName =
  // common
  | 'onDrawerItemClicked'
  | 'onRefreshClicked'

  // org
  | 'onOrganizationCreated'
  | 'onOrganizationLeft'
  | 'onOrganizationUpdated'

  // tag
  | 'onTagCreated'
  | 'onTagEdited'

  // user
  | 'onUserUpdated'

  // org users
  | 'onOrgMemberUpdated'
  | 'onOrgMemberDeleted'
  | 'onInvitationSent'
  | 'onInvitationCanceled'

  // host
  | 'onHostCreated'
  | 'onHostUpdated'
  | 'onHostDeleted'
  | 'onHostDeviceUsed'
  | 'onHostDeviceStopped'

  // device
  | 'onDeviceTagUpdated'
  | 'onDeviceAdded'
  | 'onDeviceUpdated'
  | 'onDeviceStopped'
  | 'onDeviceReboot'

  // team
  | 'onTeamCreated'
  | 'onTeamUpdated'
  | 'onTeamDeleted'
  | 'onTeamMemberAdded'
  | 'onTeamProjectAdded'
  | 'onTeamMemberDeleted'
  | 'onTeamProjectPermissionUpdated'
  | 'onTeamProjectDeleted'

  // project
  | 'onProjectCreated'
  | 'onProjectMemberAdded'
  | 'onAddDeviceToProjectModalOpened'
  | 'onAddDeviceToProjectModalClosed'
  | 'onProjectDeviceDeleted'
  | 'onProjectUpdated'

  // pipeline
  | 'onRoutineCreated'
  | 'onRoutineDeleted'
  | 'onPipelineCreated'

  // project-application
  | 'onProjectApplicationUploaded'
  | 'onProjectApplicationDeleted'

  // project-scm
  | 'onProjectScmUpdated'

  // change-log
  | 'onChangeLogReactionUpdated'

  // record
  | 'onRecordStepCreated'
  | 'onRecordStepDeleted';

interface EventStore {
  eventName: EventName | null;
  payload: Parameters<EventStore['fireEvent']>[1] | null;
  fireEvent: <T>(eventName: EventName, payload?: T) => void;
}

const useEventStore = create<EventStore>((set) => ({
  eventName: null,
  payload: null,
  fireEvent: (eventName, payload) => setTimeout(() => set({ eventName, payload: payload ?? null }), 200),
}));

export default useEventStore;
