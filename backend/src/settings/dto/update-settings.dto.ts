import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @IsIn(['dark', 'light', 'purple'], {
    message: 'Theme must be one of: dark, light, purple',
  })
  theme?: string;
}
