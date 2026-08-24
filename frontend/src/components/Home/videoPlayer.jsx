import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
} from "react";

import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    Maximize2,
    Minimize2,
    Captions,
    Settings,
    PictureInPicture2,
    Loader2,
    RotateCcw,
} from "lucide-react";

const PLAYBACK_SPEEDS = [
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2,
];

const VideoPlayer = ({
    videoFile,
    thumbnail,
    onNext,
    hasNext = false,
}) => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const settingsRef = useRef(null);
    const flashTimeoutRef = useRef(null);

    // ==========================================
    // Player states
    // ==========================================

    const [isPlaying, setIsPlaying] = useState(true);

    const [isMuted, setIsMuted] = useState(false);

    const [volume, setVolume] = useState(1);

    const [progress, setProgress] = useState(0);

    const [bufferedPercent, setBufferedPercent] =
        useState(0);

    const [currentTime, setCurrentTime] =
        useState(0);

    const [duration, setDuration] = useState(0);

    const [isFullScreen, setIsFullScreen] =
        useState(false);

    const [isBuffering, setIsBuffering] =
        useState(false);

    // ==========================================
    // Settings states
    // ==========================================

    const [captionsOn, setCaptionsOn] =
        useState(false);

  
    const [playbackSpeed, setPlaybackSpeed] =
        useState(1);

    const [isSettingsOpen, setIsSettingsOpen] =
        useState(false);

    // ==========================================
    // Replay state
    // ==========================================

    const [showReplay, setShowReplay] =
        useState(false);

    // ==========================================
    // Flash icon
    // ==========================================

    const [flashIcon, setFlashIcon] =
        useState(null);

    const showFlash = useCallback((icon) => {
        setFlashIcon(icon);

        if (flashTimeoutRef.current) {
            clearTimeout(
                flashTimeoutRef.current
            );
        }

        flashTimeoutRef.current =
            setTimeout(() => {
                setFlashIcon(null);
            }, 500);
    }, []);

    // ==========================================
    // Play / Pause
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

    // ==========================================
    // Seek
    // ==========================================

    const seekBy = useCallback(
        (delta) => {
            const vid = videoRef.current;

            if (!vid) return;

            vid.currentTime = Math.min(
                Math.max(
                    0,
                    vid.currentTime + delta
                ),
                vid.duration || Infinity
            );

            showFlash(
                delta > 0
                    ? "forward"
                    : "backward"
            );
        },
        [showFlash]
    );

    // ==========================================
    // Mute
    // ==========================================

    const toggleMute = useCallback(() => {
        const vid = videoRef.current;

        if (!vid) return;

        vid.muted = !vid.muted;

        setIsMuted(vid.muted);

        showFlash(
            vid.muted
                ? "muted"
                : "unmuted"
        );
    }, [showFlash]);

    // ==========================================
    // Volume
    // ==========================================

    const changeVolume = useCallback(
        (delta) => {
            const vid = videoRef.current;

            if (!vid) return;

            const next = Math.min(
                Math.max(
                    0,
                    vid.volume + delta
                ),
                1
            );

            vid.volume = next;

            vid.muted = next === 0;

            setVolume(next);

            setIsMuted(next === 0);
        },
        []
    );

    // ==========================================
    // Fullscreen
    // ==========================================

    const toggleFullScreen =
        useCallback(() => {
            if (!containerRef.current)
                return;

            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }, []);

    // ==========================================
    // Picture in Picture
    // ==========================================

    const togglePictureInPicture =
        useCallback(async () => {
            const vid = videoRef.current;

            if (!vid) return;

            try {
                if (
                    document.pictureInPictureElement
                ) {
                    await document.exitPictureInPicture();
                } else if (
                    document.pictureInPictureEnabled
                ) {
                    await vid.requestPictureInPicture();
                }
            } catch (err) {

            }
        }, []);

    // ==========================================
    // Playback speed
    // ==========================================

    const changePlaybackSpeed =
        useCallback((speed) => {
            const vid = videoRef.current;

            if (!vid) return;

            vid.playbackRate = speed;

            setPlaybackSpeed(speed);

            setIsSettingsOpen(false);
        }, []);

    // ==========================================
    // Captions
    // ==========================================

    const toggleCaptions =
        useCallback(() => {
            const vid = videoRef.current;

            const next = !captionsOn;

            setCaptionsOn(next);

            if (vid?.textTracks?.length) {
                Array.from(
                    vid.textTracks
                ).forEach((track) => {
                    track.mode = next
                        ? "showing"
                        : "hidden";
                });
            }
        }, [captionsOn]);

    // ==========================================
    // Replay current video
    // ==========================================

    const handleReplay = useCallback(() => {
        const vid = videoRef.current;

        if (!vid) return;

        vid.currentTime = 0;

        setCurrentTime(0);

        setProgress(0);

        setShowReplay(false);

        vid.play().catch((err) => {

        });
    }, []);

    // ==========================================
    // Next video
    // ==========================================

    const handleNext = useCallback(() => {
        if (!hasNext || !onNext) {
            return;
        }

        setShowReplay(false);

        setIsPlaying(false);

        onNext();
    }, [hasNext, onNext]);

    // ==========================================
    // Video ended
    // ==========================================

    const handleEnded = useCallback(() => {
        setIsPlaying(false);

        setShowReplay(true);
    }, []);

    // ==========================================
    // Keyboard shortcuts
    // ==========================================

    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag =
                document.activeElement?.tagName;

            if (
                tag === "INPUT" ||
                tag === "TEXTAREA"
            ) {
                return;
            }

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

                case "i":
                    e.preventDefault();

                    togglePictureInPicture();

                    break;

                case "c":
                    e.preventDefault();

                    toggleCaptions();

                    break;

                case "n":
                    if (
                        hasNext &&
                        onNext
                    ) {
                        e.preventDefault();

                        handleNext();
                    }

                    break;

                default:
                    break;
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        togglePlay,
        seekBy,
        changeVolume,
        toggleMute,
        toggleFullScreen,
        togglePictureInPicture,
        toggleCaptions,
        hasNext,
        onNext,
        handleNext,
    ]);

    // ==========================================
    // Fullscreen change
    // ==========================================

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullScreen(
                Boolean(
                    document.fullscreenElement
                )
            );
        };

        document.addEventListener(
            "fullscreenchange",
            handleFsChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFsChange
            );
        };
    }, []);

    // ==========================================
    // Settings outside click
    // ==========================================

    useEffect(() => {
        if (!isSettingsOpen) return;

        const handleClickOutside = (e) => {
            if (
                settingsRef.current &&
                !settingsRef.current.contains(
                    e.target
                )
            ) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [isSettingsOpen]);

    // ==========================================
    // Reset player when video changes
    // ==========================================

    useEffect(() => {
        setShowReplay(false);

        setCurrentTime(0);

        setProgress(0);

        setDuration(0);

        setBufferedPercent(0);

        setIsPlaying(false);

        setIsBuffering(false);

        setFlashIcon(null);

        /*
         * React may keep the same <video>
         * element when src changes.
         *
         * Force it to load the new video.
         */
        const vid = videoRef.current;

        if (vid) {
            vid.load();

            vid.playbackRate =
                playbackSpeed;
        }
    }, [videoFile, thumbnail, playbackSpeed]);

    // ==========================================
    // Buffered progress
    // ==========================================

    const updateBuffered =
        useCallback(() => {
            const vid = videoRef.current;

            if (
                !vid ||
                !vid.duration
            ) {
                return;
            }

            const buffered =
                vid.buffered;

            if (buffered.length > 0) {
                const end =
                    buffered.end(
                        buffered.length - 1
                    );

                setBufferedPercent(
                    (end /
                        vid.duration) *
                    100
                );
            }
        }, []);

    // ==========================================
    // Flash icons
    // ==========================================

    const flashLabel = {
        play: (
            <Play
                size={34}
                fill="white"
            />
        ),

        pause: (
            <Pause
                size={34}
                fill="white"
            />
        ),

        forward: (
            <SkipForward
                size={30}
                fill="white"
            />
        ),

        backward: (
            <SkipBack
                size={30}
                fill="white"
            />
        ),

        muted: (
            <VolumeX size={30} />
        ),

        unmuted: (
            <Volume2 size={30} />
        ),
    };

    // ==========================================
    // Format time
    // ==========================================

    const formatTime = (t) => {
        if (!Number.isFinite(t)) {
            return "0:00";
        }

        const h = Math.floor(
            t / 3600
        );

        const m = Math.floor(
            (t % 3600) / 60
        );

        const s = Math.floor(t % 60)
            .toString()
            .padStart(2, "0");

        return h > 0
            ? `${h}:${m
                .toString()
                .padStart(
                    2,
                    "0"
                )}:${s}`
            : `${m}:${s}`;
    };

    return (
        <div
            ref={containerRef}
            className="
                relative
                w-full
                aspect-video
                bg-black
                rounded-xl
                overflow-hidden
                group
            "
        >

            {/* ==========================================
                VIDEO
            ========================================== */}

            <video
                ref={videoRef}
                src={videoFile}
                poster={thumbnail}
                preload="auto"
                className="
                    w-full
                    h-full
                    object-contain
                    transition-opacity
                    duration-300
                    cursor-pointer
                "
                onClick={togglePlay}
                onEnded={handleEnded}
                onPlay={() => {
                    setIsPlaying(true);
                    setShowReplay(false);
                }}
                onPause={() => {
                    setIsPlaying(false);
                }}

                onWaiting={() => {
                    setIsBuffering(true);
                }}
                onPlaying={() => {
                    setIsBuffering(false);
                }}
                onCanPlay={() => {
                    setIsBuffering(false);
                }}
                onVolumeChange={(e) => {
                    const vid = e.target;

                    setIsMuted(
                        vid.muted
                    );

                    setVolume(
                        vid.volume
                    );
                }}
                onTimeUpdate={(e) => {
                    const vid =
                        e.target;

                    setCurrentTime(
                        vid.currentTime
                    );

                    if (
                        vid.duration &&
                        Number.isFinite(
                            vid.duration
                        )
                    ) {
                        setProgress(
                            (vid.currentTime /
                                vid.duration) *
                            100
                        );
                    }
                }}
                onProgress={
                    updateBuffered
                }
                onLoadedMetadata={(e) => {
                    setDuration(
                        e.target.duration
                    );

                    updateBuffered();
                }}
                onSeeking={() => {
                    const vid =
                        videoRef.current;

                    if (
                        !vid ||
                        !vid.duration
                    ) {
                        return;
                    }

                    setProgress(
                        (vid.currentTime /
                            vid.duration) *
                        100
                    );
                }}
            />


            {/* ==========================================
                REPLAY OVERLAY
            ========================================== */}

            {showReplay && (
                <div className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-black/35
                ">

                    <button
                        type="button"
                        onClick={handleReplay}
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            px-5
                            py-3
                            rounded-full
                            bg-white
                            text-black
                            font-semibold
                            shadow-xl
                            hover:bg-gray-200
                            hover:scale-105
                            transition
                            duration-200
                            cursor-pointer
                        "
                    >
                        <RotateCcw
                            size={20}
                        />

                        Replay
                    </button>

                </div>
            )}


            {/* ==========================================
                BUFFERING
            ========================================== */}

            {isBuffering &&
                !showReplay && (
                    <div className="
                        pointer-events-none
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                    ">
                        <Loader2
                            size={44}
                            className="
                                text-white
                                animate-spin
                            "
                        />
                    </div>
                )}


            {/* ==========================================
                FLASH ICON
            ========================================== */}

            <div className="
                pointer-events-none
                absolute
                inset-0
                flex
                items-center
                justify-center
            ">

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
                    {flashIcon &&
                        flashLabel[
                        flashIcon
                        ]}
                </div>

            </div>


            {/* ==========================================
                CONTROLS
            ========================================== */}

            <div
                className={`
                    absolute
                    left-3
                    right-3
                    bottom-3
                    rounded-xl
                    bg-black/40
                    backdrop-blur-md
                    px-4
                    py-2.5
                    flex
                    flex-col
                    gap-2
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

                {/* ==========================================
                    PROGRESS BAR
                ========================================== */}

                <div
                    className="
                        w-full
                        h-1.5
                        bg-white/20
                        rounded-full
                        cursor-pointer
                        relative
                        group/bar
                    "
                    onClick={(e) => {
                        const rect =
                            e.currentTarget.getBoundingClientRect();

                        const percent =
                            (e.clientX -
                                rect.left) /
                            rect.width;

                        if (
                            videoRef.current &&
                            videoRef.current.duration
                        ) {
                            videoRef.current.currentTime =
                                percent *
                                videoRef.current.duration;
                        }
                    }}
                    title="Seek"
                >

                    {/* Buffered */}

                    <div
                        className="
                            absolute
                            inset-y-0
                            left-0
                            bg-white/40
                            rounded-full
                        "
                        style={{
                            width: `${bufferedPercent}%`,
                        }}
                    />

                    {/* Played */}

                    <div
                        className="
                            absolute
                            inset-y-0
                            left-0
                            bg-pink-500
                            rounded-full
                        "
                        style={{
                            width: `${progress}%`,
                        }}
                    />

                    {/* Scrubber */}

                    <div
                        className="
                            absolute
                            top-1/2
                            -translate-y-1/2
                            w-3.5
                            h-3.5
                            bg-pink-500
                            rounded-full
                            shadow
                            opacity-0
                            group-hover/bar:opacity-100
                        "
                        style={{
                            left: `calc(${progress}% - 7px)`,
                        }}
                    />

                </div>


                {/* ==========================================
                    LOWER CONTROLS
                ========================================== */}

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                ">

                    {/* LEFT */}

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        {/* Play */}

                        <button
                            type="button"
                            onClick={
                                togglePlay
                            }
                            className="
                                cursor-pointer
                                hover:text-gray-300
                                hover:scale-110
                                transition
                                duration-150
                                flex-shrink-0
                            "
                            title="Play/Pause (Space)"
                        >
                            {isPlaying ? (
                                <Pause
                                    size={20}
                                    fill="white"
                                />
                            ) : (
                                <Play
                                    size={20}
                                    fill="white"
                                />
                            )}
                        </button>


                        {/* Volume */}

                        <div className="
                            flex
                            items-center
                            gap-2
                            flex-shrink-0
                        ">

                            <button
                                type="button"
                                onClick={
                                    toggleMute
                                }
                                className="
                                    cursor-pointer
                                    hover:text-gray-300
                                    hover:scale-110
                                    transition
                                "
                                title="Mute (M)"
                            >
                                {isMuted ||
                                    volume === 0 ? (
                                    <VolumeX
                                        size={18}
                                    />
                                ) : (
                                    <Volume2
                                        size={18}
                                    />
                                )}
                            </button>

                            <div className="
                                relative
                                w-16
                                h-1
                                bg-white/30
                                rounded-full
                                cursor-pointer
                            ">

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={
                                        isMuted
                                            ? 0
                                            : volume
                                    }
                                    onChange={(
                                        e
                                    ) => {
                                        const vol =
                                            parseFloat(
                                                e.target
                                                    .value
                                            );

                                        setVolume(
                                            vol
                                        );

                                        if (
                                            videoRef.current
                                        ) {
                                            videoRef.current.volume =
                                                vol;

                                            videoRef.current.muted =
                                                vol ===
                                                0;

                                            setIsMuted(
                                                vol ===
                                                0
                                            );
                                        }
                                    }}
                                    className="
                                        absolute
                                        inset-0
                                        w-full
                                        h-full
                                        opacity-0
                                        cursor-pointer
                                    "
                                    title="Volume"
                                />

                                <div
                                    className="
                                        h-full
                                        bg-white
                                        rounded-full
                                        pointer-events-none
                                    "
                                    style={{
                                        width: `${isMuted
                                                ? 0
                                                : volume *
                                                100
                                            }%`,
                                    }}
                                />

                            </div>

                        </div>


                        {/* Time */}

                        <span className="
                            text-xs
                            text-gray-200
                            flex-shrink-0
                            tabular-nums
                        ">
                            {formatTime(
                                currentTime
                            )}{" "}
                            /{" "}
                            {formatTime(
                                duration
                            )}
                        </span>

                    </div>


                    {/* RIGHT */}

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">



                        {/* Speed */}

                        <button
                            type="button"
                            onClick={() =>
                                setIsSettingsOpen(
                                    (v) => !v
                                )
                            }
                            className="
                                cursor-pointer
                                flex
                                shrink-0
                                text-xs
                                font-medium
                                bg-white/20
                                hover:bg-white/30
                                rounded
                                px-1.5
                                py-0.5
                            "
                            title="Playback speed"
                        >
                            {playbackSpeed}x
                        </button>


                        {/* Settings */}

                        <div
                            className="
                                relative
                                flex
                                shrink-0
                            "
                            ref={
                                settingsRef
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setIsSettingsOpen(
                                        (v) =>
                                            !v
                                    )
                                }
                                className="
                                    cursor-pointer
                                    hover:text-gray-300
                                    hover:scale-110
                                    transition
                                "
                                title="Settings"
                            >
                                <Settings
                                    size={18}
                                />
                            </button>


                            {isSettingsOpen && (
                                <div className="
                                    absolute
                                    bottom-9
                                    right-0
                                    bg-black/90
                                    rounded-lg
                                    py-2
                                    min-w-[110px]
                                    shadow-lg
                                    border
                                    border-white/10
                                    z-50
                                ">

                                    <p className="
                                        text-[11px]
                                        text-gray-400
                                        px-3
                                        pb-1
                                    ">
                                        Speed
                                    </p>

                                    {PLAYBACK_SPEEDS.map(
                                        (
                                            speed
                                        ) => (
                                            <button
                                                key={
                                                    speed
                                                }
                                                type="button"
                                                onClick={() =>
                                                    changePlaybackSpeed(
                                                        speed
                                                    )
                                                }
                                                className={`
                                                    cursor-pointer
                                                    w-full
                                                    text-left
                                                    text-sm
                                                    px-3
                                                    py-1.5
                                                    ${speed ===
                                                        playbackSpeed
                                                        ? "text-pink-400 font-medium"
                                                        : "text-white hover:bg-white/10"
                                                    }
                                                `}
                                            >
                                                {
                                                    speed
                                                }
                                                x
                                            </button>
                                        )
                                    )}

                                </div>
                            )}

                        </div>


                        {/* Picture in Picture */}

                        <button
                            type="button"
                            onClick={
                                togglePictureInPicture
                            }
                            className="
                                cursor-pointer
                                hover:text-gray-300
                                hover:scale-110
                                transition
                                flex-shrink-0
                            "
                            title="Picture-in-picture (I)"
                        >
                            <PictureInPicture2
                                size={18}
                            />
                        </button>


                        {/* Fullscreen */}

                        <button
                            type="button"
                            onClick={
                                toggleFullScreen
                            }
                            className="
                                cursor-pointer
                                hover:text-gray-300
                                hover:scale-110
                                transition
                                flex-shrink-0
                            "
                            title="Fullscreen (F)"
                        >
                            {isFullScreen ? (
                                <Minimize2
                                    size={18}
                                />
                            ) : (
                                <Maximize2
                                    size={18}
                                />
                            )}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default VideoPlayer;