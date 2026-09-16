import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm ürünleri getir',
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Slug ile ürün getir',
  })
  @ApiParam({
    name: 'slug',
    example: 'gece-yarisi',
  })
  findOne(
    @Param('slug') slug: string,
  ) {
    return this.productsService.findOneBySlug(
      slug,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Yeni ürün oluştur',
  })
  create(
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ürün güncelle',
  })
  @ApiParam({
    name: 'id',
    description: 'Ürünün database ID değeri',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ürün sil',
  })
  @ApiParam({
    name: 'id',
    description: 'Ürünün database ID değeri',
  })
  remove(
    @Param('id') id: string,
  ) {
    return this.productsService.remove(id);
  }
}