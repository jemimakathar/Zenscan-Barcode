import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-seller-nav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './seller-nav.component.html',
  styleUrl: './seller-nav.component.css',
  providers:[HttpClient]
})
export class SellerNavComponent {

  constructor(readonly router:Router){}
  nullCategory(){
    if(typeof window !=='undefined')
    {
      
     localStorage.setItem("SelectedCategory",'null')
     this.router.navigate(['/seller-product'])
    }

  }

}
