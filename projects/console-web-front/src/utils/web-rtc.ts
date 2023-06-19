import { PrivateProtocol } from '@dogu-private/types';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;
const DataChannelLabel = PrivateProtocol.DataChannelLabel;

export const createDataChannel = (pc: RTCPeerConnection, label: DataChannelLabel, options?: RTCDataChannelInit): RTCDataChannel => {
  return pc.createDataChannel(JSON.stringify(DataChannelLabel.toJSON(label)), options);
};
