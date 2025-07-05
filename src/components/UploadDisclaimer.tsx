'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FileImage, ShieldCheck, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';

interface UploadDisclaimerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

const UploadDisclaimer = ({
  open,
  onOpenChange,
  onAgree,
}: UploadDisclaimerProps) => {
  const t = useTranslations('UploadDisclaimer');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[3000] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 space-y-4 text-gray-700">
          <div className="flex items-start gap-4">
            <FileImage className="h-6 w-6 shrink-0 text-sky-500" />
            <p>
              {t.rich('rule1', {
                bold: (chunks) => (
                  <strong className="font-semibold">{chunks}</strong>
                ),
              })}
            </p>
          </div>
          <div className="flex items-start gap-4">
            <UserCheck className="h-6 w-6 shrink-0 text-sky-500" />
            <p>{t('rule2')}</p>
          </div>
        </div>

        <div className="rounded-lg bg-sky-50 p-4">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 shrink-0 text-sky-600" />
            <div>
              <h4 className="font-semibold text-sky-800">
                {t('privacyAssuredTitle')}
              </h4>
              <p className="text-sm text-sky-700">
                {t('privacyAssuredContent')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onAgree} className="w-full">
            {t('agreeButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDisclaimer;
