import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(readonly http:HttpClient) { }


  readonly baseUrl = 'https://192.168.57.185:5984/store-management'; // CouchDB Base URL
  readonly username = 'd_couchdb';
  readonly password = 'Welcome#2';

  readonly headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
    'Content-Type': 'application/json',
  });

  currentUser: string = "";
  currentUserId:string ="";
  customerPh:number=0



  // LOCAL STORAGE FOR PROFILE
  setUserData(username:string)
  {
    this.currentUser=username
  localStorage.setItem("loggedInUser",username);
  }

  getUserData()
  {
    return localStorage.getItem('currentUser')
  }
  logout() {
    this.currentUser = '';
    localStorage.removeItem('currentUser');
  }



   
  registerUser(data:any)
  {
    const url = `${this.baseUrl}`;
    return this.http.post<any>(url,data,{ headers: this.headers });
  }


   //Check if email exists (returns true if exists)
   checkSellerExists(email: string) {
    const url = `${this.baseUrl}/_design/View/_view/user_by_email/?key="${email}"`;  
    return this.http.get<any>(url, { headers: this.headers })
  }

  
  // Fetch all sellers in db
  fetchUser(): Observable<any> {
    const url = `${this.baseUrl}/_design/View/_view/user_by_email?&include_docs=true`;
    console.log("Fetching Values from db");
    return this.http.get<any>(url, { headers: this.headers });
  }

    // Update seller status after login
    updateUserStatus(_id: string, updatedSeller: any): Observable<any> {
      const url = `${this.baseUrl}/${_id}`;
      return this.http.put<any>(url, updatedSeller, { headers: this.headers });
    }


  getSellerById(sellerId: string) {
    return this.http.get(`${this.baseUrl}/${sellerId}`);
  }
}
