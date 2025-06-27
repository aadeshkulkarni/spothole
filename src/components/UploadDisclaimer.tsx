'use client';

import { FileImage, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[3000] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Upload Responsibly
          </DialogTitle>
          <DialogDescription>
            This platform is built by the community, for the community. Your
            responsible uploads help everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 space-y-4 text-gray-700">
          <div className="flex items-start gap-4">
            <FileImage className="h-6 w-6 shrink-0 text-sky-500" />
            <p>
              Please upload{' '}
              <strong className="font-semibold">
                clear photos of potholes only
              </strong>
              . No NSFW, offensive, or unrelated content.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <UserCheck className="h-6 w-6 shrink-0 text-sky-500" />
            <p>
              Avoid personal information like faces, license plates, or house
              numbers.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-sky-50 p-4">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 shrink-0 text-sky-600" />
            <div>
              <h4 className="font-semibold text-sky-800">
                Your Privacy is Assured
              </h4>
              <p className="text-sm text-sky-700">
                All location data and personal metadata are automatically
                stripped from images. Your uploads are completely anonymous.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onAgree} className="w-full">
            I understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDisclaimer;
