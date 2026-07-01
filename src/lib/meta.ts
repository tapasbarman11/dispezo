declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const loadFacebookSDK = () => {
  return new Promise<void>((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1560669998958196",
        cookie: true,
        xfbml: false,
        version: "v23.0",
      });

      resolve();
    };

    const script = document.createElement("script");

    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);
  });
};