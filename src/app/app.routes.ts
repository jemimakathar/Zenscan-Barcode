import { Routes } from '@angular/router';
import { SellerRegisterComponent } from './Modules/Seller/seller-register/seller-register.component';
import { SellerLoginComponent } from './Modules/Seller/seller-login/seller-login.component';
import { PricingComponent } from './Modules/Seller/pricing/pricing.component';
import { SellerProductsComponent } from './Modules/Seller/seller-products/seller-products.component';
import { SellerCategoryComponent } from './Modules/Seller/seller-category/seller-category.component';
import { SellerNavComponent } from './Modules/Seller/seller-nav/seller-nav.component';
import { BillingComponent } from './Modules/Seller/billing/billing.component';
import { HomePageComponent } from './Modules/landingPage/home-page/home-page.component';
import { InvoicesComponent } from './Modules/Seller/invoices/invoices.component';
import { DemoComponent } from './Modules/Demo/demo/demo.component';
import { AdminPricingComponent } from './Modules/Admin/admin-pricing/admin-pricing.component';
import { UserListComponent } from './Modules/Admin/user-list/user-list.component';
import { AdminNavComponent } from './Modules/Admin/admin-nav/admin-nav.component';
import { PaymentListComponent } from './Modules/Admin/payment-list/payment-list.component';
import { AdminHomePageComponent } from './Modules/Admin/admin-home-page/admin-home-page.component';
import { DashBoardComponent } from './Modules/Seller/dash-board/dash-board.component';



export const routes: Routes = [
    {path:'',component:HomePageComponent} ,
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'seller-product', component: SellerProductsComponent },
    {path:'seller-login',component:SellerLoginComponent},
    {path: 'register', component: SellerRegisterComponent },
    {path: 'home-pricing', component: PricingComponent },
    {path:'seller-category',component:SellerCategoryComponent},
    {path:'seller-nav',component:SellerNavComponent},
    {path:'billing',component:BillingComponent},
    {path:'invoice',component:InvoicesComponent},
    {path:'pricing',component:PricingComponent},
    {path:'demo',component:DemoComponent},
    {path:'admin-nav',component:AdminNavComponent},
    {path:'admin-homePage',component:AdminHomePageComponent},
    {path:'admin-pricing',component:AdminPricingComponent},
    {path:'admin-userList',component:UserListComponent},
    {path:'payment',component:PaymentListComponent},
    {path:'dash-board',component:DashBoardComponent},
];
