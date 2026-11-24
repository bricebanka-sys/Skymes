using System;

namespace Core.Entities;

public class Address : BaseEntity
{
    public required string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public required string City { get; set; } = string.Empty;
    public string? State { get; set; } = string.Empty;
    public required string PostalCode { get; set; } = string.Empty;
    public required string Country { get; set; } = string.Empty;
}
