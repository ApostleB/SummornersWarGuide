import { SetMetadata } from "@nestjs/common";

// levelValue 값을 받아서 해당 value와 사용자 level을 비교
// 예: @MinLevel('99') - level 99 이상인 사용자만 접근 가능
export const MIN_LEVEL_KEY = "minLevel";
export const MinLevel = (levelValue: string) => SetMetadata(MIN_LEVEL_KEY, levelValue);
