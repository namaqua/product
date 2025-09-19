import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse as ApiResponseDecorator, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto, SetDefaultAddressDto } from './dto';
import { Address, AddressType } from './entities/address.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectionResponseDto, ActionResponseDto } from '../../common/dto';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);

  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address for an account' })
  @ApiResponseDecorator({ 
    status: HttpStatus.CREATED, 
    description: 'Address created successfully',
  })
  async create(@Body() createAddressDto: CreateAddressDto) {
    this.logger.log(`Creating address with data: ${JSON.stringify(createAddressDto)}`);
    
    const address = await this.addressesService.create(createAddressDto);
    
    // Return using ActionResponseDto
    return ActionResponseDto.create(address, 'Address created successfully');
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get all addresses for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'List of addresses',
  })
  async findAllByAccount(@Param('accountId') accountId: string) {
    const addresses = await this.addressesService.findAllByAccount(accountId);
    
    // Return using CollectionResponseDto
    return new CollectionResponseDto(
      addresses,
      {
        totalItems: addresses.length,
        itemCount: addresses.length,
        page: 1,
        totalPages: 1,
        itemsPerPage: addresses.length,
        hasNext: false,
        hasPrevious: false,
      }
    );
  }

  @Get('account/:accountId/type/:type')
  @ApiOperation({ summary: 'Get addresses by type for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiParam({ 
    name: 'type', 
    description: 'Address type',
    enum: AddressType,
  })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'List of addresses of specified type',
  })
  async getAddressesByType(
    @Param('accountId') accountId: string,
    @Param('type') type: AddressType,
  ) {
    const addresses = await this.addressesService.getAddressesByType(accountId, type);
    
    // Return using CollectionResponseDto
    return new CollectionResponseDto(
      addresses,
      {
        totalItems: addresses.length,
        itemCount: addresses.length,
        page: 1,
        totalPages: 1,
        itemsPerPage: addresses.length,
        hasNext: false,
        hasPrevious: false,
      }
    );
  }

  @Get('account/:accountId/default/:type')
  @ApiOperation({ summary: 'Get the default address of a specific type for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiParam({ 
    name: 'type', 
    description: 'Address type',
    enum: AddressType,
  })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Default address of specified type',
  })
  async getDefaultAddress(
    @Param('accountId') accountId: string,
    @Param('type') type: AddressType,
  ) {
    let address = null;
    
    switch(type) {
      case AddressType.HEADQUARTERS:
        address = await this.addressesService.getHeadquartersAddress(accountId);
        break;
      case AddressType.BILLING:
        address = await this.addressesService.getBillingAddress(accountId);
        break;
      case AddressType.SHIPPING:
        address = await this.addressesService.getDefaultShippingAddress(accountId);
        break;
    }
    
    // Return raw data - let interceptor wrap it
    return address;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Address details',
  })
  async findOne(@Param('id') id: string) {
    const address = await this.addressesService.findOne(id);
    
    // Return raw data - let interceptor wrap it
    return address;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Address updated successfully',
  })
  async update(
    @Param('id') id: string, 
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    this.logger.log(`Updating address ${id} with data: ${JSON.stringify(updateAddressDto)}`);
    
    const address = await this.addressesService.update(id, updateAddressDto);
    
    // Return using ActionResponseDto
    return ActionResponseDto.update(address, 'Address updated successfully');
  }

  @Post(':id/set-default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set an address as the default for its type' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Address set as default successfully',
  })
  async setAsDefault(@Param('id') id: string) {
    const address = await this.addressesService.setAsDefault(id);
    
    // Return using ActionResponseDto
    return ActionResponseDto.update(address, 'Address set as default successfully');
  }

  @Post('account/:accountId/clone-hq-to-billing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clone headquarters address as billing address' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Billing address created from headquarters',
  })
  async cloneHQAsBilling(@Param('accountId') accountId: string) {
    const address = await this.addressesService.cloneHQAsBilling(accountId);
    
    // Return using ActionResponseDto
    return ActionResponseDto.create(address, 'Billing address created from headquarters');
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Address validation result',
  })
  async validateAddress(@Param('id') id: string) {
    const address = await this.addressesService.findOne(id);
    const result = await this.addressesService.validateAddress(address);
    
    // Return raw data - let interceptor wrap it
    return result;
  }

  @Post(':id/track-usage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track usage of an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Usage tracked successfully',
  })
  async trackUsage(@Param('id') id: string): Promise<void> {
    await this.addressesService.trackUsage(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Address deleted successfully',
  })
  async remove(@Param('id') id: string) {
    const address = await this.addressesService.findOne(id);
    await this.addressesService.remove(id);
    
    // Return using ActionResponseDto
    return ActionResponseDto.delete(address, 'Address deleted successfully');
  }

  @Post('account/:accountId/migrate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Migrate legacy address data for an account' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponseDecorator({ 
    status: HttpStatus.OK, 
    description: 'Legacy addresses migrated successfully',
  })
  async migrateLegacyAddresses(
    @Param('accountId') accountId: string,
    @Body() account: any,
  ) {
    await this.addressesService.migrateLegacyAddresses(accountId, account);
    
    // Return using ActionResponseDto  
    return ActionResponseDto.create(
      { message: 'Legacy addresses migrated successfully' },
      'Legacy addresses migrated successfully'
    );
  }
}
