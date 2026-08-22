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

  const getSidebarWidthClass = useCallback(
    (isOpen) => (isOpen ? "w-50" : "w-20"),
    []
  );

  const getMainLeftClass = useCallback(
    (isOpen) => (isOpen ? "left-50" : "left-20"),
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
    ...viewport,
    getSidebarWidthClass,
    getMainLeftClass,
    getSidebarAdditionalClass,
  };
};
