import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import UnifiedVideoPlayer from './UnifiedVideoPlayer';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoTitle: string;
    videoUrl?: string;
    posterUrl?: string;
}

export default function VideoModal({ isOpen, onClose, videoTitle, videoUrl, posterUrl }: VideoModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 lg:p-8">
            {/* Backdrop with high blur */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[95vw] lg:max-w-6xl aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 animate-scale-in">
                {videoUrl ? (
                    <UnifiedVideoPlayer
                        url={videoUrl}
                        title={videoTitle}
                        poster={posterUrl}
                        autoPlay={true}
                        onClose={onClose}
                        className="w-full h-full"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 text-center p-8 h-full">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <X className="w-10 h-10 text-white/20" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white text-xl font-bold">Content Not Available</h4>
                            <p className="text-white/40 max-w-xs">We're sorry, but this content is currently unavailable.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
