// dash-board.component.ts
import { Component } from '@angular/core';
import { CouchdbService } from '../../../Services/couchdb.service';
import * as d3 from 'd3';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerNavComponent } from "../seller-nav/seller-nav.component";

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [CommonModule, FormsModule, SellerNavComponent],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css',
  providers: [CouchdbService, AuthenticationService]
})
export class DashBoardComponent {
  billHeaders: any[] = [];
  invoices: any[] = [];
  currentUserId: string = '';
  selectedChart: string = '7days';
  currentUser!: string;
  topProducts: { productName: string, totalQuantity: number }[] = [];

  constructor(
    readonly service: CouchdbService,
    readonly router: Router,
    readonly authService: AuthenticationService
  ) {}

  ngOnInit(): void {
      if (typeof window !== 'undefined') {
        this.currentUser = localStorage.getItem('currentUser') ?? this.authService.currentUser;
        this.currentUserId=localStorage.getItem('currentUserId') ?? this.authService.currentUserId;
        
        if (!this.currentUser || !this.currentUserId) {
          this.router.navigate(['/seller-login']); 
          return;
        }
      this.fetchBillHeaders();
      this.fetchInvoices();
    }
  }

  onChartTypeChange(): void {
    setTimeout(() => {
      this.generateCharts();
    }, 0);
  }

  fetchBillHeaders(): void {
    this.service.getBillingDetailsFromBillHeader().subscribe({
      next: (response: any) => {
        this.billHeaders = response.rows.map((row: any) => row.doc);
        this.generateCharts();
      },
      error: (error) => {
        console.log('Error fetching bill headers:', error);
      }
    });
  }

  fetchInvoices(): void {
    this.service.getBillingDetailsFromInvoice().subscribe({
      next: (response: any) => {
        this.invoices = response.rows.map((row: any) => row.doc);
        this.generateCharts();
      },
      error: (error) => {
        console.log('Error fetching invoices:', error);
      }
    });
  }


  

  generateCharts(): void {
    if (!this.billHeaders.length || !this.invoices.length) return;

    if (this.selectedChart === '7days') {
      this.generatePast7DaysChart();
    } else {
      this.generateMonthlyComparisonChart();
    }
  }

  generatePast7DaysChart(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);

    const grouped = new Map<string, { date: Date; total: number }>();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = d3.timeFormat('%Y-%m-%d')(date);
      grouped.set(key, { date, total: 0 });
    }

    this.billHeaders.forEach(bill => {
      const billDate = new Date(bill.data.date);
      const dateKey = d3.timeFormat('%Y-%m-%d')(d3.timeDay.floor(billDate));

      if (grouped.has(dateKey)) {
        const quantity = this.invoices
          .filter(invoice => invoice.data.billId === bill._id)
          .reduce((sum, invoice) => sum + invoice.data.quantity, 0);

        const entry = grouped.get(dateKey)!;
        entry.total += quantity;
      }
    });

    const data = Array.from(grouped.entries())
      .map(([key, value]) => ({
        groupKey: key,
        totalQuantity: value.total
      }));

    this.renderBarChart(data, '#past-7-days-chart', 'Sales Bar Chart (Last 7 Days)');
  }

  generateMonthlyComparisonChart(): void {
    const grouped = new Map<string, { month: string; total: number }>();

    this.billHeaders.forEach(bill => {
      const billDate = new Date(bill.data.date);
      const monthKey = d3.timeFormat('%Y-%m')(billDate);

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, { month: monthKey, total: 0 });
      }

      const quantity = this.invoices
        .filter(invoice => invoice.data.billId === bill._id)
        .reduce((sum, invoice) => sum + invoice.data.quantity, 0);

      const entry = grouped.get(monthKey)!;
      entry.total += quantity;
    });

    const data = Array.from(grouped.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    this.renderBarChart(data, '#monthly-comparison-chart', 'Sales Bar Chart (Monthly Comparison)');
  }

  renderBarChart(data: any[], containerId: string, title: string): void {
    d3.select(containerId).html('');
    const isMonthlyChart = containerId === '#monthly-comparison-chart';

    const margin = { top: 22, right: 30, bottom: 60, left: 20 };
    const width = isMonthlyChart ? 290 : 420;
    const chartWidth = width - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(containerId)
      .append('svg')
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.groupKey || d.month))
      .range([0, width])
      .padding(0.7);

    const yMax = d3.max(data, d => d.totalQuantity || d.total) ?? 1;
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.groupKey || d.month)!)
      .attr('y', d => y(d.totalQuantity || d.total))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.totalQuantity || d.total))
      .attr('fill', 'steelblue');

    svg.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(title);
  }
}