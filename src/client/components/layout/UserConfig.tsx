import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useEvent } from '@/hooks/useEvent';
import { useSettingsStore } from '@/store/settings';
import {
  setUserInfo,
  useCurrentWorkspace,
  useCurrentWorkspaceId,
  useUserInfo,
  useUserStore,
} from '@/store/user';
import { languages } from '@/utils/constants';
import { useTranslation, setLanguage } from '@i18next-toolkit/react';
import { useNavigate } from '@tanstack/react-router';
import { version } from '@/utils/env';
import React from 'react';
import { LuMoreVertical } from 'react-icons/lu';
import { trpc } from '@/api/trpc';
import { useSocketConnected } from '@/api/socketio';
import { cn } from '@/utils/style';

interface UserConfigProps {
  isCollapsed: boolean;
}
export const UserConfig: React.FC<UserConfigProps> = React.memo((props) => {
  const userInfo = useUserInfo();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const workspaceId = useCurrentWorkspaceId();
  const currentWorkspace = useCurrentWorkspace();
  const workspaces = useUserStore((state) => {
    const userInfo = state.info;
    if (userInfo) {
      return userInfo.workspaces.map((w) => ({
        id: w.workspace.id,
        name: w.workspace.name,
        role: w.role,
        current: currentWorkspace.id === w.workspace.id,
      }));
    }

    return [];
  });
  const switchWorkspaceMutation = trpc.workspace.switch.useMutation({
    onSuccess: (userInfo) => {
      setUserInfo(userInfo);
    },
  });
  const socketConnected = useSocketConnected();

  const handleChangeColorSchema = useEvent((colorScheme) => {
    useSettingsStore.setState({
      colorScheme,
    });
  });

  const nickname = userInfo?.nickname ?? userInfo?.username ?? '';

  const avatar = (
    <div className="relative">
      <Avatar size={props.isCollapsed ? 'sm' : 'default'}>
        {userInfo?.avatar && <AvatarImage src={userInfo.avatar} />}

        <AvatarFallback delayMs={userInfo?.avatar ? undefined : 0}>
          {nickname.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white border-opacity-50',
          socketConnected ? 'bg-green-400' : 'bg-gray-400'
        )}
      />
    </div>
  );

  const name = (
    <div className="flex-1 overflow-hidden text-ellipsis" title={nickname}>
      {nickname}
    </div>
  );

  const more = (
    <Button variant="outline" size="icon" className="shrink-0">
      <LuMoreVertical />
    </Button>
  );

  return (
    <div className="flex items-center gap-2 p-2">
      <DropdownMenu>
        {props.isCollapsed ? (
          <>
            <DropdownMenuTrigger asChild={true} className="cursor-pointer">
              {avatar}
            </DropdownMenuTrigger>
          </>
        ) : (
          <>
            {avatar}

            {name}

            <DropdownMenuTrigger asChild={true} className="cursor-pointer">
              {more}
            </DropdownMenuTrigger>
          </>
        )}

        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: '/settings/profile',
              })
            }
          >
            {t('Profile')}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              navigate({
                to: '/settings/notifications',
              })
            }
          >
            {t('Notifications')}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t('Workspaces')}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={workspaceId}>
                  {workspaces.map((workspace) => (
                    <DropdownMenuRadioItem
                      key={workspace.id}
                      value={workspace.id}
                      disabled={workspace.id === workspaceId}
                      onSelect={() =>
                        switchWorkspaceMutation.mutateAsync({
                          workspaceId: workspace.id,
                        })
                      }
                    >
                      {workspace.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t('Language')}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={i18n.language ?? 'en'}
                  onValueChange={setLanguage}
                >
                  {languages.map((language) => (
                    <DropdownMenuRadioItem
                      key={language.key}
                      value={language.key}
                    >
                      {language.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t('Theme')}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={colorScheme}
                  onValueChange={handleChangeColorSchema}
                >
                  <DropdownMenuRadioItem value={'dark'}>
                    {t('Dark')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'light'}>
                    {t('Light')}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => window.open('https://tianji.msgbyte.com/docs/intro')}
          >
            {t('Document')}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t('Community')}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => window.open('https://discord.gg/8Vv47wAEej')}
                >
                  {t('Join Discord')}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => window.open('https://twitter.com/moonrailgun')}
                >
                  {t('Follow Twitter')}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuLabel className="text-muted-foreground dark:text-muted">
            v{version}
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
UserConfig.displayName = 'UserConfig';
