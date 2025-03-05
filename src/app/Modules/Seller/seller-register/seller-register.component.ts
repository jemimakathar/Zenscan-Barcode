import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationService } from '../../../Services/authentication.service';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './seller-register.component.html',
  styleUrl: './seller-register.component.css',
  providers: [AuthenticationService, HttpClient]
})
export class SellerRegisterComponent {
  user =
    {
      name: '',
      email: '',
      companyName: '',
      password: '',
      confirmPassword: '',
      userType: 'user'
    };



  isFormSubmitted = false
  users: any[] = []
  emailExists = false;

  // password
  isPasswordValidLength = false;
  hasSpecialChar = false;               
  hasCapitalLetter = false;
  hasNumber = false;

  constructor(readonly authService:AuthenticationService, readonly router: Router) {
    
  }

  onEmailOrUsernameChange() {
    if(this.user.email.length !=0)
    this.checkSellerExists();
  }


  checkSellerExists() {
    console.log(this.user.email);
    
    this.authService.checkSellerExists(this.user.email).subscribe({
      next: (response) => {
        this.emailExists = false;
        console.log(response);
        
        response.rows.forEach((row: any) => {
          if (row.key === this.user.email) {
            this.emailExists = true;
          }

        });
        console.log(this.emailExists);
        
      },
      error: (error) => {
        console.error("Error checking email/username:", error.message);
      }
    });
  }

 

 


    // Register User with Free Trial
  registerUser(dataRegister: NgForm) {
    this.isFormSubmitted = true
   

    if (!dataRegister.valid || !this.confirmPassword() || !this.isPasswordChecked()  || this.emailExists) {
      return;
    }
    // const trialStartDate = new Date().toISOString();
    // const trialEndDate = new Date();
    // trialEndDate.setDate(new Date().getDate() + 1); // 2-day trial
    // const trialEndDateStr = trialEndDate.toISOString(); // Convert to string // Add 7 days

    // // Store trial info in localStorage
    // localStorage.setItem('freeTrialStart', trialStartDate);
    // localStorage.setItem('freeTrialEnd', trialEndDateStr);
      
        

    const data: any = {
      _id: `user_2_${uuidv4()}`,
      data: {
        username: this.user.name,
        email: this.user.email,
        company: this.user.companyName,
        password: this.user.password,
        confirmPassword: this.user.confirmPassword,
        status: "Register",
        // currentSubscription:false,
        userStatus: "unblock",
        // freeTrialStart: trialStartDate, 
        // freeTrialEnd: trialEndDateStr,
        
        role: 'user',
        type: "user",
      }

    };
    this.authService.registerUser(data).subscribe({
      next: (response) => {
        alert(`🎉 Registration Successful!`);
              // Store the currentUserId in localStorage
      // localStorage.setItem('currentUserId', data._id); // Use the generated _id
      // console.log("currentUserId stored:", data._id);
      // this.authService.currentUserId = data._id;

        this.resetForm();
        this.router.navigate(['/seller-login']);
      },
      error: (error) => {
        alert("Error")
        console.log("error message", error.message);
      }
    });

  }

  resetForm() {
    this.user = {

      name: '',
      email: '',
      companyName: '',
      password: '',
      confirmPassword: '',
      userType: "user"

    };
  }


  // for password
  validatePassword() {
    const password = this.user.password;
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);//test-true or false
    this.hasCapitalLetter = /[A-Z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.isPasswordValidLength = password.length >= 8;
  }

  confirmPassword(): boolean {
    return this.user.password === this.user.confirmPassword
  }
  // validate the password
  isPasswordChecked() {
    return this.hasCapitalLetter && this.hasSpecialChar && this.hasNumber && this.isPasswordValidLength
  }
}



