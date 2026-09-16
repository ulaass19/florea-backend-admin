import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateBalloonDto,
} from './dto/create-balloon.dto';

import {
  UpdateBalloonDto,
} from './dto/update-balloon.dto';

@Injectable()
export class BalloonsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  private readonly include = {
    images: {
      orderBy: {
        sortOrder:
          'asc' as const,
      },
    },

    variants: {
      orderBy: {
        sortOrder:
          'asc' as const,
      },
    },
  };

  private formatBalloon(
    balloon: any,
  ) {
    return {
      ...balloon,

      variants:
        balloon.variants?.map(
          (variant: any) => ({
            ...variant,

            price: Number(
              variant.price,
            ),
          }),
        ) ?? [],

      images:
        balloon.images ?? [],
    };
  }

  async findAll() {
    const balloons =
      await this.prisma.balloon.findMany(
        {
          include:
            this.include,

          orderBy: {
            createdAt:
              'desc',
          },
        },
      );

    return balloons.map(
      (balloon) =>
        this.formatBalloon(
          balloon,
        ),
    );
  }

  async findOne(
    slug: string,
  ) {
    const balloon =
      await this.prisma.balloon.findUnique(
        {
          where: {
            slug,
          },

          include:
            this.include,
        },
      );

    if (!balloon) {
      throw new NotFoundException(
        'Balon bulunamadı.',
      );
    }

    return this.formatBalloon(
      balloon,
    );
  }

  async create(
    dto: CreateBalloonDto,
  ) {
    const existing =
      await this.prisma.balloon.findUnique(
        {
          where: {
            slug: dto.slug,
          },

          select: {
            id: true,
          },
        },
      );

    if (existing) {
      throw new ConflictException(
        'Bu slug ile kayıtlı bir balon zaten var.',
      );
    }

    const balloon =
      await this.prisma.balloon.create(
        {
          data: {
            slug:
              dto.slug,

            name:
              dto.name,

            subtitle:
              dto.subtitle,

            description:
              dto.description,

            heroImage:
              dto.heroImage,

            isActive:
              dto.isActive ??
              true,

            isFeatured:
              dto.isFeatured ??
              false,

            seoTitle:
              dto.seoTitle,

            seoDescription:
              dto.seoDescription,

            images:
              dto.images
                ?.length
                ? {
                    create:
                      dto.images.map(
                        (
                          image,
                          index,
                        ) => ({
                          url:
                            image.url,

                          alt:
                            image.alt,

                          sortOrder:
                            image.sortOrder ??
                            index,
                        }),
                      ),
                  }
                : undefined,

            variants:
              dto.variants
                ?.length
                ? {
                    create:
                      dto.variants.map(
                        (
                          variant,
                          index,
                        ) => ({
                          name:
                            variant.name,

                          color:
                            variant.color,

                          size:
                            variant.size,

                          heliumIncluded:
                            variant.heliumIncluded ??
                            false,

                          price:
                            variant.price,

                          stockEnabled:
                            variant.stockEnabled ??
                            false,

                          stockQuantity:
                            variant.stockEnabled
                              ? variant.stockQuantity ??
                                0
                              : 0,

                          isActive:
                            variant.isActive ??
                            true,

                          sortOrder:
                            variant.sortOrder ??
                            index,
                        }),
                      ),
                  }
                : undefined,
          },

          include:
            this.include,
        },
      );

    return this.formatBalloon(
      balloon,
    );
  }

  async update(
    id: string,
    dto: UpdateBalloonDto,
  ) {
    const existing =
      await this.prisma.balloon.findUnique(
        {
          where: {
            id,
          },

          select: {
            id: true,
            slug: true,
          },
        },
      );

    if (!existing) {
      throw new NotFoundException(
        'Balon bulunamadı.',
      );
    }

    if (
      dto.slug &&
      dto.slug !==
        existing.slug
    ) {
      const slugExists =
        await this.prisma.balloon.findUnique(
          {
            where: {
              slug: dto.slug,
            },

            select: {
              id: true,
            },
          },
        );

      if (slugExists) {
        throw new ConflictException(
          'Bu slug ile kayıtlı başka bir balon var.',
        );
      }
    }

    const balloon =
      await this.prisma.$transaction(
        async (tx) => {
          if (
            dto.images !==
            undefined
          ) {
            await tx.balloonImage.deleteMany(
              {
                where: {
                  balloonId:
                    id,
                },
              },
            );
          }

          if (
            dto.variants !==
            undefined
          ) {
            await tx.balloonVariant.deleteMany(
              {
                where: {
                  balloonId:
                    id,
                },
              },
            );
          }

          return tx.balloon.update(
            {
              where: {
                id,
              },

              data: {
                slug:
                  dto.slug,

                name:
                  dto.name,

                subtitle:
                  dto.subtitle,

                description:
                  dto.description,

                heroImage:
                  dto.heroImage,

                isActive:
                  dto.isActive,

                isFeatured:
                  dto.isFeatured,

                seoTitle:
                  dto.seoTitle,

                seoDescription:
                  dto.seoDescription,

                images:
                  dto.images !==
                  undefined
                    ? {
                        create:
                          dto.images.map(
                            (
                              image,
                              index,
                            ) => ({
                              url:
                                image.url,

                              alt:
                                image.alt,

                              sortOrder:
                                image.sortOrder ??
                                index,
                            }),
                          ),
                      }
                    : undefined,

                variants:
                  dto.variants !==
                  undefined
                    ? {
                        create:
                          dto.variants.map(
                            (
                              variant,
                              index,
                            ) => ({
                              name:
                                variant.name,

                              color:
                                variant.color,

                              size:
                                variant.size,

                              heliumIncluded:
                                variant.heliumIncluded ??
                                false,

                              price:
                                variant.price,

                              stockEnabled:
                                variant.stockEnabled ??
                                false,

                              stockQuantity:
                                variant.stockEnabled
                                  ? variant.stockQuantity ??
                                    0
                                  : 0,

                              isActive:
                                variant.isActive ??
                                true,

                              sortOrder:
                                variant.sortOrder ??
                                index,
                            }),
                          ),
                      }
                    : undefined,
              },

              include:
                this.include,
            },
          );
        },
      );

    return this.formatBalloon(
      balloon,
    );
  }

  async remove(
    id: string,
  ) {
    const existing =
      await this.prisma.balloon.findUnique(
        {
          where: {
            id,
          },

          select: {
            id: true,
          },
        },
      );

    if (!existing) {
      throw new NotFoundException(
        'Balon bulunamadı.',
      );
    }

    await this.prisma.balloon.delete(
      {
        where: {
          id,
        },
      },
    );

    return {
      success: true,
      message:
        'Balon başarıyla silindi.',
    };
  }
}