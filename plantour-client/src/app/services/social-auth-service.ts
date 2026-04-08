import { Injectable } from '@angular/core';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {
  private facebookSdkPromise?: Promise<void>;
  private facebookAppId?: string;

  loadFacebookSdk(appId: string): Promise<void> {
    if (window.FB?.login && this.facebookAppId === appId) {
      return Promise.resolve();
    }

    if (this.facebookSdkPromise) {
      return this.facebookSdkPromise;
    }

    this.facebookAppId = appId;
    this.facebookSdkPromise = new Promise<void>((resolve, reject) => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v25.0'
        });

        window.FB.getLoginStatus(() => resolve());
      };

      const existing = document.querySelector('script[data-social-sdk="facebook"]') as HTMLScriptElement | null;
      if (existing) {
        if (window.FB?.login) {
          window.fbAsyncInit();
          return;
        }

        existing.addEventListener('load', () => {
          if (window.FB?.login) {
            window.fbAsyncInit?.();
          }
        }, { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load Facebook SDK')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.dataset['socialSdk'] = 'facebook';
      script.onload = () => {
        if (window.FB?.login) {
          window.fbAsyncInit?.();
        }
      };
      script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.head.appendChild(script);
    });

    return this.facebookSdkPromise;
  }

  loginWithFacebook(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!window.FB?.login) {
        reject(new Error('Facebook SDK is not initialized'));
        return;
      }

      window.FB.getLoginStatus((statusResponse: any) => {
        const existingAccessToken = statusResponse?.authResponse?.accessToken;
        if (statusResponse?.status === 'connected' && existingAccessToken) {
          resolve(existingAccessToken);
          return;
        }

        window.FB.login((response: any) => {
          const accessToken = response?.authResponse?.accessToken;
          if (!accessToken) {
            reject(new Error('Facebook authentication was cancelled'));
            return;
          }

          resolve(accessToken);
        }, { scope: 'email,public_profile' });
      });
    });
  }

  signOut(): void {
    const facebookStatus = window.FB?.getLoginStatus;
    if (!facebookStatus) {
      return;
    }

    facebookStatus((response: any) => {
      if (response?.status === 'connected') {
        window.FB?.logout?.(() => undefined);
      }
    });
  }
}
