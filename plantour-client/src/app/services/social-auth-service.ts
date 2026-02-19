import { Injectable } from '@angular/core';

declare global {
  interface Window {
    google?: any;
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {
  private googleSdkPromise?: Promise<void>;
  private facebookSdkPromise?: Promise<void>;

  loadGoogleSdk(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (this.googleSdkPromise) {
      return this.googleSdkPromise;
    }

    this.googleSdkPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-social-sdk="google"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load Google SDK')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset['socialSdk'] = 'google';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google SDK'));
      document.head.appendChild(script);
    });

    return this.googleSdkPromise;
  }

  renderGoogleButton(container: HTMLElement, clientId: string, onCredential: (idToken: string) => void): void {
    if (!window.google?.accounts?.id) {
      throw new Error('Google SDK is not initialized');
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      use_fedcm_for_button: true,
      callback: (response: { credential?: string }) => {
        if (response?.credential) {
          onCredential(response.credential);
        }
      }
    });

    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      text: 'continue_with',
      size: 'large',
      width: 300
    });
  }

  loadFacebookSdk(appId: string): Promise<void> {
    if (window.FB?.login) {
      return Promise.resolve();
    }

    if (this.facebookSdkPromise) {
      return this.facebookSdkPromise;
    }

    this.facebookSdkPromise = new Promise<void>((resolve, reject) => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v24.0'
        });
        resolve();
      };

      const existing = document.querySelector('script[data-social-sdk="facebook"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('error', () => reject(new Error('Failed to load Facebook SDK')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.dataset['socialSdk'] = 'facebook';
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

      window.FB.login((response: any) => {
        const accessToken = response?.authResponse?.accessToken;
        if (!accessToken) {
          reject(new Error('Facebook authentication was cancelled'));
          return;
        }

        resolve(accessToken);
      }, { scope: 'email,public_profile' });
    });
  }
}
