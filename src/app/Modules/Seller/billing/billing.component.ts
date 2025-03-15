import { Component, ElementRef, ViewChild } from '@angular/core';
import { SellerNavComponent } from "../seller-nav/seller-nav.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CouchdbService } from '../../../Services/couchdb.service';
import { AuthenticationService } from '../../../Services/authentication.service';
import Quagga from '@ericblade/quagga2';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [SellerNavComponent, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css',
  providers: [HttpClient, AuthenticationService, CouchdbService]
})
export class BillingComponent {
  @ViewChild('scannerContainer', { static: true }) scannerContainer!: ElementRef;              //Searches for an HTML element with the #scannerContainer reference in your template.

  constructor(
  
    readonly router: Router,
    readonly http: HttpClient,
    readonly authService: AuthenticationService,
    readonly service: CouchdbService
  ) { }

  scannedCode: string | null = null;
  selectedProduct: any = null;
  scannedProducts: any[] = [];
  totalCost: number = 0;
  detectedCode: any = 0;
  customerName: string = '';
  customerNo: string = '';
  currentUserId!: string;
  detectedListener: any;

  ngOnInit(): void {
    this.initializeScanner();

    if (typeof window !== 'undefined') {
      this.currentUserId = localStorage.getItem('currentUserId') || this.authService.currentUserId; // fetch current seller
      if (!this.currentUserId) {
        this.router.navigate(['/seller-login']); // Adjust the route as needed
        return;
      }
    }
  }

  isValidPhoneNumber(): boolean {
    const phoneNumber = this.customerNo;
    return /^[6-9][0-9]{9}$/.test(phoneNumber);
  }

  checkCustomer(): void {
    if (!this.isValidPhoneNumber()) {
      console.log("Invalid phone number");
      return;
    }
    
    if (this.customerNo) {
      this.service.getCustomerByPhone(this.customerNo).subscribe({
        next: (response: any) => {
          console.log("check customer",response);
          // check customer if already purchased
          if (response.rows.length > 0) {
            const customerData = response.rows[0].doc.data;
            this.customerName = customerData.customerName || ''; // Auto-fill the name if customer exists
           console.log("customer Name",this.customerName);
           
          } else {
            this.customerName = ''; // Clear the name if customer not found
          }
        
          
        },
        error: (error) => {
          console.error('Error fetching customer details:', error);
        }
      });
    }
  }

  initializeScanner(): void {
    if (!Quagga || typeof Quagga.init !== 'function') {
      console.error('Quagga is not properly loaded or initialized.');
      return;
    }

    try {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: this.scannerContainer.nativeElement,
            constraints: {
              width: 467,
              height: 300,
              facingMode: 'environment', //(uses the rear camera on devices).
            },
          },
          decoder: {
            readers: [
              'code_128_reader',
              'ean_reader',
              'ean_8_reader',
              'upc_reader',
              'upc_e_reader'
            ],
          },
        },
        (err: any) => {
          if (err) {
            console.error('Error initializing Quagga:', err);
            return;
          }
          Quagga.start();
        }
      );

      this.detectedListener = this.onBarcodeDetected.bind(this);
      Quagga.onDetected(this.detectedListener);
    } catch (error: any) {
      console.error('Error during scanner initialization:', error);
    }
  }

  //Prevents duplicate scan detection.
  onBarcodeDetected(result: any): void {
    if (result && result.codeResult)//i.e barcode number
    {
      console.log("result.codeResult.code",result.codeResult.code);  
      this.detectedCode = result.codeResult.code;
      if (this.detectedCode !== this.scannedCode) {
        this.scannedCode = this.detectedCode;
        console.log("Scanned Code:", this.scannedCode);
        this.getAllProducts(this.detectedCode);
        setTimeout(() => { this.scannedCode = null; }, 5000);
      }
    }
  }

  // get products as per scanned id
  getAllProducts(scannedBarcode: string): void {
    this.service.getAllProducts().subscribe({
      next: (response: any) => {
        console.log("All products", response);
        const product = response.rows.map((p: any) => p.doc)
          .find((p: any) => p.data.product_barcode_id === scannedBarcode);

        if (product) {
          const existingProduct = this.scannedProducts.find(p => p.data.product_barcode_id === scannedBarcode);
          if (existingProduct) {
            existingProduct.data.quantity += 1;
          } else {
            this.selectedProduct = product;
            product.data.quantity = 1;
            this.scannedProducts.push(product);
            console.log("Scanned products", this.scannedProducts);
          }
          this.updateTotalCost();
        } else {
          if (this.detectedCode.length === 13) {
            this.detectedCode = this.detectedCode.substring(1, 12);
            this.getAllProducts(this.detectedCode);
          } else {
            console.error('Product not found.');
            alert('Product not found.');
          }
        }
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
        alert('Error fetching product details.');
      }
    });
  }

  updateTotalCost(): void {
    this.totalCost = this.scannedProducts.reduce((sum, product) => {
      return sum + (product.data.productPrice * (product.data.quantity || 1)); // Ensure quantity is at least 1
    }, 0);
  }

  // generate bill
  generateBill(): void {

    if (!this.isValidPhoneNumber()) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!this.customerName.trim()) {
      alert("Please enter a customer name before generating the bill.");
      return;
    }
    if (this.scannedProducts.length === 0) {
      alert("No products added. Scan a product first.");
      return;
    }

    const billId = `billing_2_${uuidv4()}`;
    // for bill
    const orderSummary = {
      _id: billId,
      data: {
        userId: this.currentUserId,
        customerName: this.customerName,
        customerNo: this.customerNo,
        totalAmount: this.totalCost,
        date: new Date().toISOString().split('T')[0],
        type: "billing"
      }
    };

    this.service.saveBillingDetails(orderSummary).subscribe({
      next: (response) => {
        console.log("Bill header saved:", response);
        this.scannedProducts.forEach((product) => {
          const billingData = {
            // for invoices
            _id: `invoices_2_${uuidv4()}`,
            data: {
              billId: billId,
              productId: product._id,
              quantity: product.data.quantity,
              createdAt: new Date().toISOString(),
              type: "invoices"
            }
          };
          this.service.saveBillingDetails(billingData).subscribe({
            next: (response) => {
              console.log("Line item saved:", response);
              this.updateProductQuantity(product);
            },
            error: (err) => {
              console.error("Error saving line item:", err);
            },
          });
        });
        alert("Bill generated successfully!");
        this.resetForm()
      },
      error: (error) => {
        console.error("Error saving billing details:", error);
        alert("Error generating bill.");
      }
    });
  }
// update product quantity
  updateProductQuantity(product: any): void {
    this.service.getProductById(product._id).subscribe({
      next: (fetchedProduct: any) => {
        if (fetchedProduct && fetchedProduct.data) {
          const updatedQuantity = fetchedProduct.data.quantity - product.data.quantity;

          if (updatedQuantity < 0) {
            console.log(`Not enough stock for ${product.data.product_name}.`);
            alert(`Not enough stock for ${product.data.product_name}.`);
            return;
          }

          const updatedProduct = {
            ...fetchedProduct,
            data: {
              ...fetchedProduct.data,
              quantity: updatedQuantity,
            },
          };

          this.service.updateProduct(updatedProduct._id, updatedProduct).subscribe({
            next: (response) => {
              console.log(`Updated quantity for ${product.data.product_name}: ${updatedQuantity}`, response);
            },
            error: (err) => console.error("Error updating product quantity:", err),
          });
        } else {
          console.error("Product not found in database.");
        }
      },
      error: (error) => console.error("Error fetching product:", error),
    });
  }

  resetForm(): void {
    this.customerName = '';
    this.customerNo = '';
    this.scannedProducts = [];
    this.totalCost = 0;
    this.scannedCode = null;
    this.selectedProduct = null;
  }
  
}