import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SellerNavComponent } from "../seller-nav/seller-nav.component";
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';

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
      this.fetchInvoices();
      this.fetchAllProducts();
    }
  }

  closePurchasedProducts() {
    this.selectedInvoices = [];
  }

  // Fetch all bill headers
  fetchBillHeaders(): void {
    this.service.getBillingDetailsFromBillHeader().subscribe({
      next: (response: any) => {
        this.billHeaders = response.rows.map((row: any) => row.doc)
          .filter((bill: any) => bill.data.userId === this.currentUserId).sort((a:any,b:any)=>{
            const dateA =new Date(a.data.date).getTime();
            const dateB = new Date(b.data.date).getTime();
            return dateB - dateA;

          })
        console.log('Bill Headers:', this.billHeaders);
      },
      error: (error) => {
        console.error('Error fetching bill headers:', error);
      }
    });
  }

  // Fetch all invoice details
  fetchInvoices(): void {
    this.service.getBillingDetailsFromInvoice().subscribe({
      next: (response: any) => {
        this.invoices = response.rows.map((row: any) => row.doc).filter((bill: any) => bill);
        console.log('Invoices:', this.invoices);  
      },
      error: (error) => {
        console.error('Error fetching invoices:', error);
      }
    });
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