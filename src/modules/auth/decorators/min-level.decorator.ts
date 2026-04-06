import { SetMetadata } from "@nestjs/common";

// code 값을 받아서 해당 code의 codeValue와 사용자 level을 비교
// 예: @MinLevel('LV099') - LV099 코드의 codeValue 이상인 사용자만 접근 가능
export const MIN_LEVEL_KEY = "minLevel";
export const MinLevel = (code: string) => SetMetadata(MIN_LEVEL_KEY, code);
