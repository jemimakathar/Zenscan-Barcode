import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {  RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from "../../Seller/profile/profile.component";

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule, ProfileComponent],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.css',
  providers:[HttpClient,AuthenticationService]
})
export class AdminNavComponent {


}
