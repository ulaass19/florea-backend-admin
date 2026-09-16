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

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm kategorileri getir',
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Slug ile kategori getir',
  })
  @ApiParam({
    name: 'slug',
    example: 'guller',
  })
  findOne(
    @Param('slug') slug: string,
  ) {
    return this.categoriesService.findOneBySlug(
      slug,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Yeni kategori oluştur',
  })
  create(
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kategori güncelle',
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori database ID değeri',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kategori sil',
  })
  @ApiParam({
    name: 'id',
    description: 'Kategori database ID değeri',
  })
  remove(
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(id);
  }
}