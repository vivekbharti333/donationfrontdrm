import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-mat-select-search',
  templateUrl: './mat-select-search.component.html',
  styleUrl: './mat-select-search.component.scss',
})
export class MatSelectSearchComponent {
  @Input() originalList: any[] = [];
  @Input() categoryName: string = '';
  @Output() filteredList = new EventEmitter<any[]>();
  onSearch(event: any) {
    this.filteredList.emit(this.filterList(event.target.value));
  }

  filterList(value: string) {
    const filter = value.toLowerCase();
    return this.originalList.filter((option) =>
      option?.[this.categoryName].toLowerCase().startsWith(filter)
    );
  }
}
