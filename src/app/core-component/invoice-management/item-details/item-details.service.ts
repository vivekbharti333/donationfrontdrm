import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';

export interface ProductDetails {
  id: number;
  productName: string;
  description: string;
  rate: number;
  quantityType: string;
  quantity: number;
  createdAt: number | string;
  createdBy: string;
  superadminId: string;
}

export interface ProductDetailsResponse {
  responseCode: number | string;
  responseMessage?: string;
  listPayload?: ProductDetails[];
}

export interface AddProductResponse {
  responseCode: number | string;
  responseMessage?: string;
  payload?: {
    respCode?: number | string;
    respMesg?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ItemDetailsService {
  private readonly loginUser: any;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  getProductDetails(): Observable<ProductDetailsResponse> {
    return this.http.post<ProductDetailsResponse>(Constant.Site_Url + 'getProductDetails', {
      payload: {
        requestFor: 'BY_SUPERADMIN',
        superadminId: this.loginUser?.superadminId
      }
    });
  }

  addProduct(product: Pick<ProductDetails, 'productName' | 'description' | 'rate' | 'quantityType' | 'quantity'>): Observable<AddProductResponse> {
    return this.http.post<AddProductResponse>(Constant.Site_Url + 'addProduct', {
      payload: {
        ...product,
        createdBy: this.loginUser?.loginId,
        superadminId: this.loginUser?.superadminId
      }
    });
  }
}
