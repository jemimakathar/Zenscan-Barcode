import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';

@Component({
  selector: 'app-seller-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './seller-login.component.html',
  styleUrl: './seller-login.component.css',
  providers: [HttpClient, AuthenticationService, CouchdbService]
})
export class SellerLoginComponent {
  userEmail: string = "";
  userPassword: string = "";
  isFormSubmitted = false;
  emailError: string = '';
  passWordError: string = '';
  showPassword: boolean = false;


  constructor(
    readonly service: CouchdbService,
    readonly authService: AuthenticationService,
    readonly router: Router
  ) { }

  // Toggle visibility functions
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  userLogin(userData: NgForm) {
    this.isFormSubmitted = true;

    if (userData.valid) {
      this.authService.fetchUser().subscribe({
        next: (response) => {
          console.log(response);

          const users = response.rows.map((row: any) => row.doc);
          console.log("users", users);

          let isAuthenticated = false;

          // Find the user matching the email
          const user = users.find((s: any) => s.data.email === this.userEmail);

          if (!user) {
            this.emailError = "Email is incorrect";
            return;
          }

          if (user.data.password !== this.userPassword) {
            this.passWordError = "Password is incorrect";
            return;
          }
          console.log("user", user);

          if (user) {
            isAuthenticated = true;

            // If user is an admin, skip subscription check
            if (user.data.role === 'admin') {
              alert("✅ Admin login successful!");

              this.authService.setUserData(user.data.username,user._id);
              localStorage.setItem('currentUser', user.data.username);
              this.router.navigate(['/admin-homePage']); // Navigate to Admin Dashboard
              return;
            }
            // Store user details in localStorage
            this.authService.setUserData(user.data.username,user._id);
            this.authService.currentUserId = user._id;
            localStorage.setItem('currentUser', user.data.username);
            localStorage.setItem('currentUserId', user._id);
            console.log("currentUser", user._id);


            // Check subscription status
            this.service.getSubscription().subscribe({
              next: (subscriptionResponse) => {
                const subscriptions = subscriptionResponse.rows.map((row: any) => row.doc);
                const userSubscription = subscriptions.find((sub: any) => sub.data.userId === user._id);

                // If no subscription or subscription is inactive, navigate to pricing page
                if (!userSubscription || userSubscription.data.currentSubscription === false) {
                  alert('No active subscription found. Please subscribe.');
                  this.router.navigate(['/pricing']);
                  return;
                }

                // Check if the subscription has expired
                const now = new Date();
                const endDate = new Date(userSubscription.data.endDate);

                if (endDate <= now) {
                  // Subscription has expired, deactivate it
                  const updatedSubscription = {
                    _id: userSubscription._id,
                    _rev: userSubscription._rev,
                    data: {
                      ...userSubscription.data,
                      currentSubscription: false, // Mark subscription as inactive
                    },
                  };

                  this.service.updateSubscription(userSubscription._id, updatedSubscription).subscribe({
                    next: () => {

                      alert('Your subscription has expired. Please renew your subscription.');
                      this.router.navigate(['/pricing']); // Navigate to pricing page
                    },
                    error: (err) => {
                      console.error('Error updating subscription:', err);
                      alert('Error deactivating subscription.');
                    },
                  });
                  return; // Stop further execution
                }
                alert("Login successful!");
                this.reset(userData);

                if (user.data.role === 'admin') {
                  this.router.navigate(['/admin-homePage']); // Admin Dashboard
                } else {
                  this.router.navigate(['/dash-board']); // Seller Dashboard
                }
              },
              error: (err) => {
                console.error("Error fetching subscription:", err);
                alert("Error while fetching subscription data.");
              }
            });
          }

          if (!isAuthenticated) {
            alert('Invalid Login. Please check your username and password.');
          }
        },
        error: (err) => {
          console.error("Error fetching users:", err);
          alert("Error while fetching data.");
        },
      });
    }
  }

  reset(userData: NgForm) {
    this.isFormSubmitted = false;
    this.userEmail = '';
    this.userPassword = '';
  }
}