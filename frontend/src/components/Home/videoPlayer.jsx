import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    Maximize,
    Minimize,
    SkipForward as NextIcon,
} from "lucide-react";

// ==========================================
// VideoPlayer
//
// Self-contained YouTube-style player: custom controls,
// keyboard shortcuts, and smooth transitions on the control
// bar / play-state overlay.
//
// Keyboard shortcuts (active while the player has focus,
// or globally if the user isn't typing in an input):
//   Space / K   → play / pause
//   J / ←       → seek back 10s
//   L / →       → seek forward 10s
//   ↑ / ↓       → volume up / down
//   M           → mute / unmute
//   F           → fullscreen toggle
//   N           → next video (if onNext is provided)
// ==========================================

const VideoPlayer = ({ videoFile, thumbnail, onNext, hasNext = false }) => {

    const containerRef = useRef(null);
    const videoRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Brief center "flash" icon on keyboard actions, like YouTube
    // (play/pause, +10/-10, mute) — pure visual feedback.
    const [flashIcon, setFlashIcon] = useState(null);
    const flashTimeoutRef = useRef(null);

    const showFlash = useCallback((icon) => {
        setFlashIcon(icon);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setFlashIcon(null), 500);
    }, []);


    // ==========================================
    // Core actions (reused by both buttons + keyboard)
    // ==========================================

    const togglePlay = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;

        if (vid.paused) {
            vid.play();
            showFlash("play");
        } else {
            vid.pause();
            showFlash("pause");
        }
    }, [showFlash]);

    const seekBy = useCallback((delta) => {
        const vid = videoRef.current;
        if (!vid) return;

        vid.currentTime = Math.min(
            Math.max(0, vid.currentTime + delta),
            vid.duration || Infinity
        );

        showFlash(delta > 0 ? "forward" : "backward");
    }, [showFlash]);

    const toggleMute = useCallback(() => {
        const vid = videoRef.current;
        if (!vid) return;

        vid.muted = !vid.muted;
        setIsMuted(vid.muted);
        showFlash(vid.muted ? "muted" : "unmuted");
    }, [showFlash]);

    const changeVolume = useCallback((delta) => {
        const vid = videoRef.current;
        if (!vid) return;

        const next = Math.min(Math.max(0, vid.volume + delta), 1);
        vid.volume = next;
        vid.muted = next === 0;
        setVolume(next);
        setIsMuted(next === 0);
    }, []);

    const toggleFullScreen = useCallback(() => {
        if (!containerRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    }, []);


    // ==========================================
    // Keyboard shortcuts
    // ==========================================

    useEffect(() => {

        const handleKeyDown = (e) => {
            // Don't hijack keys while the user is typing somewhere
            // (comment box, edit field, etc.)
            const tag = document.activeElement?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    break;

                case "j":
                case "arrowleft":
                    e.preventDefault();
                    seekBy(-10);
                    break;

                case "l":
                case "arrowright":
                    e.preventDefault();
                    seekBy(10);
                    break;

                case "arrowup":
                    e.preventDefault();
                    changeVolume(0.1);
                    break;

                case "arrowdown":
                    e.preventDefault();
                    changeVolume(-0.1);
                    break;

                case "m":
                    e.preventDefault();
                    toggleMute();
                    break;

                case "f":
                    e.preventDefault();
                    toggleFullScreen();
                    break;

                case "n":
                    if (hasNext && onNext) {
                        e.preventDefault();
                        onNext();
                    }
                    break;

                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [togglePlay, seekBy, changeVolume, toggleMute, toggleFullScreen, hasNext, onNext]);


    // ==========================================
    // Fullscreen change listener (keeps icon in sync
    // if user exits via Esc rather than the button)
    // ==========================================

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullScreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFsChange);
        return () => document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);


    // ==========================================
    // Auto-advance to next video when this one ends
    // ==========================================

    const handleEnded = () => {
        setIsPlaying(false);
        if (hasNext && onNext) {
            onNext();
        }
    };


    const flashLabel = {
        play: <Play size={34} fill="white" />,
        pause: <Pause size={34} fill="white" />,
        forward: <SkipForward size={30} fill="white" />,
        backward: <SkipBack size={30} fill="white" />,
        muted: <VolumeX size={30} />,
        unmuted: <Volume2 size={30} />,
    };


    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
        >

            <video
                ref={videoRef}
                src={videoFile}
                poster={thumbnail}
                className="w-full h-full object-contain transition-opacity duration-300"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleEnded}
                onVolumeChange={(e) => {
                    const vid = e.target;
                    setIsMuted(vid.muted);
                    setVolume(vid.volume);
                }}
                onTimeUpdate={(e) => {
                    const vid = e.target;
                    setCurrentTime(vid.currentTime);
                    setProgress((vid.currentTime / vid.duration) * 100);
                }}
                onLoadedMetadata={(e) => {
                    setDuration(e.target.duration);
                }}
                onSeeking={() => {
                    if (!videoRef.current) return;
                    setProgress(
                        (videoRef.current.currentTime / videoRef.current.duration) * 100
                    );
                }}
            />

            {/* Center flash icon — fades in/out on keyboard actions */}
            <div
                className={`
                    pointer-events-none
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                `}
            >
                <div
                    className={`
                        bg-black/60
                        rounded-full
                        p-5
                        text-white
                        transition-all
                        duration-300
                        ${flashIcon
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-75"
                        }
                    `}
                >
                    {flashIcon && flashLabel[flashIcon]}
                </div>
            </div>

            {/* Custom Video Controls */}
            <div
                className={`
                    absolute
                    bottom-0
                    left-0
                    right-0
                    bg-gradient-to-t
                    from-black/80
                    to-transparent
                    p-4
                    flex
                    items-center
                    gap-3
                    text-white
                    transition-all
                    duration-300
                    ease-out
                    ${isPlaying
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    }
                `}
            >
                {/* Play / Pause */}
                <button
                    type="button"
                    onClick={togglePlay}
                    className="hover:text-gray-300 hover:scale-110 transition duration-150"
                    title="Play/Pause (Space)"
                >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                </button>

                {/* Skip Backward 10s */}
                <button
                    type="button"
                    onClick={() => seekBy(-10)}
                    className="hover:text-gray-300 hover:scale-110 transition duration-150 flex items-center"
                    title="Back 10s (J / ←)"
                >
                    <SkipBack size={20} />
                    <span className="text-xs ml-1">10</span>
                </button>

                {/* Skip Forward 10s */}
                <button
                    type="button"
                    onClick={() => seekBy(10)}
                    className="hover:text-gray-300 hover:scale-110 transition duration-150 flex items-center"
                    title="Forward 10s (L / →)"
                >
                    <SkipForward size={20} />
                    <span className="text-xs ml-1">10</span>
                </button>

                {/* Next video */}
                {hasNext && onNext && (
                    <button
                        type="button"
                        onClick={onNext}
                        className="hover:text-gray-300 hover:scale-110 transition duration-150"
                        title="Next video (N)"
                    >
                        <NextIcon size={20} />
                    </button>
                )}

                {/* Progress Bar */}
                <div
                    className="flex-1 h-1 hover:h-1.5 bg-gray-600 rounded-full cursor-pointer relative transition-all duration-150"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        if (videoRef.current) {
                            videoRef.current.currentTime = percent * videoRef.current.duration;
                        }
                    }}
                >
                    <div
                        className="h-full bg-red-500 rounded-full transition-[width] duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Time */}
                <span className="text-xs text-gray-300 min-w-[90px]">
                    {Math.floor(currentTime / 60)}:
                    {Math.floor(currentTime % 60).toString().padStart(2, "0")}
                    {" / "}
                    {Math.floor(duration / 60)}:
                    {Math.floor(duration % 60).toString().padStart(2, "0")}
                </span>

                {/* Mute */}
                <button
                    type="button"
                    onClick={toggleMute}
                    className="hover:text-gray-300 hover:scale-110 transition duration-150"
                    title="Mute (M)"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Volume Slider */}
                <div className="relative w-16 h-1 bg-gray-600 rounded-full cursor-pointer">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                            const vol = parseFloat(e.target.value);
                            setVolume(vol);
                            if (videoRef.current) {
                                videoRef.current.volume = vol;
                                videoRef.current.muted = vol === 0;
                                setIsMuted(vol === 0);
                            }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="h-full bg-red-500 rounded-full transition-[width] duration-100"
                        style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                </div>

                {/* Fullscreen */}
                <button
                    type="button"
                    onClick={toggleFullScreen}
                    className="hover:text-gray-300 hover:scale-110 transition duration-150"
                    title="Fullscreen (F)"
                >
                    {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
            </div>

        </div>
    );
};

export default VideoPlayer;