
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  data: DashboardData | null = null;
  loading = true;
  errorMessage = '';

  donutChart?: Chart<'doughnut', number[], string>;
  barChart?: Chart<'bar', number[], string>;
  private viewReady = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    public sessionService: SessionService,
    private router: Router
  ) {}


  ngAfterViewInit(): void {
    this.viewReady = true;

    if (this.sessionService.isOffline()) {
      this.loading = false;
      this.errorMessage = '';
      this.data = null;
      return;
    }

    this.loadDashboard();
  }

  loadDashboard(): void {
    if (this.sessionService.isOffline()) {
      this.loading = false;
      this.errorMessage =
        'Offline mode: the live dashboard API is not available.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboard().subscribe({
      next: (response: DashboardData) => {
        this.data = response;
        this.loading = false;
        setTimeout(() => this.renderCharts());
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          'Unable to load dashboard data. Please try signing in again.';
        console.error('Dashboard API failed:', error);

        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.sessionService.clear();
          this.router.navigate(['/login']);
        }
      }
    });
  }


  private getChartParts(items: { name: string; value: number }[]) {
    return {
      labels: items.map(item => item.name),
      values: items.map(item => item.value)
    };
  }



  private renderCharts(): void {
    if (!this.viewReady || !this.data) {
      return;
    }

    this.donutChart?.destroy();
    this.barChart?.destroy();

    const donut = this.getChartParts(this.data.chartDonut);
    const bar = this.getChartParts(this.data.chartBar);

    this.donutChart = new Chart<'doughnut', number[], string>(
      this.donutCanvas.nativeElement,
      {
        type: 'doughnut',
        data: {
          labels: donut.labels,
          datasets: [{
            data: donut.values,
            backgroundColor: [
              '#cfcfcf',
              '#a8a8a8',
              '#929292',
              '#dedede'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '42%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      }
    );

    this.barChart = new Chart<'bar', number[], string>(
      this.barCanvas.nativeElement,
      {
        type: 'bar',
        data: {
          labels: bar.labels,
          datasets: [{
            data: bar.values,
            backgroundColor: '#a0a0a0',
            borderWidth: 0,
            barPercentage: 0.65,
            categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                display: false
              },
              ticks: {
                display: false
              }
            }
          }
        }
      }
    );
  }


  get users(): any[] {
    return Array.isArray(this.data?.tableUsers)
      ? this.data!.tableUsers
      : [];
  }

  get userColumns(): string[] {
    const firstUser = this.users[0];

    if (!firstUser || typeof firstUser !== 'object') {
      return [];
    }

    return Object.keys(firstUser);
  }

  getColumnLabel(column: string): string {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      username: 'User Name'
    };

    return labels[column] ||
      column.charAt(0).toUpperCase() + column.slice(1);
  }

  displayValue(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  signOut(): void {
    this.authService.logout();
    this.sessionService.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.donutChart?.destroy();
    this.barChart?.destroy();
  }
}
