// seller-nav.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-seller-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './seller-nav.component.html',
  styleUrl: './seller-nav.component.css',
  providers: [HttpClient, AuthenticationService]
})
export class SellerNavComponent implements OnInit {
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

  nullCategory() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('SelectedCategory', 'null');
      this.router.navigate(['/seller-product']);
    }
  }
}