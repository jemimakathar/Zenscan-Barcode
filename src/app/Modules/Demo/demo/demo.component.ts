import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

enum BarcodeType {
  EAN13 = 'ean13',
  EAN8 = 'ean8',
  UPCA = 'upca',
  CODE128 = 'code128'
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {
  // Mock data for categories
  categories: any[] = [
    { _id: 'category_1', data: { categoryName: 'Electronics', barcodeType: 'ean13', barcodeUrl: '', barcodeSize: 'medium', barcodeColor: '#000000', isDeleted: false } },
    { _id: 'category_2', data: { categoryName: 'Clothing', barcodeType: 'code128', barcodeUrl: '', barcodeSize: 'medium', barcodeColor: '#000000', isDeleted: false } }
  ];

  // Mock data for products
  products: any[] = [
    { _id: 'product_1', data: { productName: 'Laptop', productPrice: 1200, productDescription: 'High-end gaming laptop', quantity: 10, category: 'Electronics', barcodeUrl:'http://localhost:3000/barcodes/8939385308208_ean13_medium_000000.png', barcodeType: 'ean13', barcodeSize: 'medium', barcodeColor: '#000000', isDeleted: false } },
    { _id: 'product_2', data: { productName: 'T-Shirt', productPrice: 20, productDescription: 'Cotton T-Shirt', quantity: 50, category: 'Clothing', barcodeUrl:'http://localhost:3000/barcodes/356789231_code128_medium_000000.png', barcodeType: 'code128', barcodeSize: 'medium', barcodeColor: '#000000', isDeleted: false } }
  ];

  // Properties for adding a new category
  newCategoryName: string = '';
  newCategoryBarcodeType: string = 'ean13';
  newCategorySize = 'medium';
  newCategoryColor = '#000000';
  barcodePreviewUrl: string = '';
  barcodePreview: any;

  // Properties for adding a new product
  newProductName: string = '';
  newProductPrice: number = 0;
  newProductDescription: string = '';
  newProductQuantity: number = 0;
  newProductCategory: string = '';
  newProductBarcodeType: string = '';


  // Properties for updating a product
  selectedProduct: any = null;
  updatedProductName: string = '';
  updatedProductPrice: number = 0;
  updatedProductDescription: string = '';
  updatedProductQuantity: number = 0;
  updatedProductCategory: string = '';

  showCategory: boolean = true;
  showProduct: boolean = false;
  showAddProductForm: boolean = false;
  showAddCategoryForm:boolean=false;




  // Property to store filtered products based on category
  filteredProducts: any[] = [];
  isFiltered: boolean = false; // To track if products are filtered

  constructor(readonly http: HttpClient, readonly router: Router) {}

  ngOnInit() {
    console.log('Demo mode activated');
  }

  showCategorySection() {
    this.showCategory = true;
    this.showProduct = false;
  }

  showProductSection() {
    this.showCategory = false;
    this.showProduct = true;
    this.isFiltered = false; // Reset filter when switching to product section
    this.filteredProducts = []; // Clear filtered products
  }
  toggleAddProductForm() {
    this.showAddProductForm = !this.showAddProductForm;
  }
  toggleAddCategoryForm()
  {
    this.showAddCategoryForm =!this.showAddCategoryForm
  }
  

  showProductByCategory()
  {
    this.showCategory = false;
    this.showProduct = true;
  }

  generateBarcodePreview() {
    const barcodeType = this.newCategoryBarcodeType;
    let sampleValue: string | number;

    switch (barcodeType) {
      case BarcodeType.EAN13:
        sampleValue = '4006381333931';
        break;
      case BarcodeType.EAN8:
        sampleValue = '96385074';
        break;
      case BarcodeType.UPCA:
        sampleValue = '036000291452';
        break;
      case BarcodeType.CODE128:
        sampleValue = '123456789';
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
        this.barcodePreviewUrl = response.barcodeUrl;
      },
      error: (err) => {
        console.error('Error generating barcode', err);
        alert('Error generating barcode preview');
      },
    });
  }

  addCategory(categoryName: string, barcodeType: string) {
    const newCategory = {
      _id: `category_${uuidv4()}`,
      data: {
        categoryName,
        barcodeType,
        barcodeUrl: '',
        barcodeSize: 'medium',
        barcodeColor: '#000000',
        isDeleted: false
      }
    };
    this.categories.push(newCategory);
    this.resetCategoryForm()
    alert('Category added successfully (demo mode)');
  }

  addProduct(productName: string, productPrice: number, productDescription: string, quantity: number, category: string) {
    const selectedCategory = this.categories.find(cat => cat.data.categoryName === category);
    if (!selectedCategory) {
      alert('Selected category not found');
      return;
    }

    const productBarcodeType = selectedCategory.data.barcodeType;
    let sampleValue: string | number;

    switch (productBarcodeType) {
      case BarcodeType.EAN13:
        sampleValue = '4006381333931';
        break;
      case BarcodeType.EAN8:
        sampleValue = '96385074';
        break;
      case BarcodeType.UPCA:
        sampleValue = '036000291452';
        break;
      case BarcodeType.CODE128:
        sampleValue = '123456789';
        break;
      default:
        alert('Unsupported barcode type');
        return;
    }

    const size = 'medium';
    const color = '#000000'.replace('#', '');
    const backendUrl = `http://localhost:3000/generate-barcode/${sampleValue}?type=${productBarcodeType}&size=${size}&color=${color}`;

    this.http.get<any>(backendUrl).subscribe({
      next: (response) => {
        const newProduct = {
          _id: `product_${uuidv4()}`,
          data: {
            productName,
            productPrice,
            productDescription,
            quantity,
            category,
            barcodeUrl: response.barcodeUrl,
            productBarcodeType,
            barcodeSize: size,
            barcodeColor: '#000000',
            isDeleted: false
          }
        };
        this.products.push(newProduct);
        this.resetProductForm();
        alert('Product added successfully (demo mode)');
      },
      error: (err) => {
        console.error('Error generating barcode', err);
        alert('Error generating barcode for product');
      },
    });
  }

  deleteProduct(productId: string) {
    this.products = this.products.filter(product => product._id !== productId);
    alert('Product deleted successfully (demo mode)');
  }

  onCategoryChange() {
    const selectedCategory = this.categories.find(category => category.data.categoryName === this.newProductCategory);
    if (selectedCategory) {
      this.newProductBarcodeType = selectedCategory.data.barcodeType;
    } else {
      this.newProductBarcodeType = '';
    }
  }

  // Method to select a product for updating
  selectProductForUpdate(productId: string) {
    this.showAddProductForm = false;
    this.selectedProduct = this.products.find(product => product._id === productId);
    if (this.selectedProduct) {
      this.updatedProductName = this.selectedProduct.data.productName;
      this.updatedProductPrice = this.selectedProduct.data.productPrice;
      this.updatedProductDescription = this.selectedProduct.data.productDescription;
      this.updatedProductQuantity = this.selectedProduct.data.quantity;
      this.updatedProductCategory = this.selectedProduct.data.category;
    }
  }

  // Method to update a product
  updateProduct() {
    if (!this.selectedProduct) {
      alert('No product selected for update');
      return;
    }

    const selectedCategory = this.categories.find(cat => cat.data.categoryName === this.updatedProductCategory);
    if (!selectedCategory) {
      alert('Selected category not found');
      return;
    }

    this.selectedProduct.data.productName = this.updatedProductName;
    this.selectedProduct.data.productPrice = this.updatedProductPrice;
    this.selectedProduct.data.productDescription = this.updatedProductDescription;
    this.selectedProduct.data.quantity = this.updatedProductQuantity;
    this.selectedProduct.data.category = this.updatedProductCategory;

    alert('Product updated successfully (demo mode)');
    this.selectedProduct = null; // Reset selected product
  }

  // Method to filter products based on category
  viewProductsByCategory(categoryName: string) {
    this.filteredProducts = this.products.filter(product => product.data.category === categoryName);
    this.isFiltered = true; // Set filtered state to true
    this.showProductByCategory(); // Switch to the product section
  }
  resetProductForm()
  {
  this.newProductName = '';
  this.newProductPrice = 0;
  this.newProductDescription = '';
  this.newProductQuantity = 0;
  this.newProductCategory = '';
  this.newProductBarcodeType = '';
  this.showAddProductForm = false;
  }

  resetCategoryForm()
  {
    this.showAddCategoryForm=false;
    this.newCategoryName= '';
    this.newCategorySize='';
    this.newCategoryColor='';
  }
}