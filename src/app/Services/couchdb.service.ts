import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CouchdbService {

 readonly baseUrl = 'https://192.168.57.185:5984/store-management'; // CouchDB Base URL
  readonly username = 'd_couchdb';
  readonly password = 'Welcome#2';

  readonly headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
    'Content-Type': 'application/json',
  });

  constructor(readonly http: HttpClient,readonly authService:AuthenticationService) { }

  currentUserId: string = "";



  // category service
  
   // for category
   addCategory(newCategory:any):Observable<any>
   {
     return this.http.post<any>(this.baseUrl, newCategory, { headers: this.headers })
   }
 
   // get all category
   fetchCategory(): Observable<any> {
     const url = `${this.baseUrl}/_design/View/_view/category_by_id?&include_docs=true`;
     return this.http.get(url, { headers: this.headers });
   }
 
   // delete category
   deleteCategory(category: any) {
     const updatedCategory = {...category,
       data:{
         ...category.data,
         isDeleted: true, // Mark the category as deleted
         },
     };
     return this.http.put(`${this.baseUrl}/${category._id}`, updatedCategory, { headers: this.headers });
   }






  //  product service

  getAllProducts() {
    const url = `${this.baseUrl}/_design/View/_view/product_by_id?&include_docs=true`;
    return this.http.get(url, { headers: this.headers });
  }

  getProductById(productId:string)
  {
    const url = `${this.baseUrl}/${productId}`;
    return this.http.get(url,{headers:this.headers});
  }
  
  updateProduct(_id: string, updatedProduct: any): Observable<any> {
    console.log("updating...");
    console.log(updatedProduct); 
    return this.http.put<any>(`${this.baseUrl}/${_id}`,updatedProduct, { headers: this.headers });
  }

  // Soft delete a product by marking it as deleted instead of removing it
  softDeleteProduct(productId: string, productRev: string): Observable<any> {
    const productData = {
      _id: productId,
      _rev: productRev
    };
    return this.http.put<any>(`${this.baseUrl}/${productId}`, productData);
  }

  // add product for particular user
  addProductForParticularSeller(newProduct: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, newProduct, { headers: this.headers });
  }

  bulkProductDeletion(products: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/_bulk_docs`, { docs: products }, { headers: this.headers });
  }






  // billing service
  saveBillingDetails(billing:any)
  {
    const url =`${this.baseUrl}`;
    return this.http.post<any>(url,billing,{headers:this.headers});
  }

  //all invoics details
  getBillingDetailsFromInvoice(): Observable<any> {
    const url = `${this.baseUrl}/_design/View/_view/invoices_by_id?include_docs=true`;
    return this.http.get(url, { headers: this.headers });
  }

  // getBillingDetailsFromBillHeader(): Observable<any> {
  //   const url = `${this.baseUrl}/_design/View/_view/billingdetails_by_id?include_docs=true`;
  //   return this.http.get(url, { headers: this.headers });
  // }

  getBillingDetailsByUserId(userId: string): Observable<any> {
    const url = `${this.baseUrl}/_design/View/_view/billingdetails_by_id?key="${userId}"&include_docs=true`;
    return this.http.get(url, { headers: this.headers });
  }

  // Get customer by phone number using CouchDB search index
  getCustomerByPhone(phoneNumber: string): Observable<any> {
    this.currentUserId=this.authService.getUserId() ?? "";
    const url = `${this.baseUrl}/_design/search_index/_search/searchbycustomernumber?q=customerno:"${encodeURIComponent(phoneNumber)}" AND userId:${this.currentUserId}`;
    return this.http.get(url,{headers:this.headers});
  }

  getInvoicesByBillId(billId:any):Observable<any>
  {
    const url = `${this.baseUrl}/_design/View/_view/salesline_by_billId?key="${billId}"&include_docs=true`;
    return this.http.get(url, { headers: this.headers }); 
  }




  // plans and subscription

  
  // Add a new plan by admin
  addPlan(plan: any): Observable<any> {
    return this.http.post(this.baseUrl, plan, { headers: this.headers });
  }

    // Fetch all plans
  getAllPlans(): Observable<any> {
    const url = `${this.baseUrl}/_design/View/_view/pricing_by_id?&include_docs=true`;
    return this.http.get(url, { headers: this.headers });
  }

  updatePlans(_id:string,updatedPlan:any):Observable<any>
  {
    return this.http.put<any>(`${this.baseUrl}/${_id}`,updatedPlan, { headers: this.headers });
  }



  // subscription
  subscribeToPlan(data:any):Observable<any>
  {
    return this.http.post(this.baseUrl,data, { headers: this.headers });
  }

  updateSubscription(subscriptionId: string, updateData: any) {    
    return this.http.put<any>(`${this.baseUrl}/${subscriptionId}`, updateData, {headers:this.headers});
  }
  getSubscription(): Observable<any> {
    const url = `${this.baseUrl}/_design/View/_view/subscription_by_id?&include_docs=true`;
    return this.http.get(url, { headers: this.headers });
  }
  getSubscriptionById(subscriptionId: string): Observable<any> {
    const url = `${this.baseUrl}/${subscriptionId}`;
    return this.http.get(url, { headers: this.headers });
  }
}




