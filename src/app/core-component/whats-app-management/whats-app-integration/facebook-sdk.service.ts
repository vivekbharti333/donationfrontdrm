import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FacebookSdkService {
  private loading?: Promise<void>;

  load(): Promise<void> {
    if (this.loading) return this.loading;
    this.loading = new Promise<void>((resolve, reject) => {
      const initialize = () => {
        try {
          const sdk = (window as any).FB;
          if (!sdk) throw new Error('Facebook SDK is unavailable.');
          sdk.init({ appId: '1222137563317496', xfbml: false, version: 'v24.0' });
          resolve();
        } catch (error) { reject(error); }
      };
      if ((window as any).FB) { initialize(); return; }
      let script = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
      const existing = !!script;
      script = script || document.createElement('script');
      const timeout = window.setTimeout(() => finish(false), 20000);
      const loaded = () => finish(true);
      const failed = () => finish(false);
      const finish = (success: boolean) => {
        window.clearTimeout(timeout);
        script!.removeEventListener('load', loaded);
        script!.removeEventListener('error', failed);
        if (success) initialize();
        else reject(new Error('Facebook connection tools could not be loaded. Refresh the page and try again.'));
      };
      script.addEventListener('load', loaded);
      script.addEventListener('error', failed);
      if (!existing) {
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
      }
    });
    return this.loading;
  }
}
