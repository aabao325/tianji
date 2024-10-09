import { useEvent } from '@/hooks/useEvent';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { LuCopy, LuCopyCheck } from 'react-icons/lu';
import { toast } from 'sonner';
import { useTranslation } from '@i18next-toolkit/react';

export const CodeBlock: React.FC<{
  code: string;
  height?: number;
}> = React.memo((props) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = useEvent(() => {
    window.navigator.clipboard.writeText(props.code);

    toast(t('Copied into clipboard!'));

    setCopied(true);
  });

  return (
    <div className="group relative w-full overflow-auto">
      <pre
        className="rounded-sm border border-zinc-200 bg-zinc-100 p-3 pr-12 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        style={{
          maxHeight: props.height || 384,
        }}
      >
        <code>{props.code}</code>
      </pre>
      <Button
        className="absolute right-1 top-1 bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-opacity-50"
        variant="outline"
        size="icon"
        Icon={copied ? LuCopyCheck : LuCopy}
        onClick={handleCopy}
      />
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';
