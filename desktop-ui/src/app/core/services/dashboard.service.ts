import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChartItem {
  name: string;
  value: number;
}

export interface DashboardUser {
  firstName: string;
  lastName: string;
  username: string;
}

export interface DashboardData {
  success: boolean;
  chartDonut: ChartItem[];
  chartBar: ChartItem[];
  tableUsers: DashboardUser[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly dashboardUrl =
    'http://test-demo.aemenersol.com/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.dashboardUrl);
  }
}
