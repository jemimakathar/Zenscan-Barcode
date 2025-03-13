import { Component } from '@angular/core';
import { AdminNavComponent } from "../admin-nav/admin-nav.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [AdminNavComponent,CommonModule,RouterModule,FormsModule,HttpClientModule],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css',
  providers:[HttpClient,AuthenticationService,CouchdbService]
})
export class PaymentListComponent {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  subscriptionDetails:any[]=[]
  planDetails:any;


  constructor(readonly authService:AuthenticationService,readonly service:CouchdbService)
  {}

  ngOnInit(): void {
    this.fetchUsers();
    this.getPlanDetails();
    this.getSubscriptionDetails();
  }


  fetchUsers() {
    this.authService.fetchUser().subscribe({
      next: (response) => {
        this.users = response.rows.map((row: any) => row.doc); // Extracting documents

        // Only include users with the role "user"
        this.filteredUsers = this.users.filter(user => user.data.role === 'user');
        console.log("Data from DB", this.filteredUsers);
        this.mapSubscriptionDetailsToUsers(); 
      },
      error: (error) => {
        console.log('Error fetching Users:', error);
      }
    });
  }

 
  getSubscriptionDetails()
  {
    this.service.getSubscription().subscribe({
      next:(response)=>{
        this.subscriptionDetails=response.rows.map((row:any)=>row.doc)
        console.log("subscriptionDetails",this.subscriptionDetails);  
        this.mapSubscriptionDetailsToUsers(); 
          
      },
      error: (error) => {
        console.log('Error fetching Subscription:', error);
      }
    })
  }

  
  getPlanDetails()
  {
    this.service.getAllPlans().subscribe({
      next:(response)=>{
        this.planDetails=response.rows.map((row:any)=>row.doc)
        console.log(this.planDetails);
        
         this.mapSubscriptionDetailsToUsers(); 
      }
    })
  }


  mapSubscriptionDetailsToUsers() {
    this.filteredUsers = this.users
      .filter(user => user.data.role === 'user') // Ensure only users are processed
      .map(user => {
        const subscription = this.subscriptionDetails.find(sub => sub.data.userId === user._id);
    
        if (subscription?.data?.currentSubscription) {
          let particularPlan = this.planDetails.find((plan:any) => plan._id === subscription.data.planId);
          
          return {
            ...user,
            data: {
              ...user.data,
              subscriptionDate:subscription.data.startDate,
              planName: particularPlan?.data?.planName,
              price: particularPlan?.data?.price
            }
          };
        } else {
          return null; // Remove users with "No Payment" and "No Plan"
        }
      })
      .filter(user => user !== null); // Remove null values
  
    console.log("Filtered Users:", this.filteredUsers);
  }  
}



