export interface ConnectSlackDtoBase {
  authedUserId: string;
  scope: string;
  accessToken: string;
  botUserId: string;
  teamId: string;
  teamName: string;
}
