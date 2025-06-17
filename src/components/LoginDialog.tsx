'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRightIcon, MapPinCheckInsideIcon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const LoginDialog = ({ isOpen, onOpenChange }: LoginDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center">
          <MapPinCheckInsideIcon className="h-16 w-16 text-blue-800 fill-blue-800 stroke-white" />
          <DialogTitle className="text-center text-2xl font-bold">
            Like this? You'll love <strong className="text-blue-800">SpotHole</strong>
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign up to upvote, reply and more.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => signIn('google')}
          >
            <Image
              src="/google-logo.svg"
              alt="Google Logo"
              width={20}
              height={20}
              className="mr-2"
            />
            Continue with Google
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
