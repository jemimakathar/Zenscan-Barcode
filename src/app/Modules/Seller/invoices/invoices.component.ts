import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SellerNavComponent } from "../seller-nav/seller-nav.component";
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';
import { response } from 'express';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SellerNavComponent],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
  providers: [HttpClient,CouchdbService, AuthenticationService]
})
export class InvoicesComponent implements OnInit {
  billHeaders: any[] = [];
  invoices: any[] = [];
  selectedBill: any = null;
  selectedInvoices: any[] = [];
  products: any[] = [];
  currentUserId: string = '';
  
  constructor(
    readonly service: CouchdbService,
    readonly HttpClient: HttpClient,
    readonly router: Router,
    readonly authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.currentUserId = localStorage.getItem('currentUserId') || this.authService.currentUserId; // fetch current seller
      console.log("currentUser", this.currentUserId);

      if (!this.currentUserId) {
        this.router.navigate(['/seller-login']); // Adjust the route as needed
        return;
      }
      this.fetchBillHeaders();
      this.fetchAllProducts();
    }
  }

  closePurchasedProducts() {
    this.selectedInvoices = [];
  }

  // Fetch all bill headers
  fetchBillHeaders(): void {
    this.currentUserId = localStorage.getItem('currentUserId') ?? this.service.currentUserId;
  
    this.service.getBillingDetailsByUserId(this.currentUserId).subscribe({
      next: (response: any) => {
        console.log("the",response);
        this.billHeaders = response.rows.map((row: any) => row.doc).sort((a: any, b: any) => { 
          const dateA = new Date(a.data.date).getTime();
          const dateB = new Date(b.data.date).getTime();
          return dateB - dateA;
        });
        this.fetchInvoices();
        console.log('Bill Headers:', this.billHeaders);
      },
      error: (error) => {
        console.error('Error fetching filtered bill headers:', error);
      }
    });
  }
  
  // Fetch all invoice details
  fetchInvoices(): void {
    this.billHeaders.forEach((billId:any)=>{
      this.service. getInvoicesByBillId(billId._id).subscribe({
        next: (response: any) => {
          console.log("res",response);
          response.rows.forEach((productId : any) => this.invoices.push(productId.value)) 
          console.log("productId",this.invoices);   
          this.fetchAllProducts();
        },
        error: (error) => console.log('Error fetching invoices:', error)
      });
    })
  }

  // Fetch all products
  fetchAllProducts(): void {
    this.service.getAllProducts().subscribe({
      next: (response: any) => {
        this.products = response.rows.map((row: any) => row.doc); // Assuming products are in `value`
        console.log('Products:', this.products);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  // View invoice details when clicking on a bill
  viewInvoiceDetails(bill: any): void {
    this.selectedBill = bill;
    this.selectedInvoices = this.invoices
      .filter(invoice => invoice.data.billId === bill._id)
      .map(invoice => ({
        ...invoice,
        product: this.products.find(p => p._id === invoice.data.productId) || null
      }));
  }

}