import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  defenceArraySave(xlsxArr: Array<string>): string {
    console.log(xlsxArr);

    if (xlsxArr.length > 1) {
      xlsxArr.forEach((element) => {
        const defenceMonsterA = element['방덱리더'];
        const defenceMonsterB = element['방덱2'];
        const defenceMonsterC = element['방덱3'];
        console.log(defenceMonsterA);
        console.log(defenceMonsterB);
        console.log(defenceMonsterC);
      });
    }

    return "Hello World!";
  }
}
