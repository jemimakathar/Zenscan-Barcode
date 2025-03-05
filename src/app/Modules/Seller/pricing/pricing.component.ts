import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
  providers: [HttpClient, AuthenticationService, CouchdbService]
})
export class PricingComponent implements OnInit {

  isYearly: boolean = false; // Toggle between yearly and monthly plans
  plans: any[] = []; // Array to store fetched pricing plans
  filteredPlans: any[] = []; // Array to store filtered plans based on duration
  showPaymentForm: boolean = false; // Toggle payment form visibility
  selectedPlan: any = null; // Store the selected plan
  selectedPlanId: string | null = null; // Store the selected plan ID
  currentUserId!: string; // Store the current user ID
  startDate: string = ''; // Store the start date as a string
  endDate: string = ''; // Store the end date as a string
  showPlans: boolean = true;

  constructor(
    readonly authService: AuthenticationService,
    readonly router: Router,
    readonly service: CouchdbService
  ) { }

  ngOnInit() {
    // Check if the code is running in a browser environment
    if (typeof window !== 'undefined') {
      // Get the current user ID from local storage or service
      this.currentUserId = localStorage.getItem('currentUserId') || this.authService.currentUserId;
      console.log("currentUserId", this.currentUserId);

      // Redirect to login if no user ID is found
      if (!this.currentUserId) {
        this.router.navigate(['/seller-login']);
        return;
      }

      // Load the selected plan ID from local storage if it exists
      this.selectedPlanId = localStorage.getItem('selectedPlanId');
      this.fetchPlans(); // Fetch pricing plans from the server
    }
  }

  // Fetch pricing plans from the server
  fetchPlans() {
    this.service.getAllPlans().subscribe({
      next: (data) => {
        this.plans = data.rows.map((row: any) => row.doc); // Map the fetched data to the plans array
        this.filterPlans(); // Filter plans based on the selected duration (yearly/monthly)
      },
      error: (err) => {
        console.error('Error fetching plans:', err);
        alert('Failed to load pricing plans.');
      },
    });
  }

  // Toggle between yearly and monthly plans
  togglePricing(): void {
    this.isYearly = !this.isYearly;
    this.filterPlans();
  }

  // Filter plans based on the selected duration (yearly/monthly)
  filterPlans() {
    this.filteredPlans = this.plans.filter(plan =>
      this.isYearly ? plan.data.planName.includes('Year') : plan.data.planName.includes('Month')
    );
  }

  // Select a plan and show the payment form
  selectPlan(plan: any) {
    this.selectedPlan = plan;
    this.selectedPlanId = plan._id;
    this.showPaymentForm = true;
    this.showPlans = false; // Hide the plans

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (this.selectedPlan.data.planName.includes('Year')) {
      endDate.setFullYear(startDate.getFullYear() + this.selectedPlan.data.duration); // Add years
    } else if (this.selectedPlan.data.planName.includes('Month')) {
      endDate.setMonth(startDate.getMonth() + this.selectedPlan.data.duration); // Add months
    }

    // Format dates as strings
    this.startDate = startDate.toLocaleDateString(); // Format start date
    this.endDate = endDate.toLocaleDateString(); // Format end date

    // Store the selected plan ID in local storage
    localStorage.setItem('selectedPlanId', plan._id);
    console.log("Selected Plan:", plan);
  }

  // Subscribe to the selected plan
  subscribeToPlan() {
    if (!this.selectedPlanId) {
      alert("Please select a plan before subscribing.");
      return;
    }

    // Calculate the end date based on the plan duration
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (this.selectedPlan.data.planName.includes('Year')) {
      endDate.setFullYear(startDate.getFullYear() + this.selectedPlan.data.duration); // Add years
    } else if (this.selectedPlan.data.planName.includes('Month')) {
      console.log(this.selectedPlan.data.duration);

      console.log(endDate)
      endDate.setMonth(startDate.getMonth() + this.selectedPlan.data.duration); // Add months
      console.log(endDate)
    }

    // Create subscription data
    const subscriptionData = {
      _id: `subscription_2_${uuidv4()}`, // Generate a unique ID for the subscription
      data: {
        userId: this.currentUserId,
        planId: this.selectedPlanId,
        type: "subscription",
        startDate: startDate.toISOString(), // Convert start date to ISO string
        endDate: endDate.toISOString(), // Convert end date to ISO string
        currentSubscription: true // Mark the subscription as active
      }
    };

    // Send subscription data to the server
    this.service.subscribeToPlan(subscriptionData).subscribe({
      next: () => {
        alert('Subscription successful.');
        localStorage.removeItem('selectedPlanId'); // Clear the selected plan ID from local storage

        // Check if the subscription has already ended
        // console.log(endDate);
        // console.log(new Date());
        // console.log(endDate <= new Date());
        // if (endDate <= new Date()) {

        //   this.deactivateSubscription(subscriptionData._id);
        // } 

      },
      error: (err) => {
        console.error('Error subscribing:', err);
        alert('Subscription failed.');
      },
    });
  }  // Deactivate the subscription when it expires
  // deactivateSubscription(subscriptionId: string) {
  //   // First, fetch the current subscription document
  //   this.service.getSubscriptionById(subscriptionId).subscribe({
  //     next: (subscription) => {
  //       if (!subscription._rev) {
  //         console.error('Subscription not found.');
  //         return;
  //       }

  //       // Prepare the updated data with the latest `_rev`
  //       const updatedSubscription = {
  //         ...subscription, // Spread existing subscription data
  //         data: {
  //           ...subscription.data, // Preserve existing data
  //           currentSubscription: false, // Mark subscription as inactive
  //         },
  //         _rev: subscription._rev, // Ensure CouchDB recognizes the update
  //       };

  //       // Send the updated subscription back to CouchDB
  //       this.service.updateSubscription(subscriptionId, updatedSubscription).subscribe({
  //         next: () => {
  //           console.log('Subscription expired and deactivated.');
  //         },
  //         error: (err) => {
  //           console.error('Error updating subscription:', err);
  //         },
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error fetching subscription:', err);
  //     },
  //   });
  // }

  // Cancel the plan selection
  cancelPlan() {
    this.showPaymentForm = false;
    this.showPlans = true;
    this.selectedPlan = null;
  }
}