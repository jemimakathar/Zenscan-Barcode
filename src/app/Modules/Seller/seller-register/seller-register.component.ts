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
  user = {
    name: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    userType: 'user'
  };

  isFormSubmitted = false;
  users: any[] = [];
  emailExists = false;

  // password rules
  isPasswordValidLength = false;
  hasSpecialChar = false;
  hasCapitalLetter = false;
  hasNumber = false;

  // Password visibility
  showPassword = false;
  showConfirmPassword = false;

  constructor(readonly authService: AuthenticationService, readonly router: Router) {}

  onEmailOrUsernameChange() {
    if (this.user.email.length != 0) this.checkSellerExists();
  }

  checkSellerExists() {
    this.authService.checkSellerExists(this.user.email).subscribe({
      next: (response) => {
        this.emailExists = response.rows.some((row: any) => row.key === this.user.email);
      },
      error: (error) => {
        console.error("Error checking email/username:", error.message);
      }
    });
  }

  registerUser(dataRegister: NgForm) {
    this.isFormSubmitted = true;

    if (!dataRegister.valid || !this.confirmPassword() || !this.isPasswordChecked() || this.emailExists) {
      return;
    }

    const data: any = {
      _id: `user_2_${uuidv4()}`,
      data: {
        username: this.user.name,
        email: this.user.email,
        company: this.user.companyName,
        password: this.user.password,
        confirmPassword: this.user.confirmPassword,
        userStatus: "unblock",
        role: 'user',
        type: "user",
      }
    };

    this.authService.registerUser(data).subscribe({
      next: () => {
        alert(`🎉 Registration Successful!`);
        this.resetForm();
        this.router.navigate(['/seller-login']);
      },
      error: (error) => {
        alert("Error");
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

  // password validation
  validatePassword() {
    const password = this.user.password;
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    this.hasCapitalLetter = /[A-Z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.isPasswordValidLength = password.length >= 8;
  }

  confirmPassword(): boolean {
    return this.user.password === this.user.confirmPassword;
  }

  isPasswordChecked() {
    return this.hasCapitalLetter && this.hasSpecialChar && this.hasNumber && this.isPasswordValidLength;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
