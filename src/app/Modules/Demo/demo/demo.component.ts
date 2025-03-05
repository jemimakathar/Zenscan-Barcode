import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

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
    { _id: 'product_1', data: { productName: 'Laptop', productPrice: 1200, productDescription: 'High-end gaming laptop', quantity: 10, category: 'Electronics', barcodeUrl: '', barcodeType: 'ean13', barcodeSize: 'medium', barcodeColor: '#000000', isDeleted: false } },
    { _id: 'product_2', data: { productName: 'T-Shirt', productPrice: 20, productDescription: 'Cotton T-Shirt', quantity: 50, category: 'Clothing', barcodeUrl: '', barcodeType: 'code128', barcodeSize: 'medium', barcodeColor: '#000000', isDeleted: false } }
  ];

  // Properties for adding a new category
  newCategoryName: string = '';
  newCategoryBarcodeType: string = 'ean13';

  // Properties for adding a new product
  newProductName: string = '';
  newProductPrice: number = 0;
  newProductDescription: string = '';
  newProductQuantity: number = 0;
  newProductCategory: string = '';
  newProductBarcodeType: string = '';

  constructor(readonly http: HttpClient, readonly router: Router) {}

  ngOnInit() {
    // Simulate fetching categories and products
    console.log('Demo mode activated');
  }

  // Simulate adding a new category
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
    alert('Category added successfully (demo mode)');
  }

  // Simulate adding a new product
  addProduct(productName: string, productPrice: number, productDescription: string, quantity: number, category: string) {
    const newProduct = {
      _id: `product_${uuidv4()}`,
      data: {
        productName,
        productPrice,
        productDescription,
        quantity,
        category,
        barcodeUrl: '',
        barcodeType: this.newProductBarcodeType,
        barcodeSize: 'medium',
        barcodeColor: '#000000',
        isDeleted: false
      }
    };
    this.products.push(newProduct);
    alert('Product added successfully (demo mode)');
  }

  // Simulate deleting a category
  deleteCategory(categoryId: string) {
    this.categories = this.categories.filter(category => category._id !== categoryId);
    alert('Category deleted successfully (demo mode)');
  }

  // Simulate deleting a product
  deleteProduct(productId: string) {
    this.products = this.products.filter(product => product._id !== productId);
    alert('Product deleted successfully (demo mode)');
  }

  // Update barcode type when category is selected
  onCategoryChange() {
    const selectedCategory = this.categories.find(category => category.data.categoryName === this.newProductCategory);
    if (selectedCategory) {
      this.newProductBarcodeType = selectedCategory.data.barcodeType;
    } else {
      this.newProductBarcodeType = '';
    }
  }
}