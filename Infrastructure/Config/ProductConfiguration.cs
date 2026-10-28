using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
  public void Configure(EntityTypeBuilder<Product> builder)
  {
    builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        // Je peux également configurer d'autres contraintes ici si nécessaire (ex: HasMaxLength)
    builder.Property(x => x.Name).IsRequired();
  }
}
