'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AngryIcon } from 'lucide-react';

import { signIn, signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const ReportForm = dynamic(
  () => import('./ReportForm').then((mod) => mod.ReportForm),
  {
    ssr: false,
    loading: () => (
      <DialogHeader>
        <DialogTitle className="sr-only">Loading Form</DialogTitle>
        <div className="flex h-[550px] items-center justify-center">
          <p>Loading...</p>
        </div>
      </DialogHeader>
    ),
  }
);

interface HeaderProps {
  onReportSubmitted: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

const Header = ({
  onReportSubmitted,
  isModalOpen,
  setIsModalOpen,
}: HeaderProps) => {
  const { data: session, status } = useSession();

  const handleReportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status === 'unauthenticated') {
      e.preventDefault();
      signIn('google', {
        callbackUrl: `${window.location.pathname}?openReportDialog=true`,
      });
    }
  };

  return (
    <header className="absolute top-0 right-0 left-0 z-10 bg-white/70 shadow-xl backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-end justify-end gap-2">
            <a href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-sky-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                Spothole
              </h1>
            </a>
          </div>
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <Button variant="outline">Loading...</Button>
            ) : (
              <>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleReportClick}>
                      <AngryIcon className="h-5 w-5" />
                      Report Pothole
                    </Button>
                  </DialogTrigger>
                  <ReportForm
                    onReportSubmitted={() => {
                      onReportSubmitted();
                      setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                  />
                </Dialog>

                {session && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Avatar className="border border-gray-600">
                        <AvatarImage src={session.user?.image ?? undefined} />
                        <AvatarFallback>
                          {session.user?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => signOut()}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
