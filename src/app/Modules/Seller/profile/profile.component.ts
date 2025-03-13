import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,HttpClientModule,RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  providers:[HttpClient,AuthenticationService]
})
export class ProfileComponent implements OnInit {
  username: string | null = '';
  showLogoutConfirmation: boolean = false;

  constructor(readonly authService: AuthenticationService,readonly router: Router) { }

  ngOnInit(): void {
    if(typeof window !== 'undefined')
    {
      this.username = this.authService.getUserData();
      if(!this.username)
      {
        this.router.navigate(['seller-login'])
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