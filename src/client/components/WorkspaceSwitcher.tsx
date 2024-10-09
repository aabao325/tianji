import React, { useState } from 'react';
import { cn } from '@/utils/style';
import {
  changeUserCurrentWorkspace,
  setUserInfo,
  useCurrentWorkspace,
  useCurrentWorkspaceSafe,
  useUserInfo,
} from '@/store/user';
import { LuPlusCircle } from 'react-icons/lu';
import { useTranslation } from '@i18next-toolkit/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useEvent, useEventWithLoading } from '@/hooks/useEvent';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { trpc } from '@/api/trpc';
import { showErrorToast } from '@/utils/error';
import { first, upperCase } from 'lodash-es';
import { Empty } from 'antd';

interface WorkspaceSwitcherProps {
  isCollapsed: boolean;
}
export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = React.memo(
  (props) => {
    const userInfo = useUserInfo();
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const currentWorkspace = useCurrentWorkspaceSafe();
    const createWorkspaceMutation = trpc.workspace.create.useMutation({
      onSuccess: (userInfo) => {
        setUserInfo(userInfo);
      },
    });
    const switchWorkspaceMutation = trpc.workspace.switch.useMutation({
      onSuccess: (userInfo) => {
        setUserInfo(userInfo);
      },
    });

    const handleSwitchWorkspace = useEvent(
      async (workspace: { id: string; name: string }) => {
        setOpen(false);

        if (userInfo?.currentWorkspaceId === workspace.id) {
          return;
        }

        try {
          await switchWorkspaceMutation.mutateAsync({
            workspaceId: workspace.id,
          });
          changeUserCurrentWorkspace(workspace.id);
        } catch (err) {
          showErrorToast(err);
        }
      }
    );

    const [handleCreateNewWorkspace, isCreateLoading] = useEventWithLoading(
      async () => {
        try {
          await createWorkspaceMutation.mutateAsync({
            name: newWorkspaceName,
          });

          setShowNewWorkspaceDialog(false);
        } catch (err) {
          showErrorToast(err);
        }
      }
    );

    if (!userInfo) {
      return null;
    }

    return (
      <Dialog
        open={showNewWorkspaceDialog}
        onOpenChange={setShowNewWorkspaceDialog}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'flex w-full justify-between',
                props.isCollapsed && 'h-9 w-9 items-center justify-center p-0'
              )}
            >
              {currentWorkspace ? (
                <>
                  <Avatar
                    className={cn('h-5 w-5', props.isCollapsed ? '' : 'mr-2')}
                  >
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${currentWorkspace.name}.png`}
                      alt={currentWorkspace.name}
                      className="grayscale"
                    />
                    <AvatarFallback>
                      {upperCase(first(currentWorkspace.name))}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={cn(
                      'flex-1 overflow-hidden text-ellipsis text-left',
                      props.isCollapsed && 'hidden'
                    )}
                  >
                    {currentWorkspace.name}
                  </span>
                </>
              ) : (
                <span>{t('Select Workspace')}</span>
              )}

              <CaretSortIcon
                className={cn(
                  'ml-auto h-4 w-4 shrink-0 opacity-50',
                  props.isCollapsed && 'hidden'
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>{t('No workspace found.')}</CommandEmpty>
                <CommandGroup key="workspace" heading={t('Workspace')}>
                  {userInfo.workspaces.length === 0 && (
                    <Empty
                      imageStyle={{ width: 80, height: 80, margin: 'auto' }}
                      description={t(
                        'Not any workspace has been found, please create first'
                      )}
                    />
                  )}

                  {userInfo.workspaces.map(({ workspace }) => (
                    <CommandItem
                      key={workspace.id}
                      onSelect={() => {
                        handleSwitchWorkspace(workspace);
                      }}
                      className="text-sm"
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${workspace.name}.png`}
                          alt={workspace.name}
                          className="grayscale"
                        />
                        <AvatarFallback>
                          {upperCase(first(workspace.name))}
                        </AvatarFallback>
                      </Avatar>

                      <span
                        className="overflow-hidden text-ellipsis"
                        title={workspace.name}
                      >
                        {workspace.name}
                      </span>

                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          currentWorkspace?.id === workspace.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>

              <CommandSeparator />

              <CommandList>
                <CommandGroup key="create">
                  <DialogTrigger asChild>
                    <CommandItem
                      aria-selected="false"
                      onSelect={() => {
                        setOpen(false);
                        setShowNewWorkspaceDialog(true);
                      }}
                    >
                      <LuPlusCircle className="mr-2" size={20} />
                      {t('Create Workspace')}
                    </CommandItem>
                  </DialogTrigger>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Create Workspace')}</DialogTitle>
            <DialogDescription>
              {t('Create a new workspace to cooperate with team members.')}
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label>{t('Workspace Name')}</Label>
                <Input
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewWorkspaceDialog(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              loading={isCreateLoading}
              onClick={handleCreateNewWorkspace}
            >
              {t('Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);
WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
