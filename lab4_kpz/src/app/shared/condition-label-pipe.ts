import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'conditionLabel'
})
export class ConditionLabelPipe implements PipeTransform {
  transform(stateId: number | null | undefined): string {
    switch (stateId) {
      case 1:
        return '1 - Critical';
      case 2:
        return '2 - Poor';
      case 3:
        return '3 - Moderate';
      case 4:
        return '4 - Good';
      case 5:
        return '5 - Excellent';
      default:
        return 'Unknown';
    }
  }
}

