import { HttpContextToken } from '@angular/common/http';

// Requests covered by a component's own loading indicator can opt out.
export const SKIP_GLOBAL_SPINNER = new HttpContextToken<boolean>(() => false);
