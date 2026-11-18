import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';

export interface ChapterRow { id:number; sessionName:string; grade:string; subject:string; chapter:string; status?:string | null; }

@Injectable({providedIn: 'root'})
export class ChapterNameService {
  constructor(private http: HttpClient) {}
  list() { return this.http.get<{responseCode: number|string; listPayload?: ChapterRow[]}>(Constant.Site_Url + 'getSubjectChapters'); }
  add(gradeSubjectId: number, chapterNames: string[]) {
    return this.http.post<{responseCode: number | string; responseMessage?: string; listPayload?: string[]}>(
      Constant.Site_Url + 'addSubjectChapters', {payload: {gradeSubjectId, chapterNames}});
  }
}


