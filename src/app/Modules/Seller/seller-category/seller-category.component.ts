import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SellerNavComponent } from '../seller-nav/seller-nav.component';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';

enum BarcodeType {
  EAN13 = 'ean13',
  EAN8 = 'ean8',
  UPCA = 'upca',
  CODE128 = 'code128'
}

@Component({
  selector: 'app-seller-category',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SellerNavComponent],
  templateUrl: './seller-category.component.html',
  styleUrls: ['./seller-category.component.css'],
  providers: [HttpClient, AuthenticationService, CouchdbService],
})
export class SellerCategoryComponent implements OnInit {
  // ngModel
  showCategoryForm = false;
  newCategoryName: string = '';
  newCategoryBarcodeType: BarcodeType = BarcodeType.CODE128;
  newCategory: any;
  newCategorySize = 'medium';
  newCategoryColor = '#000000';
  barcodePreview: any;
  barcodePreviewUrl: string = '';

  type = "category"
  categories: any[] = [];
  fetchCategories: any
  userDetails: any
  currentUser!: string;
  currentUserId!: string;
  userProducts: any[] = [];

  constructor(readonly authService: AuthenticationService, readonly router: Router, readonly http: HttpClient, readonly service: CouchdbService) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.currentUser = localStorage.getItem('currentUser') || this.authService.currentUser; // fetch current seller
      this.currentUserId = localStorage.getItem('currentUserId') ?? this.authService.currentUserId
      console.log(this.currentUserId);

      if (!this.currentUser) {
        this.router.navigate(['/seller-login']); // Adjust the route as needed
        return;
      }

      this.getAddedCategory();    // Fetch categories when the component loads
      this.getSellerProducts();
    }
  }

  // Show Category Form
  toggleCategoryForm() {
    this.showCategoryForm = !this.showCategoryForm;
  }

  // Generate Barcode Preview
  generateBarcodePreview() {
    // Generate barcode preview based on the selected category name and type
    const barcodeType = this.newCategoryBarcodeType;
    let sampleValue: string | number;

    switch (barcodeType) {
      case BarcodeType.EAN13:
        sampleValue = '4006381333931';  // EAN-13 example
        break;
      case BarcodeType.EAN8:
        sampleValue = '96385074';  // EAN-8 example
        break;
      case BarcodeType.UPCA:
        sampleValue = '036000291452';  // for UPC-A
        break;
      case BarcodeType.CODE128:
        sampleValue = '123456789';  // Code-128
        break;
      default:
        alert('Unsupported barcode type');
        return;
    }

    const size = this.newCategorySize;
    const color = this.newCategoryColor.replace('#', '');
    const backendUrl = `http://localhost:3000/generate-barcode/${sampleValue}?type=${barcodeType}&size=${size}&color=${color}`;

    this.http.get<any>(backendUrl).subscribe({
      next: (response) => {
        console.log(response.barcodeUrl); // Log the barcode URL
        this.barcodePreviewUrl = response.barcodeUrl; // Assign the URL to the preview variable
      },
      error: (err) => {
        console.error('Error generating barcode', err);
        alert('Error generating barcode preview');
      },
    });
  }

  // Add New Category
  addNewCategory() {
    if (this.newCategoryName.trim() !== '') {

      // Check if the category already exists
      const isCategoryExists = this.fetchCategories.some((category: any) =>
        category.data.categoryName.toLowerCase() === this.newCategoryName.toLowerCase());

      if (isCategoryExists) {
        alert('Category already exists');
        return;
      }

      this.newCategory = {
        _id: `category_2_${uuidv4()}`,
        data: {
          userId: this.currentUserId,
          categoryName: this.newCategoryName,
          barcodeType: this.newCategoryBarcodeType,
          barcodeUrl: this.barcodePreviewUrl,
          barcodeSize: this.newCategorySize,
          barcodeColor: this.newCategoryColor,
          type: this.type,
          isDeleted: false
        }
      };

      this.service.addCategory(this.newCategory).subscribe({
        next: (response) => {
          alert('Category added successfully');
          this.categories.push(this.newCategory);
          this.resetForm();
          this.getAddedCategory();
        },
        error: (error) => {
          alert('Error adding category');
        },
      });
    }
  }

  // Fetch Categories
  getAddedCategory() {
    this.categories = [];

    this.service.fetchCategory().subscribe({
      next: (response: any) => {
        this.fetchCategories = response.rows.map((e: any) => e.doc).filter((category: any) => {
          return category.data.userId == this.currentUserId && category.data.isDeleted === false;
        });
        console.log("all categories", this.fetchCategories);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        alert('Error fetching categories');
      }
    });
  }

  navigateToProduct(categoryName: string) {
    if (typeof window != 'undefined')
      localStorage.setItem("SelectedCategory", categoryName)
    console.log("Category", categoryName);
    this.router.navigate(['/seller-product']);
  }

  // Reset Form
  resetForm() {
    this.newCategoryName = '';
    this.newCategoryBarcodeType = BarcodeType.CODE128;
    this.barcodePreviewUrl = '';
    this.showCategoryForm = false;
    this.newCategorySize = 'medium';
    this.newCategoryColor = '#000000';
  }

  softDeleteCategory(category: any) {
    this.service.deleteCategory(category).subscribe({
      next: (response) => {
        alert('Category Deleted Successfully');
        this.fetchCategories = this.fetchCategories.filter((p: any) => p._id !== category._id);
        this.softDeleteProductsByCategory(category.data.categoryName.toLowerCase());
        console.log("category.data.categoryName", category.data.categoryName);
      },
      error: (error) => {
        console.error('Error deleting Category:', error);
        alert('Error deleting Category');
      }
    })
  }

  getSellerProducts() {
    this.service.getAllProducts().subscribe({
      next: (response: any) => {
        console.log(response);
        this.userProducts = response.rows
          .map((row: any) => row.doc)
          .filter((product: any) => product.data.userId === this.currentUserId);

        console.log("Seller's Products:", this.userProducts);
      },
      error: (err) => {
        console.error("Error fetching products:", err);
        alert("Error fetching products");
      },
    });
  }

  softDeleteProductsByCategory(categoryName: string) {
    const productsToDelete = this.userProducts.filter((product: any) => product.data.category === categoryName);

    const updatedProducts = productsToDelete.map((product: any) => ({
      ...product,
      data: { ...product.data, isDeleted: true },
    }));

    this.service.bulkProductDeletion(updatedProducts).subscribe({
      next: () => this.getSellerProducts(),
      error: () => alert('Error deleting products'),
    });
  }
}