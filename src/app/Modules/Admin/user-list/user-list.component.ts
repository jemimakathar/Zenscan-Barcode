import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';
import { AdminNavComponent } from "../admin-nav/admin-nav.component";


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, AdminNavComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
  providers:[HttpClient,AuthenticationService,CouchdbService]
})
export class UserListComponent {
users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  subscriptionDetails: any[] = [];
  planDetails: any;
  showActiveUsers: boolean = true;     // default: show active users
  showInactiveUsers: boolean = true;   // default: show inactive users

  constructor(readonly authService: AuthenticationService, readonly service: CouchdbService) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.getSubscriptionDetails();
    this.getPlanDetails();
  }

  fetchUsers() {
    this.authService.fetchUser().subscribe({
      next: (response) => {
        this.users = response.rows.map((row: any) => row.doc);
        this.filteredUsers = this.users.filter(user => user.data.role === 'user');
        this.mapSubscriptionDetailsToUsers();
      },
      error: (error) => {
        console.log('Error fetching Users:', error);
      }
    });
  }

  getSubscriptionDetails() {
    this.service.getSubscription().subscribe({
      next: (response) => {
        this.subscriptionDetails = response.rows.map((row: any) => row.doc);
        this.mapSubscriptionDetailsToUsers();
      },
      error: (error) => {
        console.log('Error fetching Subscription:', error);
      }
    });
  }

  getPlanDetails() {
    this.service.getAllPlans().subscribe({
      next: (response) => {
        this.planDetails = response.rows.map((row: any) => row.doc);
        this.mapSubscriptionDetailsToUsers();
      }
    });
  }

  mapSubscriptionDetailsToUsers() {
    this.filteredUsers.forEach((user, indexValue) => {
      const subscription = this.subscriptionDetails.find(users => users.data.userId === user._id);

      if (subscription?.data?.currentSubscription) {
        this.filteredUsers[indexValue].data.subscriptionStatus = 'Active';
        const particularPlan = this.planDetails.find((plan: any) => plan._id === subscription.data.planId);
        this.filteredUsers[indexValue].data.planName = particularPlan?.data?.planName || 'Unknown Plan';
      } else {
        this.filteredUsers[indexValue].data.subscriptionStatus = 'Inactive';
        this.filteredUsers[indexValue].data.planName = 'No Subscription';
      }
    });

    this.filterUser(); // apply filter after mapping
  }

  // Updated filterUser method
  filterUser() {
    const term = this.searchTerm.toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        user.data.role === 'user' &&
        (user.data.username.toLowerCase().includes(term) ||
          user.data.email.toLowerCase().includes(term) ||
          user.data.company.toLowerCase().includes(term) ||
          (user.data.planName?.toLowerCase().includes(term)));

      const isActive = user.data.subscriptionStatus === 'Active';
      const isInactive = user.data.subscriptionStatus === 'Inactive';

      const matchesStatus =
        (this.showActiveUsers && isActive) ||
        (this.showInactiveUsers && isInactive);

      return matchesSearch && matchesStatus;
    });
  }
}
