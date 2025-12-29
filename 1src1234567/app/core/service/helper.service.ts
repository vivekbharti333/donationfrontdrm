import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor() {}

  public async copyData(data: any) {
    let copyingObj = this.formatCopyingData(data);
    let jsonData: any = JSON.stringify(copyingObj);
    jsonData = jsonData.replace(/[{}]/g, '');
    jsonData = jsonData.replace(/\"/g, '');
    const copyingData = jsonData.split(',').join('\n');
    await navigator.clipboard.writeText(copyingData);
  }

  public formatCopyingData(data: any) {
    let copyingObj = {};
    for (const key in data) {
      let formatKey = key.charAt(0)?.toUpperCase() + key.slice(1);
      formatKey = formatKey.split(/(?=[A-Z])/).join(' ');
      copyingObj = Object.assign({ ...copyingObj }, { [formatKey]: data[key] });
    }
    return copyingObj;
  }
  public addZeroInDateTime(val: any) {
    val = val + '';
    return val?.length > 1 ? val : '0' + val;
  }
}
