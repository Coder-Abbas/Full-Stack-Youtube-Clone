import { useState, useEffect, useRef, useCallback } from "react";

export const useResponsiveSidebar = (initialOpen) => {
  // Open by default on wider screens (>= 750px), collapsed on small devices.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 750 : false
  );

  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    isMobile: false,
    isSmallMobile: false,
    isDesktop: false,
    isTransition: false,
  });

  const autoCloseTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasAnimatedOutRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    hasAnimatedOutRef.current = false;

    const updateViewport = () => {
      if (!isMountedRef.current) return;

      const width = window.innerWidth;
      const isMobile = width < 750;
      const isSmallMobile = width < 630;
      const isDesktop = width > 820;
      const isTransition = width >= 750 && width <= 820;

      setViewport({
        width,
        isMobile,
        isSmallMobile,
        isDesktop,
        isTransition,
      });
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  // Toggle open/closed.
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Force-close (used by the mobile backdrop / outside-click).
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const getSidebarWidthClass = useCallback(
    (isOpen) => (isOpen ? "w-50" : "w-14 sm:w-20"),
    []
  );

  // Overlay mode: on tablet/mobile (<750px) the main content does NOT shift —
  // the sidebar floats above it at a high z-index. On laptop/desktop (>=750px)
  // the original push layout is restored via an important utility so it wins
  // over the base rail offset.
  const getMainLeftClass = useCallback(
    (isOpen) =>
      isOpen
        ? "left-14 sm:left-20 min-[750px]:left-50!"
        : "left-14 sm:left-20",
    []
  );

  const getSidebarAdditionalClass = useCallback(
    (isOpen) => {
      if (viewport.isSmallMobile || viewport.isMobile) {
        if (isOpen) {
          hasAnimatedOutRef.current = false;
          return "sidebar-mobile-animate-in";
        }

        if (hasAnimatedOutRef.current) {
          return "sidebar-mobile-animate-out";
        }
      }

      return "";
    },
    [viewport.isMobile, viewport.isSmallMobile]
  );

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    closeSidebar,
    ...viewport,
    getSidebarWidthClass,
    getMainLeftClass,
    getSidebarAdditionalClass,
  };
};
