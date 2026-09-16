import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  categories: {
    include: {
      category: true,
    },
  },
  images: {
    orderBy: {
      sortOrder: 'asc' as const,
    },
  },
  sizes: {
    orderBy: {
      sortOrder: 'asc' as const,
    },
  },
  wraps: {
    orderBy: {
      sortOrder: 'asc' as const,
    },
  },
  cards: {
    orderBy: {
      sortOrder: 'asc' as const,
    },
  },
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Prisma Decimal alanlarını frontend için number'a çevirir.
   * Ayrıca ProductCategory ara tablosunu gizleyip
   * categories alanını doğrudan kategori listesi olarak döndürür.
   */
  private formatProduct(product: any) {
    return {
      ...product,

      categories:
        product.categories?.map(
          (item: any) => item.category,
        ) ?? [],

      sizes:
        product.sizes?.map(
          (size: any) => ({
            ...size,
            price: Number(size.price),
          }),
        ) ?? [],

      wraps:
        product.wraps?.map(
          (wrap: any) => ({
            ...wrap,
            extraPrice: Number(
              wrap.extraPrice,
            ),
          }),
        ) ?? [],

      cards:
        product.cards?.map(
          (card: any) => ({
            ...card,
            extraPrice: Number(
              card.extraPrice,
            ),
          }),
        ) ?? [],
    };
  }

  async findAll() {
    const products =
      await this.prisma.product.findMany({
        include: productInclude,

        orderBy: {
          createdAt: 'desc',
        },
      });

    return products.map((product) =>
      this.formatProduct(product),
    );
  }

  async findOneBySlug(slug: string) {
    const product =
      await this.prisma.product.findUnique({
        where: {
          slug,
        },

        include: productInclude,
      });

    if (!product) {
      throw new NotFoundException(
        'Ürün bulunamadı.',
      );
    }

    return this.formatProduct(product);
  }

  async create(dto: CreateProductDto) {
    const existingProduct =
      await this.prisma.product.findUnique({
        where: {
          slug: dto.slug,
        },
      });

    if (existingProduct) {
      throw new ConflictException(
        'Bu slug ile kayıtlı bir ürün zaten var.',
      );
    }

    const {
      categoryIds,
      images,
      sizes,
      wraps,
      cards,
      ...productData
    } = dto;

    const product =
      await this.prisma.product.create({
        data: {
          ...productData,

          categories:
            categoryIds?.length
              ? {
                  create: categoryIds.map(
                    (categoryId) => ({
                      category: {
                        connect: {
                          id: categoryId,
                        },
                      },
                    }),
                  ),
                }
              : undefined,

          images:
            images?.length
              ? {
                  create: images,
                }
              : undefined,

          sizes:
            sizes?.length
              ? {
                  create: sizes,
                }
              : undefined,

          wraps:
            wraps?.length
              ? {
                  create: wraps,
                }
              : undefined,

          cards:
            cards?.length
              ? {
                  create: cards,
                }
              : undefined,
        },

        include: productInclude,
      });

    return this.formatProduct(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ) {
    const existingProduct =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existingProduct) {
      throw new NotFoundException(
        'Ürün bulunamadı.',
      );
    }

    if (
      dto.slug &&
      dto.slug !== existingProduct.slug
    ) {
      const slugExists =
        await this.prisma.product.findUnique({
          where: {
            slug: dto.slug,
          },
        });

      if (slugExists) {
        throw new ConflictException(
          'Bu slug ile kayıtlı başka bir ürün var.',
        );
      }
    }

    const {
      categoryIds,
      images,
      sizes,
      wraps,
      cards,
      ...productData
    } = dto;

    const product =
      await this.prisma.$transaction(
        async (tx) => {
          if (categoryIds !== undefined) {
            await tx.productCategory.deleteMany({
              where: {
                productId: id,
              },
            });
          }

          if (images !== undefined) {
            await tx.productImage.deleteMany({
              where: {
                productId: id,
              },
            });
          }

          if (sizes !== undefined) {
            await tx.productSize.deleteMany({
              where: {
                productId: id,
              },
            });
          }

          if (wraps !== undefined) {
            await tx.productWrap.deleteMany({
              where: {
                productId: id,
              },
            });
          }

          if (cards !== undefined) {
            await tx.productCard.deleteMany({
              where: {
                productId: id,
              },
            });
          }

          return tx.product.update({
            where: {
              id,
            },

            data: {
              ...productData,

              categories:
                categoryIds !== undefined &&
                categoryIds.length > 0
                  ? {
                      create:
                        categoryIds.map(
                          (categoryId) => ({
                            category: {
                              connect: {
                                id: categoryId,
                              },
                            },
                          }),
                        ),
                    }
                  : undefined,

              images:
                images !== undefined &&
                images.length > 0
                  ? {
                      create: images,
                    }
                  : undefined,

              sizes:
                sizes !== undefined &&
                sizes.length > 0
                  ? {
                      create: sizes,
                    }
                  : undefined,

              wraps:
                wraps !== undefined &&
                wraps.length > 0
                  ? {
                      create: wraps,
                    }
                  : undefined,

              cards:
                cards !== undefined &&
                cards.length > 0
                  ? {
                      create: cards,
                    }
                  : undefined,
            },

            include: productInclude,
          });
        },
      );

    return this.formatProduct(product);
  }

  async remove(id: string) {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Ürün bulunamadı.',
      );
    }

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message:
        'Ürün başarıyla silindi.',
    };
  }
}