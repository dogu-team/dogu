export interface UpdateProjectSlackRoutineDtoBase {
  routineId: string;
  channelId: string;
  onSuccess: number;
  onFailure: number;
}
