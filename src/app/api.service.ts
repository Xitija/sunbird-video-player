import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EcarManifest } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = 'https://staging.sunbirded.org';
  // baseUrl = 'https://dock.sunbirded.org';
  isOffline = true;
  videoContentId: string;
  constructor(private httpClient: HttpClient) { }


  getContent(contentId: string) {
    const params: HttpParams = new HttpParams()
      .set('fields', 'ageGroup,appIcon,artifactUrl,attributions,attributions,audience,author,badgeAssertions,board,body,channel,code,concepts,contentCredits,contentType,contributors,copyright,copyrightYear,createdBy,createdOn,creator,creators,description,displayScore,domain,editorState,flagReasons,flaggedBy,flags,framework,gradeLevel,identifier,itemSetPreviewUrl,keywords,language,languageCode,lastUpdatedOn,license,mediaType,medium,mimeType,name,originData,osId,owner,pkgVersion,publisher,questions,resourceType,scoreDisplayConfig,status,streamingUrl,subject,template,templateId,totalQuestions,totalScore,versionKey,visibility,year,primaryCategory,additionalCategories,interceptionPoints,interceptionType')
      .set('orgdetails', 'orgName,email')
      .set('licenseDetails', 'name,description,url')
    return this.httpClient.get(`${this.baseUrl}/api/content/v1/read/${contentId}`, { params })
      .pipe(map((res: any) => {
        if (res.result.content) {
          return res.result.content;
        }
        throwError('Invalid Response');
      }));
  }

  getLocalContent(contentId: string) {
    return this.httpClient.get(`assets/content/${contentId}/manifest.json`).pipe(map((data: EcarManifest) => {
      return data.archive.items[0];
    }));
  }
}
