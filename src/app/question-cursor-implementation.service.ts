import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { QuestionCursor } from '@project-sunbird/sunbird-quml-player-v9';
import { forkJoin, Observable, of, throwError as observableThrowError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class QuestionCursorImplementationService implements QuestionCursor {
    questionSet: any;
    localBaseUrl: string;

    constructor(private http: HttpClient, private apiService: ApiService) { }

    getLocalQuestionSet(identifier) {
        //this.localBaseUrl = `assets/content/${this.apiService.videoContentId}/interactions/${identifier}/`;
        this.localBaseUrl = `assets/content/${this.apiService.videoContentId}/${identifier}/`;
        return this.http.get(this.localBaseUrl + 'hierarchy.json').pipe(map((data) => {
            return data;
        }));
    }

    getQuestionSet(identifier) {
        if (this.apiService.isOffline && this.apiService.videoContentId) {
            //this.localBaseUrl = `assets/content/${this.apiService.videoContentId}/interactions/${identifier}/`;
            // return this.http.get(this.localBaseUrl + 'hierarchy.json').pipe(map((data) => {
            //     this.questionSet = data;
            //     return data;
            // }));
            this.localBaseUrl = `assets/content/${this.apiService.videoContentId}/${identifier}/`;

            return this.getLocalQuestionSet(identifier).pipe(map((questionSet) => {
                this.questionSet = questionSet;
                return questionSet;
            }));
        } else {
            const hierarchy = this.http.get(`${this.apiService.baseUrl}/learner/questionset/v1/hierarchy/${identifier}`)
            const questionSet = this.http.get(`${this.apiService.baseUrl}/api/questionset/v1/read/${identifier}?fields=instructions`)

            // Required for dock.staging 
            // const hierarchy = this.http.get(`${this.apiService.baseUrl}/action/questionset/v1/hierarchy/${identifier}`)
            // const questionSet = this.http.get(`${this.apiService.baseUrl}/action/questionset/v1/read/${identifier}?fields=instructions`)
            return (
                forkJoin([hierarchy, questionSet]).pipe(
                    map(res => {
                        let questionSet = res[0]['result']['questionSet'];
                        if (res[1]['result']['questionset']['instructions'] && questionSet) {
                            questionSet['instructions']
                        }
                        return { questionSet }
                    })
                ));
        }
    }

    getAllQuestionSet(identifiers) {
        if (this.apiService.isOffline) {
            const requests = identifiers.map(id => {
                return this.getLocalQuestionSet(id);
            });
            return forkJoin(requests).pipe(map((response: any) => {
                console.log("response", response);
                return response.map(item => item?.questionSet?.maxScore || 0);
            }));
        } else {
            const requests = identifiers.map(id => {
                return this.http.get(`${this.apiService.baseUrl}/learner/questionset/v1/hierarchy/${id}?fields=maxScore`)
            })
            return forkJoin(requests).pipe(
                map(res => {
                    return res.map(item => item["result"].questionSet.maxScore);
                }));
        }
    }

    getQuestions(identifiers: string[]): Observable<any> {
        if (this.apiService.isOffline) {
            const questions = this.questionSet.questionSet.childNodes;

            const requests = this.questionSet.questionSet.childNodes.map(id => {
                return this.http.get(`${this.localBaseUrl}${id}/index.json`);  //was previously manifest
            });

            console.log('requests', requests);

            return forkJoin(requests).pipe(map((response: any) => {
                return {
                    count: response.length,
                    questions: response.map(questionRes => questionRes.archive.items[0])
                };
            }));
        } else {
            const option: any = {
                url: `${this.apiService.baseUrl}/api/question/v1/list`,
                data: {
                    request: {
                        search: { identifier: identifiers }
                    }
                }
            };
            return this.post(option).pipe(map((data) => {
                return data.result;
            }));
        }
    }

    getQuestion(identifier: string): Observable<any> {
        const option: any = {
            url: `${this.apiService.baseUrl}/api/question/v1/list`,
            data: {
                request: {
                    search: { identifier: [identifier] }
                }
            }
        };
        return this.post(option).pipe(map((data) => {
            return data.result;
        }));
    }

    private post(requestParam): Observable<any> {
        const httpOptions = {
            headers: { 'Content-Type': 'application/json' }
        };
        return this.http.post(requestParam.url, requestParam.data, httpOptions).pipe(
            mergeMap((data: any) => {
                if (data.responseCode !== 'OK') {
                    return observableThrowError(data);
                }
                return of(data);
            }));
    }
}