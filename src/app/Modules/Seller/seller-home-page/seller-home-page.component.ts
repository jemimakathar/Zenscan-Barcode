import { Component } from '@angular/core';
import { SellerNavComponent } from '../seller-nav/seller-nav.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';

@Component({
  selector: 'app-seller-home-page',
  standalone: true,
  imports: [SellerNavComponent,FormsModule,HttpClientModule],
  templateUrl: './seller-home-page.component.html',
  styleUrl: './seller-home-page.component.css',
  providers:[HttpClient,AuthenticationService,CommonModule]
})
export class SellerHomePageComponent {
  currentUser!: string;

  constructor(readonly router: Router, readonly http: HttpClient,readonly authService:AuthenticationService) { }


  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentUser = localStorage.getItem('currentUser') ?? this.authService.currentUser;
      
      if (!this.currentUser) {
        this.router.navigate(['/seller-login']); 
        return;
      }
    }
  }

}
