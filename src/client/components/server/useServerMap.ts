import { useSocket, useSocketSubscribeData } from '@/api/socketio';
import { ServerStatusInfo } from '../../../types';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';

export function useServerMap(): Record<string, ServerStatusInfo> {
  const { socket } = useSocket();
  const serverMap = useSocketSubscribeData<Record<string, ServerStatusInfo>>(
    'onServerStatusUpdate',
    {}
  );

  /**
   * Auto reconnect when reconnect
   */
  useVisibilityChange((visibility) => {
    if (visibility && socket?.disconnected === true) {
      socket.connect();
    }
  });

  return serverMap;
}
