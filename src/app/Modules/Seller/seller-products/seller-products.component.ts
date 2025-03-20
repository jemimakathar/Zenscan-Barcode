import { Component, AfterContentChecked } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SellerNavComponent } from "../seller-nav/seller-nav.component";
import { AuthenticationService } from '../../../Services/authentication.service';
import { v4 as uuidv4 } from 'uuid';
import { CouchdbService } from '../../../Services/couchdb.service';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SellerNavComponent],
  templateUrl: './seller-products.component.html',
  styleUrl: './seller-products.component.css',
  providers: [HttpClient,AuthenticationService,CouchdbService]
})
export class SellerProductsComponent implements AfterContentChecked {

  productName = '';
  productPrice:any
  productDescription = '';
  quantity:any
  productCategory = '';

  userDetails: any = [];
  userProducts: any = [];
  currentUser!: string;
  currentUserId!: string;

  showForm: boolean = false;
  editingProduct: any = null; // Track the product being edited
  userId = '';
  revision = '';
  productId = '';
  barcode = '';
  userName = '';

  data: any = [];

  categories: any[] = [];  // List of categories
  selectedCategory: string = ''; // Selected category for filtering
  selectedBarcodeType: string = 'ean-13';
  selectedBarcodeSize: any
  selectedBarcodeColor: any

  currentCategory: string | null = "";
  category: string = '';
  barcodeType: string = '';

  newCategoryName: string = '';
  newCategoryBarcodeType: string = 'code128';

  showProductForm: boolean = false;
  showLowStockProducts: boolean = true; 


  generatedProductId: string = '';

  constructor(readonly authService: AuthenticationService, readonly router: Router, readonly http: HttpClient,readonly service:CouchdbService) { }


  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentUser = localStorage.getItem('currentUser') ?? this.authService.currentUser;
      this.currentUserId = localStorage.getItem('currentUserId') ?? this.authService.currentUserId
      console.log("currentSeller", this.currentUserId);

      if (!this.currentUser) {
        this.router.navigate(['/seller-login']); // Adjust the route as needed
        return;
      }

      this.getAllProducts();
      this.fetchUserDetails();
      this.fetchCategories();

      
    }
  }
  ngAfterContentChecked()    //to change the backend value
  {
    if (typeof window != 'undefined')
      if (localStorage !== null)
      this.currentCategory = localStorage.getItem('SelectedCategory');
   console.log("Current Category :" , this.currentCategory);
    this.currentCategory = this.currentCategory?.toLowerCase() ?? "";
  }

  // Generate Product ID based on barcode type
  generateProductId(barcodeType: string): string {
    switch (barcodeType.toLowerCase()) {
      case 'ean13':
      case 'upca':
        return this.generateEanOrUpcaBarcode(barcodeType);
      case 'ean8':
        return this.generateEan8Barcode();
      case 'code128':
        return this.generateRandomDigits(10); // Variable length; here we use 10 as default
      default:
        throw new Error('Unsupported barcode type');
    }
  }
  // Generate random digits of a specific length
  generateRandomDigits(length: number): string {
    let digits = '';
    for (let i = 0; i < length; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    return digits;
  }


  // Generate valid EAN-13 or UPC-A barcode (refactored)
  generateEanOrUpcaBarcode(type: string): string {
    let length = type === 'ean13' ? 12 : 10; // EAN-13 uses 12, UPC-A uses 11
    let digits = this.generateRandomDigits(length);
    let checkDigit = this.calculateCheckDigit(digits, true);
    return digits + checkDigit;
  }


  // Generate valid EAN-8 barcode
  generateEan8Barcode(): string {
    let digits = this.generateRandomDigits(7);
    let checkDigit = this.calculateCheckDigit(digits, false);
    return digits + checkDigit;
  }


  //check digit calculation for EAN-8, EAN-13, and UPC-A
  calculateCheckDigit(digits: string, isEan13OrUpca: boolean): string {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let num = parseInt(digits[i], 10);
      if (isEan13OrUpca) {
        sum += (i % 2 === 0) ? num : num * 3; // EAN-13 & UPC-A logic (odd-1  even-3)
      } else {
        sum += (i % 2 === 0) ? num * 3 : num; // EAN-8 logic
      }
    }
    return ((10 - (sum % 10)) % 10).toString(); // Valid digit (0-9)
  }

  toggleProductForm() {
    this.showProductForm = !this.showProductForm;
  }

  cancelProductForm() {
    this.showProductForm = false;
    this.resetProductForm();
  }
  cancelRefill()
  {
    this.showLowStockProducts = false; 
  }

  // Toggle form visibility
  toggleForm() {
    this.showForm = !this.showForm;
    this.editingProduct = null;
  }

  toggleLowStockProducts() {
    this.showLowStockProducts = !this.showLowStockProducts;
  }

  // fetch categories
  fetchCategories() {
    this.service.fetchCategory().subscribe({
      next: (response: any) => {
        this.categories = response.rows.map((e: any) => e.doc)
          .filter((category: any) => this.currentUserId === category.data.userId && category.data.isDeleted=== false);
        console.log("cat", this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        alert('Error fetching categories');
      }
    });
  }

  onCategoryChange() {
    console.log("category", this.categories);
    const selectedCategory = this.categories.find(category => category.data.categoryName === this.productCategory);
    console.log("selectedCategory", selectedCategory);

    if (selectedCategory) {
      this.selectedBarcodeType = selectedCategory.data.barcodeType;
      console.log("this.selectedBarcodeType", this.selectedBarcodeType);

      this.selectedBarcodeSize = selectedCategory.data.barcodeSize;
      this.selectedBarcodeColor = selectedCategory.data.barcodeColor;
    }
  }
  // Add new product for the seller
  addNewProductForSeller() {
    console.log("type", this.selectedBarcodeType);

    const existingProduct = this.userProducts.find(
      (product: any) => product.data.productName.toLowerCase() === this.productName.toLowerCase()
    );

    if (existingProduct) {
      alert('Product already exists. Please update the existing product.');
      return;
    }

    this.generatedProductId = this.generateProductId(this.selectedBarcodeType);

    this.data = {
      _id: `product_2_${uuidv4()}`,
      data:
      {
        product_barcode_id: this.generatedProductId,
        userId: this.currentUserId,
        productName: this.productName,
        productPrice: this.productPrice,
        productDescription: this.productDescription,
        quantity: this.quantity,
        category: this.productCategory.toLowerCase(), // Convert category to lowercase
        status: 'in-stock',
        barcodeUrl: '',
        type: "product",
        barcodeType: this.selectedBarcodeType,
        barcodeSize: this.selectedBarcodeSize,
        barcodeColor: this.selectedBarcodeColor,
        isDeleted: false,
      }
    };
    this.connectToBackend(this.data);
  }


  // GET all products from service, exclude soft deleted products
  getAllProducts() {
    this.service.getAllProducts().subscribe({
      next: (response: any) => {
        // Filter out products that are marked as deleted
        this.userProducts = response.rows.map((e: any) => e.doc)
          .filter((product: any) => product.data.userId === this.currentUserId && !product.data.isDeleted);

        console.log("user products", this.userProducts);
      },
      error: (error) => {
        console.log("Error in getting products", error);
      }
    });
  }

  // validatePrice() {
  //   if (this.productPrice <= 0)  {
  //     this.productPrice = 0;
  //   }
  // }

  // validateQuantity()
  // {
  //   if(this.quantity<=0)
  //   {
  //     this.quantity=0;
  //   }
  // }


  // Filter products by category
  filterProductsByCategory(category: string) {
    this.selectedCategory = category.toLowerCase(); // Ensure selected category is lowercase
  }

  // Get filtered products based on selected category
  get filteredProducts() {
    if (!this.selectedCategory) {
      return this.userProducts;
    }
    return this.userProducts.filter((product: any) => product.data.categoryName.toLowerCase() === this.selectedCategory.toLowerCase());
  }

  // Filter products with quantity less than 5
  get lowStockProducts() {
    return this.userProducts.filter(
      (product: any) => product.data?.quantity !== undefined && product.data.quantity < 5
    );
  }
    

  refillProduct(product: any) {
    this.productName = product.data.productName;
    this.productPrice = product.data.productPrice;
    this.quantity = product.data.quantity; 
    this.productDescription = product.data.productDescription;
    this.productCategory = product.data.category;
    this.editingProduct = product;  
    this.showForm = true; 
  
    // Move the clicked product to the front of the list
    const index = this.userProducts.indexOf(product);//index of the product
    if (index !== -1) {
      this.userProducts.unshift(this.userProducts.splice(index, 1)[0]);
    }
  }
  


  // Edit an existing product
  editProduct(product: any) {
    this.productName = product.data.productName;
    this.productPrice = product.data.productPrice;
    this.quantity = product.data.quantity;
    this.productDescription = product.data.productDescription;
    this.productCategory = product.data.category;
    this.editingProduct = product;
  }
  
  // Update an existing product or restore a soft-deleted product
  updateProduct() {
    if (!this.editingProduct?._id) {
      alert("No product selected for editing.");
      return;
    }

    const updatedData = {
      ...this.editingProduct,
      _rev: this.editingProduct._rev,
      data: 
      {
        ...this.editingProduct.data,
        productName: this.productName,
        productPrice: this.productPrice,
        productDescription: this.productDescription,
        quantity: this.quantity,
        category: this.productCategory.toLowerCase(), // Convert category to lowercase
        isDeleted: false, // Mark the product as active again
      }
    };

    this.service.updateProduct(updatedData._id, updatedData).subscribe({
      next: (response) => {
        const index = this.userProducts.findIndex((product: any) => product._id === updatedData._id);
        if (index !== -1) {
          this.userProducts[index] = updatedData; // Update the product in the list
        }
        alert("Product updated successfully!");
        this.getAllProducts(); // Refresh the product list
        this.cancelEdit(); // Close the form
      },
      error: (error) => {
        console.error("Error updating product:", error);
        alert("Error updating product!");
      }
    });
  }

  // Cancel Editing
  cancelEdit() {
    this.resetProductForm();
    this.editingProduct = null;
    this.showForm = false;
  }

  // Soft delete a particular product
  deleteProduct(product: any) {
    const productId = product._id;
    const productRev = product._rev; // Required for CouchDB revision

    // Update the product to mark it as deleted
    const updatedProduct = {
      ...product,
      _rev: productRev,
      data: {
        ...product.data,  
        isDeleted: true, // Mark the product as deleted
      }
    };

    this.service.updateProduct(productId, updatedProduct).subscribe({
      next: (response) => {
        // Remove the product from the UI list, as it is marked as deleted
        this.userProducts = this.userProducts.filter((p: any) => p._id !== productId);
        alert('Product deleted Successfully');
        this.getAllProducts(); // Refresh the product list to reflect the changes
      },
      error: (error) => {
        console.error('Error marking product as deleted:', error);
        alert('Error deleting product');
      }
    });
  }


  // Reset the product form
  resetProductForm() {
    this.productName = '';
    this.productPrice = 0;
    this.productDescription = '';
    this.quantity = 1;
    this.productCategory = '';
    
  }

  // Fetch user details before connecting to the backend
  fetchUserDetails() {
    this.authService.fetchUser().subscribe({
      next: (response: any) => {
        this.userDetails = response; // Assuming the response contains the user details
        console.log("user details", this.userDetails);
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        alert('Error fetching user details!');
      }
    });
  }


  // Connect to backend for barcode generation
  connectToBackend(product: any) {
    console.log("connect");
    console.log(product);

    const backendUrl = `http://localhost:3000/generate-barcode/${product.data.product_barcode_id}?type=${product.data.barcodeType}&size=${product.data.barcodeSize}&color=${product.data.barcodeColor.replace('#', '')}`;

    console.log(backendUrl);

    this.http.get<any>(backendUrl).subscribe({
      next: (response) => {
        console.log("response");

        console.log(response.barcodeUrl);
        this.barcode = response.barcodeUrl
        // Ensure userDetails is populated and contains the current seller
        console.log(this.userDetails);
        this.data.data.barcodeUrl = response.barcodeUrl;

        this.service.addProductForParticularSeller(this.data).subscribe({
          next: (response) => {
            this.userProducts.push(response); // Add the new product to the list
            console.log("response", response);
            alert('Product added successfully!');
            this.cancelProductForm()
            this.resetProductForm();    
            this.getAllProducts();
          },
          error: (error) => {
            alert('Error adding product.');
          }
        });
      },
      error: (error) => {
        console.error('Error connecting to backend:', error);
        alert('Failed to connect to backend');
      }
    });
  }


  printBarcode(barcodeUrl: string) {
    if (!barcodeUrl) {
      alert('No barcode available to print.');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body { text-align: center; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h2>Product Barcode</h2>
            <img src="${barcodeUrl}" alt="Product Barcode">
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert('Failed to open print window.');
    }
  }
}