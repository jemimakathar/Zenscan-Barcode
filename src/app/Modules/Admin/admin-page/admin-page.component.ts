import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';


@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
  providers: [HttpClient,AuthenticationService,CouchdbService]
})
export class AdminPageComponent {

  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';

  // pricing-plan
  formVisible = false; // Controls form visibility
  fetchAllPlan: any = [];
  newPlan: any = {
    _id: '',
    data: {
      planName: '',
      description: '',
      price: 0,
      duration: '',
      createdAt: '',
      deleted: false,
      type: "pricing"
    }
  };

  isEditing: boolean = false;

  constructor(readonly service:CouchdbService,readonly authService:AuthenticationService) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchAllPlans();
  }

  fetchUsers() {
    this.authService.fetchUser().subscribe({
      next: (response) => {
        this.users = response.rows.map((row: any) => row.doc); // Extracting documents

        // Only include users with the role "user"
        this.filteredUsers = this.users.filter(user => user.data.role === 'user');

        console.log("Data from DB", this.filteredUsers);
      },
      error: (error) => {
        console.log('Error fetching sellers:', error);
      }
    });
  }

  // for search the user
  filterUser() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.data.username.toLowerCase().includes(term) ||
        user.data.email.toLowerCase().includes(term) ||
        user.data.company.toLowerCase().includes(term)
    );
  }

  toggleSellerStatus(user: any) {
    const newStatus = user.data.userStatus === 'unblock' ? 'Blocked' : 'unblock';
    // Update seller object with the new status
    const updatedSeller = {
      ...user,
      data: {
        ...user.data,
        userStatus: newStatus
      }
    };

    console.log("Updating seller status:", updatedSeller);

    this.authService.updateUserStatus(user._id, updatedSeller).subscribe({
      next: (response) => {
        console.log(response);
        alert("updated seller status")
        this.users = []
        this.fetchUsers();
      },
      error: (error) => {
        console.error(`Error updating seller status:`, error);
        alert('Failed to update seller status. Please try again.');
      },
    });

  }

  // plans

  openForm() {
    this.formVisible = true; // Show the form as a modal
    this.isEditing = false;
    this.newPlan = {
      _id: `pricing_2_${uuidv4()}`,
      data: {
        planName: '',
        description: '',
        price: 0,
        duration: '',
        createdAt: new Date().toISOString().split('T')[0],
        type: "pricing"
      }
    };
  }

  closeForm() {
    this.formVisible = false; // Hide the modal
  }

  addPlan() {
    if (this.newPlan.data.price < 0) {
      alert("Price cannot be negative.");
      return;
    }

    const planData = {
      ...this.newPlan,
    };
    this.service.addPlan(planData).subscribe({
      next: () => {
        alert('Plan added successfully.');
        this.newPlan = {
          _id: `pricing_2_${uuidv4()}`,
          data: {
            planName: '',
            description: '',
            price: 0,
            duration: '',
            createdAt: new Date().toISOString().split('T')[0],
            deleted: false,
            type: "pricing"
          }
        };
        this.formVisible = false;
        this.fetchAllPlans(); // Refresh list after adding a plan
      },
      error: (err) => {
        console.error('Error adding plan:', err);
        alert('Failed to add plan. Please try again.');
      },
    });
  }

  fetchAllPlans() {
    this.service.getAllPlans().subscribe({
      next: (response) => {
        this.fetchAllPlan = response.rows.map((row: any) => row.doc).filter((plan: any) => !plan.data.deleted);
        console.log("plan", this.fetchAllPlan);
      },
      error: (error) => {
        console.log("Error in fetching Plans");
        alert("Error in fetching Plans");
      }
    });
  }



  editPlan(plan: any) {

    this.isEditing = true;
    this.formVisible = true;
    this.newPlan = { ...plan };

    localStorage.setItem('selectedPlan', plan._id);
  }

  updatePlan() {
    if (this.newPlan.data.price < 0) {
      alert("Price cannot be negative.");
      return;
    }


    this.service.updatePlans(this.newPlan._id, this.newPlan).subscribe({
      next: () => {
        alert('Plan updated successfully.');
        this.newPlan = {
          _id: `pricing_2_${uuidv4()}`,
          data: {
            planName: '',
            description: '',
            price: 0,
            duration: '',
            createdAt: new Date().toISOString().split('T')[0],
            type: "pricing"
          }
        };
        this.formVisible = false;
        this.fetchAllPlans(); // Refresh list after updating a plan
      },
      error: (err) => {
        console.error('Error updating plan:', err);
        alert('Failed to update plan. Please try again.');
      },
    });
  }

  deletePlan(plan: any) {
    if (confirm('Are you sure you want to delete this plan?')) {
      plan.data.deleted = true; // Soft delete by setting the deleted flag to true
      this.service.updatePlans(plan._id, plan).subscribe({
        next: () => {
          alert('Plan deleted successfully.');
          this.fetchAllPlans(); // Refresh the list after soft deleting
        },
        error: (err) => {
          console.error('Error deleting plan:', err);
          alert('Failed to delete plan. Please try again.');
        },
      });
    }
  }
}