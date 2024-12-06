import { Component, OnInit , importProvidersFrom } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { CommonService, SidebarService } from 'src/app/core/core.index';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { routes } from 'src/app/core/helpers/routes';
import { CommonComponentService } from '../common-component.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  {
  public routes = routes;
  activePath = '';
  showSearch = false;
  public changeLayout = '1';
  public darkTheme = false;
  public logoPath = '';
  public miniSidebar = false;
  elem = document.documentElement;
  public addClass = false;
  base = '';
  page = '';
  last = '';

  public loginUser: any;
  public headerDetails: any;
  public displayLogo: any;

  public userName: string = '';
  public userRole: string = '';
  public userPicture: any = '';

  constructor(
    private router: Router,
    private common: CommonService,
    private sidebar: SidebarService,
    private webStorage: WebstorgeService,
    private commonComponentService: CommonComponentService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
  ) {
    this.activePath = this.router.url.split('/')[2];
    this.router.events.subscribe((data: RouterEvent) => {
      if (data instanceof NavigationStart) {
        this.activePath = data.url.split('/')[2];
      }
    });
    this.sidebar.sideBarPosition.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });

    this.loginUser = this.authenticationService.getLoginUser();
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'));

    // this.getApplicaionHeaderDetails();
  }

  ngOnInit(){
    this.getApplicaionHeaderDetails();
  }


  public logout(): void {
    this.webStorage.Logout();
  }

  public toggleSidebar(): void {
    this.sidebar.switchSideMenuPosition();
  }

  public togglesMobileSideBar(): void {
    this.sidebar.switchMobileSideBarPosition();
  }

  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sidebar.expandSideBar.next(true);
    } else {
      this.sidebar.expandSideBar.next(false);
    }
  }

  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  public getApplicaionHeaderDetails() {
    let firstName = this.cookieService.get('firstName');
    let lastName = this.cookieService.get('lastName');
    this.userName = firstName+" "+lastName
    this.userRole = this.cookieService.get('roleType');

    //  this.displayLogo =localStorage.getItem('displayLogo');
    //  this.userPicture = 'data:image/jpeg;base64,'+localStorage.getItem('userPicture');
    this.userPicture = localStorage.getItem('userPicture') || '';

     console.log(this.userPicture);
  }

  logOut() {

    this.cookieService.delete('loginDetails');
    this.cookieService.delete('loginId');
    this.cookieService.delete('firstName');
    this.cookieService.delete('lastName');
    this.cookieService.delete('roleType');
    this.cookieService.delete('teamleaderId');
    this.cookieService.delete('superadminId');
    this.cookieService.delete('token');

    // Remove 'displayLogo' from localStorage
    localStorage.removeItem('displayLogo');

    // Remove 'userPicture' from localStorage
    localStorage.removeItem('userPicture');
    
    this.router.navigate([routes.signIn]);
    // this.router.navigate([routes.signIn]);
    // window.location.href = "/signin";
    // window.location.reload();
  }



 
}
