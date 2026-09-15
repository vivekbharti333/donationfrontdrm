import { BehaviorSubject, Subject } from 'rxjs';
import { NavigationEnd, NavigationStart } from '@angular/router';
import { CoreComponentComponent } from './core-component.component';

describe('CoreComponentComponent route state', () => {
  function setup(url: string) {
    const events = new Subject<any>();
    const common = { base: new BehaviorSubject(''), page: new BehaviorSubject(''), last: new BehaviorSubject('') };
    const settings = { themeMode: new BehaviorSubject(''), layoutMode: new BehaviorSubject(''), navigationColor: new BehaviorSubject('') };
    const sidebar = { toggleMobileSideBar: new BehaviorSubject('false'), expandSideBar: new BehaviorSubject(false), sideBarPosition: new BehaviorSubject('false') };
    const component = new CoreComponentComponent(
      { url, events } as any, settings as any, sidebar as any, common as any,
      { addClass: () => {}, removeClass: () => {} } as any
    );
    return { component, events, common };
  }

  for (const url of ['/', '/dashboard', '/signin']) {
    it('keeps the layout safe during initial navigation at ' + url, () => {
      const { component, common } = setup(url);
      expect(component.page.split('?')[0]).toBe('');
      expect(component.last).toBe('');
      expect(common.page.value).toBe('');
    });
  }

  it('uses the final school dashboard URL after a redirect', () => {
    const { component, events, common } = setup('/dashboard');
    events.next(new NavigationEnd(1, '/dashboard', '/dashboard/school-dashboard?year=2026'));
    expect(component.base).toBe('dashboard');
    expect(component.page).toBe('school-dashboard');
    expect(common.page.value).toBe('school-dashboard');
  });

  it('keeps the current layout until navigation completes', () => {
    const { component, events } = setup('/dashboard/donation-dashboard');
    events.next(new NavigationStart(1, '/dashboard'));
    expect(component.page).toBe('donation-dashboard');
    events.next(new NavigationEnd(2, '/dashboard/school-dashboard', '/dashboard/school-dashboard'));
    expect(component.page).toBe('school-dashboard');
  });
});
