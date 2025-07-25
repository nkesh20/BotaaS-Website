import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  private apiUrl = `${environment.apiUrl}/broadcast/`;

  constructor(private http: HttpClient) { }

  broadcast(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
} 