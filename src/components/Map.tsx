'use client';

import { Textarea } from '@/components/ui/textarea';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AngryIcon, MessageCircle, SendHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { LoginDialog } from './LoginDialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

// Fix for default icon issue with webpack
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface PotholeComment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
}

export interface Pothole {
  _id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  description?: string;
  imageUrl: string;
  upvotes: string[];
  comments: PotholeComment[];
  reportedBy?: {
    _id: string;
    name: string;
  };
}

interface MapProps {
  potholes: Pothole[];
}

const PotholePopup = ({ pothole }: { pothole: Pothole }) => {
  const { data: session } = useSession();
  const [upvotes, setUpvotes] = useState((pothole.upvotes || []).length);
  const [hasUpvoted, setHasUpvoted] = useState(
    (pothole.upvotes || []).includes(session?.user?.id || '')
  );
  const [comments, setComments] = useState<PotholeComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);

  const fetchComments = async (pageNum: number) => {
    try {
      const res = await fetch(
        `/api/potholes/${pothole._id}/comments?page=${pageNum}&limit=5`
      );
      const data = await res.json();
      if (data.success) {
        setComments((prev) =>
          pageNum === 1 ? data.data : [...prev, ...data.data]
        );
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.log('Failed to fetch comments', error);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [pothole._id]);

  const handleUpvote = async () => {
    if (!session) {
      setLoginDialogOpen(true);
      return;
    }
    try {
      const res = await fetch(`/api/potholes/${pothole._id}/upvote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setUpvotes(data.data.upvoteCount);
        setHasUpvoted(!hasUpvoted);
      }
    } catch (error) {
      console.log('Failed to upvote', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!session || !newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/potholes/${pothole._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [data.data, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.log('Failed to submit comment', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScroll = () => {
    if (commentsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        commentsContainerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
        setPage((prev) => prev + 1);
        fetchComments(page + 1);
      }
    }
  };

  return (
    <div className="flex h-full w-[360px] max-w-[360px] min-w-[360px] flex-col p-2 pt-8">
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
      <div className="relative mb-2 h-[240px] w-full overflow-hidden rounded-none">
        <Image
          src={pothole.imageUrl}
          alt={pothole.description || 'Pothole image'}
          layout="fill"
          objectFit="cover"
          unoptimized
        />
      </div>
      <p className="px-1 text-sm font-semibold">
        {pothole.description || 'A pothole report.'}
      </p>

      <div className="my-2 flex items-center space-x-4 px-1">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvote}
            disabled={!session && hasUpvoted}
          >
            <AngryIcon
              className={`h-8 w-8 ${hasUpvoted ? 'fill-red-400 stroke-black' : 'fill-gray-100 stroke-gray-900'}`}
            />
          </Button>
          <span>{upvotes}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
            onClick={() => {
              if (!session) setLoginDialogOpen(true);
            }}
          >
            <MessageCircle className="h-4 w-4 text-gray-500" />
            <span>{pothole.comments?.length || 0}</span>
          </Button>
        </div>
      </div>

      <div
        ref={commentsContainerRef}
        onScroll={handleScroll}
        className="mb-2 max-h-[180px] flex-grow space-y-2 overflow-y-auto md:max-h-[200px] md:min-h-[200px]"
      >
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="flex w-full items-start justify-start space-x-2"
          >
            <Avatar className="h-6 w-6 border-2 border-gray-200">
              <AvatarImage src={comment.user.image} alt={comment.user.name} />
              <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mb-2">
              <p className="m-0 p-0 font-semibold">{comment.user.name}</p>
              <p className="m-0 p-0 text-gray-500">{comment.text}</p>
            </div>
          </div>
        ))}
        {!hasMore && comments.length > 0 && (
          <p className="py-2 text-center text-xs text-gray-500">
            No more comments
          </p>
        )}
      </div>

      {session && (
        <div className="mt-auto flex items-start space-x-2 border-t pt-2">
          <Textarea
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewComment(e.target.value)
            }
            placeholder="Add a comment..."
            className="flex-grow resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={handleCommentSubmit}
            disabled={isSubmitting || !newComment.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

function CenterMapOnPopup() {
  const map = useMap();

  useEffect(() => {
    const handlePopupOpen = (e: L.PopupEvent) => {
      // Check for mobile screen size
      if (window.innerWidth < 768) {
        const latLng = e.popup.getLatLng();
        if (latLng) {
          map.flyTo(latLng, map.getZoom(), {
            animate: true,
            duration: 1,
          });
        }
      }
    };

    map.on('popupopen', handlePopupOpen);

    return () => {
      map.off('popupopen', handlePopupOpen);
    };
  }, [map]);

  return null;
}

const Map = ({ potholes }: MapProps) => {
  const position: LatLngExpression = [20.5937, 78.9629]; // Default center of India

  return (
    <MapContainer
      center={position}
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CenterMapOnPopup />

      {potholes.map((pothole) => (
        <Marker
          key={pothole._id}
          position={[
            pothole.location.coordinates[1],
            pothole.location.coordinates[0],
          ]}
        >
          <Popup>
            <PotholePopup pothole={pothole} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
