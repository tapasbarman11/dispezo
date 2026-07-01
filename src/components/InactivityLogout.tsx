"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function InactivityLogout() {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        signOut({
          callbackUrl: "/login",
        });
      }, 30 * 60 * 1000); // 30 mins
    };

    resetTimer();

    window.addEventListener(
      "mousemove",
      resetTimer
    );

    window.addEventListener(
      "keydown",
      resetTimer
    );

    window.addEventListener(
      "click",
      resetTimer
    );

    window.addEventListener(
      "scroll",
      resetTimer
    );

    return () => {
      clearTimeout(timer);

      window.removeEventListener(
        "mousemove",
        resetTimer
      );

      window.removeEventListener(
        "keydown",
        resetTimer
      );

      window.removeEventListener(
        "click",
        resetTimer
      );

      window.removeEventListener(
        "scroll",
        resetTimer
      );
    };
  }, []);

  return null;
}