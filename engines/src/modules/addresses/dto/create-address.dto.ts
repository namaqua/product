import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '../entities/address.entity';

class BusinessHoursDto {
  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  monday?: { open: string; close: string };

  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  tuesday?: { open: string; close: string };

  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  wednesday?: { open: string; close: string };

  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  thursday?: { open: string; close: string };

  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  friday?: { open: string; close: string };

  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  saturday?: { open: string; close: string };

  @ApiPropertyOptional({ example: { open: '09:00', close: '17:00' } })
  @IsOptional()
  @IsObject()
  sunday?: { open: string; close: string };
}

export class CreateAddressDto {
  @ApiProperty({ description: 'Account ID this address belongs to' })
  @IsString()
  accountId: string;

  @ApiProperty({ 
    enum: AddressType, 
    description: 'Type of address',
    example: AddressType.SHIPPING
  })
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiProperty({ 
    description: 'Is this the default registered address',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ 
    description: 'Custom label for this address',
    example: 'Main Warehouse'
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ 
    description: 'Contact person name',
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({ 
    description: 'Phone number for this address',
    example: '+1-555-1234'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Email for this address',
    example: 'warehouse@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'Street address line 1',
    example: '123 Main Street'
  })
  @IsString()
  street1: string;

  @ApiPropertyOptional({ 
    description: 'Street address line 2',
    example: 'Suite 100'
  })
  @IsString()
  @IsOptional()
  street2?: string;

  @ApiProperty({ 
    description: 'City',
    example: 'New York'
  })
  @IsString()
  city: string;

  @ApiPropertyOptional({ 
    description: 'State, Province, or Region',
    example: 'NY'
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ 
    description: 'Postal or ZIP code',
    example: '10001'
  })
  @IsString()
  postalCode: string;

  @ApiProperty({ 
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'US'
  })
  @IsString()
  country: string;

  @ApiPropertyOptional({ 
    description: 'County or district',
    example: 'Manhattan'
  })
  @IsString()
  @IsOptional()
  county?: string;

  @ApiPropertyOptional({ 
    description: 'Latitude coordinate',
    example: 40.7128
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Longitude coordinate',
    example: -74.0060
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ 
    description: 'Special delivery or access instructions',
    example: 'Ring bell twice, use loading dock entrance'
  })
  @IsString()
  @IsOptional()
  deliveryInstructions?: string;

  @ApiPropertyOptional({ 
    description: 'Business hours for this location',
    type: BusinessHoursDto
  })
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @IsOptional()
  businessHours?: BusinessHoursDto;
}
