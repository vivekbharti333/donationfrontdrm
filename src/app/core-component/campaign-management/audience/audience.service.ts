import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { AuthenticationService } from 'src/app/auth/authentication.service';

export interface Audience {
  id: number;
  audienceName: string;
  description: string | null;
  status: string;
  createdAt: string | null;
}

export interface AudienceListResponse {
  responseCode: number;
  responseMessage: string;
  listPayload?: Audience[] | null;
  totalNumber?: string | null;
}

export interface AddAudienceResponse {
  responseCode: number;
  responseMessage: string;
  payload?: { respCode: number; respMesg: string };
}

export type AudienceMutationResponse = AddAudienceResponse;

@Injectable({ providedIn: 'root' })
export class AudienceService {
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
  ) {}

  addAudienceName(audienceName: string, description: string): Observable<AddAudienceResponse> {
    const loginUser = this.authenticationService.getLoginUser();
    return this.http.post<AddAudienceResponse>(Constant.Site_Url + 'addAudienceName', {
      payload: {
        audienceName,
        description,
        createdBy: loginUser['loginId'],
        superadminId: loginUser['superadminId'],
      },
    });
  }

  updateAudienceName(audience: Pick<Audience, 'id' | 'audienceName' | 'description'>): Observable<AudienceMutationResponse> {
    const loginUser = this.authenticationService.getLoginUser();
    return this.http.post<AudienceMutationResponse>(Constant.Site_Url + 'updateAudienceName', {
      payload: {
        id: audience.id,
        audienceName: audience.audienceName,
        description: audience.description ?? '',
        createdBy: loginUser['loginId'],
        superadminId: loginUser['superadminId'],
      },
    });
  }

  deleteAudienceName(audience: Pick<Audience, 'id'>): Observable<AudienceMutationResponse> {
    const loginUser = this.authenticationService.getLoginUser();
    return this.http.post<AudienceMutationResponse>(Constant.Site_Url + 'deleteAudienceName', {
      payload: {
        id: audience.id,
        createdBy: loginUser['loginId'],
        superadminId: loginUser['superadminId'],
      },
    });
  }

  getAudienceList(): Observable<AudienceListResponse> {
    const loginUser = this.authenticationService.getLoginUser();
    const request = {
      payload: {
        requestedFor: 'AUDIENCE_LIST',
        token: loginUser['token'],
        createdBy: loginUser['loginId'],
        superadminId: loginUser['superadminId'],
      },
    };
    return this.http.post<AudienceListResponse>(Constant.Site_Url + 'getAudienceList', request);
  }
}
