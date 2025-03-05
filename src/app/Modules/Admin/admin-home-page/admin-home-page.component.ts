import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';

@Component({
  selector: 'app-admin-home-page',
  standalone: true,
  imports: [FormsModule,HttpClientModule],
  templateUrl: './admin-home-page.component.html',
  styleUrl: './admin-home-page.component.css',
  providers:[HttpClient,CommonModule,AuthenticationService]
})
export class AdminHomePageComponent {

  currentUser!: string;
  currentUserId!: string;

  constructor(readonly router: Router, readonly http: HttpClient,readonly authService:AuthenticationService) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentUser = localStorage.getItem('currentUser') || this.authService.currentUser;
      
      if (!this.currentUser) {
        this.router.navigate(['/seller-login']); 
        return;
      }
    }
  }

  startAdministration() {
    this.router.navigate(['/admin-page']);
  }
  

}
