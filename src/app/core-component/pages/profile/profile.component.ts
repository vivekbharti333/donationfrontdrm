import { Component, OnInit } from '@angular/core';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from '../../user-management/user-management.service';
import { TenantMediaUrlService } from 'src/app/core/service/tenant-media-url.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  userDetails: any = {};
  private savedDetails: any = {};
  isLoading = true;
  isSaving = false;
  loadError = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private userManagementService: UserManagementService, private mediaUrl: TenantMediaUrlService) {}

  ngOnInit(): void { this.getUserByLoginId(); }

  getUserByLoginId(): void {
    this.isLoading = true;
    this.loadError = '';
    this.userManagementService.getUserDetailsByLoginId().subscribe({
      next: (response: any) => {
        if (Number(response?.responseCode) === Constant.SUCCESS_CODE && response?.payload) {
          this.userDetails = { ...response.payload, addressList: response.payload.addressList || [] };
          this.savedDetails = { ...this.userDetails };
        } else {
          this.loadError = response?.responseMessage || 'Unable to load profile details.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Unable to load profile details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  updateProfile(): void {
    if (!String(this.userDetails.firstName || '').trim() || !String(this.userDetails.lastName || '').trim()
      || !String(this.userDetails.mobileNo || '').trim()) {
      this.showMessage('First name, last name and mobile number are required.', 'error');
      return;
    }
    this.isSaving = true;
    this.message = '';
    this.userManagementService.updateCurrentUserProfile(this.userDetails).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (Number(response?.responseCode) === Constant.SUCCESS_CODE) {
          const savedPicture = response?.payload?.userPicture;
          if (savedPicture) {
            this.userDetails.userPicture = savedPicture;
            localStorage.setItem('userPicture', savedPicture);
          }
          this.savedDetails = { ...this.userDetails };
          this.showMessage('Profile updated successfully.', 'success');
        } else {
          this.showMessage(response?.responseMessage || 'Unable to update profile.', 'error');
        }
      },
      error: () => {
        this.isSaving = false;
        this.showMessage('Unable to update profile. Please try again.', 'error');
      }
    });
  }

  cancelChanges(): void {
    this.userDetails = { ...this.savedDetails };
    this.message = '';
  }

  onPictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showMessage('Please select a valid image file.', 'error');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showMessage('Profile image must be smaller than 2 MB.', 'error');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.userDetails.userPicture = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
  }

  get profileImageUrl(): string {
    const picture = String(this.userDetails?.userPicture || '').trim();
    if (!picture) return 'assets/img/profiles/avatar-02.jpg';
    if (picture.startsWith('data:image/') || /^https?:\/\//i.test(picture)) return picture;
    const tenantId = this.userDetails?.superadminId || localStorage.getItem('superadminId') || '';
    return this.mediaUrl.userPicture(this.userDetails?.service, tenantId, picture);
  }

  useDefaultImage(event: Event): void { (event.target as HTMLImageElement).src = 'assets/img/profiles/avatar-02.jpg'; }
  displayValue(value: any): string { return String(value ?? '').trim() || 'Not available'; }
  get fullName(): string {
    return [this.userDetails?.firstName, this.userDetails?.lastName]
      .filter((value: any) => String(value || '').trim()).join(' ') || 'User';
  }
  get roleLabel(): string { return this.displayValue(this.userDetails?.roleType).replace(/_/g, ' '); }
  get memberSince(): string {
    const createdAt = this.userDetails?.createdAt;
    if (!createdAt) return 'Not available';
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
  }
  get profileStrength(): number {
    const fields = ['firstName', 'lastName', 'emailId', 'mobileNo', 'userPicture'];
    return Math.round(fields.filter(field => String(this.userDetails?.[field] || '').trim()).length / fields.length * 100);
  }
}
