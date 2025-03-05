import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CouchdbService } from '../../../Services/couchdb.service';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule,HttpClientModule,CommonModule,FormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  providers:[HttpClient,CouchdbService]
})
export class HomePageComponent implements OnInit{


  isYearly: boolean = false;
  plans: any[] = []; // Array to store fetched pricing plans
  filteredPlans: any[] = [];

  constructor(readonly service:CouchdbService) {}

  ngOnInit() {
    this.fetchPlans();
  }

  fetchPlans() {
    this.service.getAllPlans().subscribe({
      next: (data) => {
        this.plans = data.rows.map((row:any) => row.doc); 
        this.filterPlans(); // Apply filtering after fetching
        
      },
      error: (err) => {
        // console.error('Error fetching plans:', err);
        // alert('Failed to load pricing plans.');
      },
    });
  }

  togglePricing(): void {
    this.isYearly = !this.isYearly;
    this.filterPlans();
  }

  filterPlans() {
    this.filteredPlans = this.plans.filter(plan => 
      this.isYearly ? plan.data.planName === 'Yearly' : plan.data.planName === 'Monthly'
    );
  }
}





