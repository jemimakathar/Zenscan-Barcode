import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {  Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.css',
  providers:[HttpClient,AuthenticationService]
})
export class AdminNavComponent {
  username: string | null = '';
  showLogoutConfirmation: boolean = false;

  constructor(
    readonly authService: AuthenticationService,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.username = this.authService.getUserData();
      if (!this.username) {
        this.router.navigate(['seller-login']);
      }
    }
  }

  getInitial(): string {
    return this.username ? this.username.charAt(0).toUpperCase() : '';
  }

  openLogoutConfirmation(): void {
    this.showLogoutConfirmation = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.username = '';
    this.showLogoutConfirmation = false;
    this.router.navigate(['']);
  }

  cancelLogout(): void {
    this.showLogoutConfirmation = false;
  }
}
