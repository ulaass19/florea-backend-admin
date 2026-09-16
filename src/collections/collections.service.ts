import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateCollectionDto,
} from './dto/create-collection.dto';

import {
  UpdateCollectionDto,
} from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private readonly productInclude = {
    categories: {
      include: {
        category: true,
      },
    },

    images: {
      orderBy: {
        sortOrder:
          'asc' as const,
      },
    },

    sizes: {
      orderBy: {
        sortOrder:
          'asc' as const,
      },
    },
  };

  private readonly collectionInclude = {
    products: {
      orderBy: {
        sortOrder:
          'asc' as const,
      },

      include: {
        product: {
          include:
            this.productInclude,
        },
      },
    },
  };

  private formatProduct(
    product: any,
  ) {
    return {
      ...product,

      categories:
        product.categories?.map(
          (item: any) =>
            item.category,
        ) ?? [],

      sizes:
        product.sizes?.map(
          (size: any) => ({
            ...size,

            price:
              Number(
                size.price,
              ),
          }),
        ) ?? [],
    };
  }

  private formatCollection(
    collection: any,
  ) {
    return {
      ...collection,

      products:
        collection.products?.map(
          (item: any) => ({
            sortOrder:
              item.sortOrder,

            product:
              this.formatProduct(
                item.product,
              ),
          }),
        ) ?? [],
    };
  }

  private async ensureSlugAvailable(
    slug: string,
    ignoreId?: string,
  ) {
    const existing =
      await this.prisma.collection.findUnique(
        {
          where: {
            slug,
          },
        },
      );

    if (
      existing &&
      existing.id !== ignoreId
    ) {
      throw new ConflictException(
        'Bu slug ile kayıtlı başka bir koleksiyon bulunuyor.',
      );
    }
  }

  private validateDuplicateProducts(
    products?: {
      productId: string;
      sortOrder?: number;
    }[],
  ) {
    if (!products) {
      return;
    }

    const ids =
      products.map(
        (item) =>
          item.productId,
      );

    const uniqueIds =
      new Set(ids);

    if (
      uniqueIds.size !==
      ids.length
    ) {
      throw new BadRequestException(
        'Aynı ürün bir koleksiyona birden fazla kez eklenemez.',
      );
    }
  }

  private async validateProducts(
    products?: {
      productId: string;
      sortOrder?: number;
    }[],
  ) {
    if (
      !products ||
      products.length === 0
    ) {
      return;
    }

    this.validateDuplicateProducts(
      products,
    );

    const ids =
      products.map(
        (item) =>
          item.productId,
      );

    const existingProducts =
      await this.prisma.product.findMany(
        {
          where: {
            id: {
              in: ids,
            },
          },

          select: {
            id: true,
          },
        },
      );

    const existingIds =
      new Set(
        existingProducts.map(
          (product) =>
            product.id,
        ),
      );

    const missingIds =
      ids.filter(
        (id) =>
          !existingIds.has(id),
      );

    if (
      missingIds.length > 0
    ) {
      throw new BadRequestException(
        `Bazı ürünler bulunamadı: ${missingIds.join(', ')}`,
      );
    }
  }

  async findAll() {
    const collections =
      await this.prisma.collection.findMany(
        {
          include:
            this.collectionInclude,

          orderBy: [
            {
              sortOrder:
                'asc',
            },
            {
              createdAt:
                'desc',
            },
          ],
        },
      );

    return collections.map(
      (collection) =>
        this.formatCollection(
          collection,
        ),
    );
  }

  async findOne(
    slug: string,
  ) {
    const collection =
      await this.prisma.collection.findUnique(
        {
          where: {
            slug,
          },

          include:
            this.collectionInclude,
        },
      );

    if (!collection) {
      throw new NotFoundException(
        'Koleksiyon bulunamadı.',
      );
    }

    return this.formatCollection(
      collection,
    );
  }

  async create(
    dto: CreateCollectionDto,
  ) {
    await this.ensureSlugAvailable(
      dto.slug,
    );

    await this.validateProducts(
      dto.products,
    );

    const collection =
      await this.prisma.collection.create(
        {
          data: {
            name:
              dto.name,

            slug:
              dto.slug,

            subtitle:
              dto.subtitle,

            description:
              dto.description,

            image:
              dto.image,

            isActive:
              dto.isActive ??
              true,

            isFeatured:
              dto.isFeatured ??
              false,

            sortOrder:
              dto.sortOrder ??
              0,

            seoTitle:
              dto.seoTitle,

            seoDescription:
              dto.seoDescription,

            products:
              dto.products
                ?.length
                ? {
                    create:
                      dto.products.map(
                        (
                          item,
                          index,
                        ) => ({
                          sortOrder:
                            item.sortOrder ??
                            index,

                          product: {
                            connect: {
                              id:
                                item.productId,
                            },
                          },
                        }),
                      ),
                  }
                : undefined,
          },

          include:
            this.collectionInclude,
        },
      );

    return this.formatCollection(
      collection,
    );
  }

  async update(
    id: string,
    dto: UpdateCollectionDto,
  ) {
    const existing =
      await this.prisma.collection.findUnique(
        {
          where: {
            id,
          },
        },
      );

    if (!existing) {
      throw new NotFoundException(
        'Koleksiyon bulunamadı.',
      );
    }

    if (
      dto.slug !==
      undefined
    ) {
      await this.ensureSlugAvailable(
        dto.slug,
        id,
      );
    }

    if (
      dto.products !==
      undefined
    ) {
      await this.validateProducts(
        dto.products,
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        if (
          dto.products !==
          undefined
        ) {
          await tx.productCollection.deleteMany(
            {
              where: {
                collectionId:
                  id,
              },
            },
          );
        }

        await tx.collection.update(
          {
            where: {
              id,
            },

            data: {
              name:
                dto.name,

              slug:
                dto.slug,

              subtitle:
                dto.subtitle,

              description:
                dto.description,

              image:
                dto.image,

              isActive:
                dto.isActive,

              isFeatured:
                dto.isFeatured,

              sortOrder:
                dto.sortOrder,

              seoTitle:
                dto.seoTitle,

              seoDescription:
                dto.seoDescription,

              products:
                dto.products !==
                  undefined &&
                dto.products
                  .length >
                  0
                  ? {
                      create:
                        dto.products.map(
                          (
                            item,
                            index,
                          ) => ({
                            sortOrder:
                              item.sortOrder ??
                              index,

                            product: {
                              connect: {
                                id:
                                  item.productId,
                              },
                            },
                          }),
                        ),
                    }
                  : undefined,
            },
          },
        );
      },
    );

    const updated =
      await this.prisma.collection.findUnique(
        {
          where: {
            id,
          },

          include:
            this.collectionInclude,
        },
      );

    if (!updated) {
      throw new NotFoundException(
        'Koleksiyon bulunamadı.',
      );
    }

    return this.formatCollection(
      updated,
    );
  }

  async remove(
    id: string,
  ) {
    const collection =
      await this.prisma.collection.findUnique(
        {
          where: {
            id,
          },
        },
      );

    if (!collection) {
      throw new NotFoundException(
        'Koleksiyon bulunamadı.',
      );
    }

    await this.prisma.collection.delete(
      {
        where: {
          id,
        },
      },
    );

    return {
      success: true,

      message:
        'Koleksiyon başarıyla silindi.',
    };
  }
}