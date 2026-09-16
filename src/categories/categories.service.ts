import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async findOneBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug,
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
                sizes: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
                wraps: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
                cards: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı.');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existingCategory =
      await this.prisma.category.findUnique({
        where: {
          slug: dto.slug,
        },
      });

    if (existingCategory) {
      throw new ConflictException(
        'Bu slug ile kayıtlı bir kategori zaten var.',
      );
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ) {
    const category =
      await this.prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Kategori bulunamadı.',
      );
    }

    if (
      dto.slug &&
      dto.slug !== category.slug
    ) {
      const slugExists =
        await this.prisma.category.findUnique({
          where: {
            slug: dto.slug,
          },
        });

      if (slugExists) {
        throw new ConflictException(
          'Bu slug ile kayıtlı başka bir kategori var.',
        );
      }
    }

    return this.prisma.category.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    const category =
      await this.prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Kategori bulunamadı.',
      );
    }

    await this.prisma.category.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Kategori başarıyla silindi.',
    };
  }
}