import { useState, useEffect, useRef, useCallback } from "react";

export const useResponsiveSidebar = (initialOpen = true) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 750) return false;
      return initialOpen;
    }
    return initialOpen;
  });

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

      if (isMobile) {
        setIsSidebarOpen(false);
        hasAnimatedOutRef.current = false;
      } else if (isDesktop) {
        setIsSidebarOpen(initialOpen);
        hasAnimatedOutRef.current = false;
      }
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", updateViewport);
    };
  }, [initialOpen]);

  const toggleSidebar = useCallback(() => {
    if (viewport.isSmallMobile) {
      setIsSidebarOpen((prev) => !prev);
      hasAnimatedOutRef.current = false;
    } else if (viewport.isMobile) {
      setIsSidebarOpen(true);

      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }

      autoCloseTimerRef.current = setTimeout(() => {
        setIsSidebarOpen(false);
        hasAnimatedOutRef.current = true;
      }, 2500);
    } else {
      setIsSidebarOpen((prev) => !prev);
      hasAnimatedOutRef.current = false;
    }
  }, [viewport.isMobile, viewport.isSmallMobile]);

  const getSidebarWidthClass = useCallback(
    (isOpen) => {
      if (viewport.isSmallMobile) {
        return isOpen ? "w-64" : "w-20";
      }

      if (viewport.isMobile) {
        return isOpen ? "w-48" : "w-0";
      }

      if (viewport.isDesktop) {
        return isOpen ? "w-56" : "w-20";
      }

      return isOpen ? "w-60" : "w-20";
    },
    [viewport.isMobile, viewport.isSmallMobile, viewport.isDesktop]
  );

  const getMainLeftClass = useCallback(
    (isOpen) => {
      if (viewport.isSmallMobile) {
        return isOpen ? "left-64" : "left-20";
      }

      if (viewport.isMobile) {
        return isOpen ? "left-48" : "left-0";
      }

      if (viewport.isDesktop) {
        return isOpen ? "left-56" : "left-20";
      }

      return isOpen ? "left-60" : "left-20";
    },
    [viewport.isMobile, viewport.isSmallMobile, viewport.isDesktop]
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
