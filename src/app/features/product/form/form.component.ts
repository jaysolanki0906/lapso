import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';

interface Category {
  id: number;
  title: string;
  desc?: string | null;
  image?: string;
}

interface Brand {
  id: number;
  title: string;
  desc?: string | null;
  logo?: string;
  categories?: string;
  products?: number[];
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  product = {
    category: null as Category | null,
    brand: null as Brand | null,
    productName: '',
    productCode: '',
    modelNumber: '',
    description: '',
    warranty: '',
    guarantee: '',
    price: '',
    tax: ''
  };

  products: any[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.fetchcategory().subscribe((data: any[]) => {
      this.products = data;

      // Extract unique categories
      const catMap = new Map<number, Category>();
      data.forEach(item => {
        if (item.category && !catMap.has(item.category.id)) {
          catMap.set(item.category.id, item.category);
        }
      });
      this.categories = Array.from(catMap.values());

      // Extract unique brands
      const brandMap = new Map<number, Brand>();
      data.forEach(item => {
        if (item.brands && item.brands.length > 0) {
          item.brands.forEach((brand: Brand) => {
            if (!brandMap.has(brand.id)) {
              brandMap.set(brand.id, brand);
            }
          });
        }
      });
      this.brands = Array.from(brandMap.values());
    });
  }
}