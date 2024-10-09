import { trpc } from '@/api/trpc';
import { CommonHeader } from '@/components/CommonHeader';
import { CommonList } from '@/components/CommonList';
import { CommonWrapper } from '@/components/CommonWrapper';
import { Button } from '@/components/ui/button';
import { useDataReady } from '@/hooks/useDataReady';
import { useEvent } from '@/hooks/useEvent';
import { Layout } from '@/components/layout';
import { useCurrentWorkspaceId, useHasAdminPermission } from '@/store/user';
import { routeAuthBeforeLoad } from '@/utils/route';
import { cn } from '@/utils/style';
import { Trans, useTranslation } from '@i18next-toolkit/react';
import {
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { LuPlus } from 'react-icons/lu';

export const Route = createFileRoute('/telemetry')({
  beforeLoad: routeAuthBeforeLoad,
  component: TelemetryComponent,
});

function TelemetryComponent() {
  const workspaceId = useCurrentWorkspaceId();
  const { t } = useTranslation();
  const { data = [], isLoading } = trpc.telemetry.all.useQuery({
    workspaceId,
  });
  const { data: allEventCount = {} } = trpc.telemetry.allEventCount.useQuery({
    workspaceId,
  });
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const hasAdminPermission = useHasAdminPermission();

  const items = data.map((item) => ({
    id: item.id,
    title: item.name,
    number: allEventCount[item.id] ?? 0,
    href: `/telemetry/${item.id}`,
  }));

  useDataReady(
    () => data.length > 0,
    () => {
      if (pathname === Route.fullPath) {
        navigate({
          to: '/telemetry/$telemetryId',
          params: {
            telemetryId: data[0].id,
          },
        });
      }
    }
  );

  const handleClickAdd = useEvent(() => {
    navigate({
      to: '/telemetry/add',
    });
  });

  return (
    <Layout
      list={
        <CommonWrapper
          header={
            <CommonHeader
              title={t('Telemetry')}
              tip={
                <div className="space-y-2">
                  <p>
                    <Trans>
                      Telemetry is a technology that reports access data even on
                      pages that are not under your control. As long as the
                      other website allows the insertion of third-party images
                      (e.g., forums, blogs, and various rich-text editors), then
                      the data can be collected and used to analyze the images
                      when they are loaded by the user.
                    </Trans>
                  </p>

                  <p>
                    <Trans>
                      Generally, we will use a one-pixel blank image so that it
                      will not affect the user's normal use.
                    </Trans>
                  </p>

                  <p>
                    <Trans>
                      At the same time, we can also use it in some client-side
                      application scenarios, such as collecting the frequency of
                      cli usage, such as collecting the installation of
                      selfhosted apps, and so on.
                    </Trans>
                  </p>
                </div>
              }
              actions={
                <>
                  {hasAdminPermission && (
                    <Button
                      className={cn(
                        pathname === '/telemetry/add' && '!bg-muted'
                      )}
                      variant="outline"
                      Icon={LuPlus}
                      onClick={handleClickAdd}
                    >
                      {t('Add')}
                    </Button>
                  )}
                </>
              }
            />
          }
        >
          <CommonList
            hasSearch={true}
            items={items}
            isLoading={isLoading}
            emptyDescription={t(
              'Not any telemetry yet, telemetry is a useful way to track your post in others website which allow insert your own image.'
            )}
          />
        </CommonWrapper>
      }
    />
  );
}
