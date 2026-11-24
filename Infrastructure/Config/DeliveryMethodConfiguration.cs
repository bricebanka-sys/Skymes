using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Config;

public class DeliveryMethodConfiguration : IEntityTypeConfiguration<DeliveryMethod>
{
  public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<DeliveryMethod> builder)
  {
    builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
  }
}
